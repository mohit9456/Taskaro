import Task from "../models/Task";
import Habit from "../models/Habit";
import User from "../models/User";
import { connectToDatabase } from "../db/mongodb";

export interface AnalyticsQueryOptions {
  email: string;
  range?: "7d" | "30d" | "90d" | "year";
}

/**
 * COMPREHENSIVE ANALYTICS SERVICE
 */
export const getAnalyticsService = async ({ email, range = "30d" }: AnalyticsQueryOptions) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  // Calculate startDate based on range
  const now = new Date();
  const startDate = new Date();
  let daysCount = 30;

  if (range === "7d") {
    daysCount = 7;
    startDate.setDate(now.getDate() - 7);
  } else if (range === "90d") {
    daysCount = 90;
    startDate.setDate(now.getDate() - 90);
  } else if (range === "year") {
    daysCount = 365;
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    // 30d default
    daysCount = 30;
    startDate.setDate(now.getDate() - 30);
  }

  // 1. Fetch user tasks within range (and active pending tasks)
  const allUserTasks = await Task.find({
    createdBy: user._id,
    isTrashed: false,
  }).sort({ createdAt: 1 });

  const tasksInRange = allUserTasks.filter((t: any) => new Date(t.createdAt) >= startDate);

  // 2. Fetch user habits for routine correlation
  const userHabits = await Habit.find({
    userId: user._id,
    isArchived: false,
  });

  // Calculate Overview Metrics
  const totalTasks = tasksInRange.length;
  const completedTasks = tasksInRange.filter((t: any) => t.status === "done").length;
  const inProgressTasks = tasksInRange.filter((t: any) => t.status === "inprogress").length;
  const todoTasks = tasksInRange.filter((t: any) => t.status === "todo").length;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const overdueTasks = tasksInRange.filter((t: any) => {
    if (!t.dueDate || t.status === "done") return false;
    return new Date(t.dueDate) < todayMidnight;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // On-Time Delivery Rate: Completed on or before dueDate
  const completedWithDue = tasksInRange.filter((t: any) => t.status === "done" && t.dueDate);
  const onTimeTasks = completedWithDue.filter((t: any) => {
    const due = new Date(t.dueDate);
    const completedAt = t.completedAt ? new Date(t.completedAt) : new Date(t.updatedAt || t.createdAt);
    return completedAt <= due;
  }).length;

  const onTimeRate =
    completedWithDue.length > 0
      ? Math.round((onTimeTasks / completedWithDue.length) * 100)
      : completedTasks > 0
      ? 100
      : 0;

  // Efficiency / Productivity Score (0 to 100)
  const highPriorityDone = tasksInRange.filter((t: any) => t.priority === "high" && t.status === "done").length;
  const highPriorityTotal = tasksInRange.filter((t: any) => t.priority === "high").length;
  const highPriorityWeight = highPriorityTotal > 0 ? (highPriorityDone / highPriorityTotal) * 20 : 15;

  const productivityScore = Math.min(
    100,
    Math.round(completionRate * 0.5 + onTimeRate * 0.3 + highPriorityWeight)
  );

  // Habit metrics
  const todayStr = now.toISOString().split("T")[0];
  const totalHabits = userHabits.length;
  const habitsDoneToday = userHabits.filter((h: any) => (h.completedDates || []).includes(todayStr)).length;
  const habitConsistency = totalHabits > 0 ? Math.round((habitsDoneToday / totalHabits) * 100) : 0;
  const topStreak = userHabits.reduce((max: number, h: any) => Math.max(max, h.streak || 0), 0);

  // 3. Execution Velocity Timeline (Daily / Weekly Buckets)
  const dateMap: Record<string, { date: string; label: string; created: number; completed: number }> = {};

  // Pre-fill last N days so charts look smooth and continuous
  const stepDays = daysCount <= 14 ? 1 : daysCount <= 30 ? 2 : 7;
  for (let i = daysCount; i >= 0; i -= stepDays) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dateMap[key] = { date: key, label, created: 0, completed: 0 };
  }

  // Populate actual data
  tasksInRange.forEach((task: any) => {
    const createdKey = new Date(task.createdAt).toISOString().split("T")[0];
    if (dateMap[createdKey]) {
      dateMap[createdKey].created++;
    }

    if (task.status === "done") {
      const doneDate = task.completedAt ? new Date(task.completedAt) : new Date(task.updatedAt || task.createdAt);
      const doneKey = doneDate.toISOString().split("T")[0];
      if (dateMap[doneKey]) {
        dateMap[doneKey].completed++;
      }
    }
  });

  const velocityTrend = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  // 4. Priority Breakdown Matrix
  const priorities = ["high", "medium", "low"] as const;
  const priorityBreakdown = priorities.map((p) => {
    const pTasks = tasksInRange.filter((t: any) => t.priority === p);
    const done = pTasks.filter((t: any) => t.status === "done").length;
    const inprogress = pTasks.filter((t: any) => t.status === "inprogress").length;
    const todo = pTasks.filter((t: any) => t.status === "todo").length;
    const total = pTasks.length;

    return {
      priority: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
      total,
      done,
      inprogress,
      todo,
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
      color: p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#3b82f6",
    };
  });

  // 5. Day-of-Week Rhythm (Productivity Heatmap by Weekday)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayRhythmMap: Record<string, { day: string; completed: number; created: number }> = {};
  weekdays.forEach((day) => {
    dayRhythmMap[day] = { day, completed: 0, created: 0 };
  });

  tasksInRange.forEach((task: any) => {
    const createdDay = weekdays[new Date(task.createdAt).getDay()];
    dayRhythmMap[createdDay].created++;

    if (task.status === "done") {
      const doneDate = task.completedAt ? new Date(task.completedAt) : new Date(task.updatedAt || task.createdAt);
      const doneDay = weekdays[doneDate.getDay()];
      dayRhythmMap[doneDay].completed++;
    }
  });

  const dayOfWeekActivity = weekdays.map((day) => dayRhythmMap[day]);
  const bestDay = dayOfWeekActivity.reduce((best, curr) => (curr.completed > best.completed ? curr : best), {
    day: "None",
    completed: 0,
  });

  // 6. Actionable AI-Style Smart Insights
  const insights: Array<{ type: "success" | "warning" | "info"; title: string; description: string }> = [];

  if (completionRate >= 75) {
    insights.push({
      type: "success",
      title: "Strong Execution Momentum",
      description: `You've achieved a ${completionRate}% completion rate this cycle. Your task closing velocity is in the top tier.`,
    });
  } else if (completionRate < 50 && totalTasks > 0) {
    insights.push({
      type: "warning",
      title: "Execution Velocity Lagging",
      description: "Over 50% of your tasks remain pending. Consider breaking large items into smaller sub-tasks.",
    });
  }

  if (overdueTasks > 0) {
    insights.push({
      type: "warning",
      title: `${overdueTasks} Overdue Task${overdueTasks > 1 ? "s" : ""} Detected`,
      description: "Delayed items are impacting your velocity score. Prioritize clearing overdue tasks in My Tasks.",
    });
  } else if (totalTasks > 0) {
    insights.push({
      type: "success",
      title: "Zero Overdue Backlog",
      description: "Clean sheet! All scheduled deadlines are up-to-date and under control.",
    });
  }

  if (bestDay.completed > 0) {
    insights.push({
      type: "info",
      title: `Power Day: ${bestDay.day}`,
      description: `You complete the highest volume of work on ${bestDay.day}s (${bestDay.completed} completed). Protect this focus block.`,
    });
  }

  if (habitConsistency >= 70 && totalHabits > 0) {
    insights.push({
      type: "success",
      title: "High Routine Synergy",
      description: `Your ${habitConsistency}% habit score is directly stabilizing your daily task velocity.`,
    });
  }

  // 7. Recent task ledger for audit and CSV export
  const tasksSummary = tasksInRange
    .slice(-50)
    .reverse()
    .map((t: any) => ({
      id: t._id.toString(),
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : null,
      createdAt: new Date(t.createdAt).toISOString().split("T")[0],
      completedAt: t.completedAt
        ? new Date(t.completedAt).toISOString().split("T")[0]
        : t.status === "done"
        ? new Date(t.updatedAt || t.createdAt).toISOString().split("T")[0]
        : null,
    }));

  return {
    range,
    kpis: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completionRate,
      onTimeRate,
      productivityScore,
      habitConsistency,
      topStreak,
      totalHabits,
    },
    velocityTrend,
    priorityBreakdown,
    dayOfWeekActivity,
    insights,
    bestDay: bestDay.day,
    tasksSummary,
  };
};
