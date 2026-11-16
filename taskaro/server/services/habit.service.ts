import Habit from "../models/Habit";
import User from "../models/User";
import { connectToDatabase } from "../db/mongodb";

/**
 * Helper to compute consecutive day streaks from YYYY-MM-DD dates array
 */
function calculateStreak(completedDates: string[]): { currentStreak: number; bestStreak: number } {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sortedDates = [...new Set(completedDates)].sort();
  const dateSet = new Set(sortedDates);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let currentStreak = 0;
  let checkDate = dateSet.has(todayStr) ? new Date(today) : dateSet.has(yesterdayStr) ? new Date(yesterday) : null;

  if (checkDate) {
    while (true) {
      const dStr = checkDate.toISOString().split("T")[0];
      if (dateSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate best streak historically
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const curDate = new Date(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = curDate;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
}

/**
 * LIST HABITS FOR USER
 */
export const listHabitsService = async ({ email }: { email: string }) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const habits = await Habit.find({
    userId: user._id,
    isArchived: false,
  }).sort({ createdAt: -1 });

  const todayStr = new Date().toISOString().split("T")[0];

  // Refresh dynamic streak and today status
  const formattedHabits = habits.map((h: any) => {
    const { currentStreak, bestStreak } = calculateStreak(h.completedDates || []);
    const isCompletedToday = (h.completedDates || []).includes(todayStr);

    return {
      ...h.toObject(),
      streak: currentStreak,
      bestStreak: Math.max(h.bestStreak || 0, bestStreak),
      isCompletedToday,
    };
  });

  // Calculate summary stats
  const total = formattedHabits.length;
  const completedToday = formattedHabits.filter((h: any) => h.isCompletedToday).length;
  const consistencyScore = total > 0 ? Math.round((completedToday / total) * 100) : 0;
  const bestOverallStreak = formattedHabits.reduce((max: number, h: any) => Math.max(max, h.streak), 0);

  return {
    habits: formattedHabits,
    stats: {
      total,
      completedToday,
      consistencyScore,
      bestOverallStreak,
    },
  };
};

/**
 * CREATE HABIT
 */
export const createHabitService = async ({
  email,
  title,
  description = "",
  category = "health",
  frequency = "daily",
  customDays = [],
  targetCount = 1,
  unit = "times",
  timeOfDay = "anytime",
  reminderTime = "",
  color = "#3b82f6",
  icon = "flame",
}: any) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  if (!title || !title.trim()) {
    throw { message: "Habit title is required", status: 400 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const habit = await Habit.create({
    userId: user._id,
    title: title.trim(),
    description: description.trim(),
    category,
    frequency,
    customDays: frequency === "custom" ? customDays : [],
    targetCount: Number(targetCount) || 1,
    unit: unit.trim() || "times",
    timeOfDay,
    reminderTime: reminderTime || "",
    color,
    icon,
    streak: 0,
    bestStreak: 0,
    completedDates: [],
    isActive: true,
    isArchived: false,
  });

  return habit;
};

/**
 * TOGGLE HABIT DAY COMPLETION
 */
export const toggleHabitDayService = async ({
  email,
  habitId,
  date,
}: {
  email: string;
  habitId: string;
  date?: string;
}) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  if (!habitId) {
    throw { message: "Habit ID is required", status: 400 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const habit = await Habit.findOne({ _id: habitId, userId: user._id });
  if (!habit) {
    throw { message: "Habit not found", status: 404 };
  }

  const targetDate = date || new Date().toISOString().split("T")[0];
  const datesSet = new Set<string>((habit.completedDates || []).map(String));

  let isNowCompleted = false;
  if (datesSet.has(targetDate)) {
    datesSet.delete(targetDate);
    isNowCompleted = false;
  } else {
    datesSet.add(targetDate);
    isNowCompleted = true;
  }

  const updatedDates: string[] = Array.from(datesSet);
  const { currentStreak, bestStreak } = calculateStreak(updatedDates);

  habit.completedDates = updatedDates;
  habit.streak = currentStreak;
  habit.bestStreak = Math.max(habit.bestStreak || 0, bestStreak);

  await habit.save();

  return {
    success: true,
    habitId,
    date: targetDate,
    isCompleted: isNowCompleted,
    streak: currentStreak,
    bestStreak: habit.bestStreak,
    completedDates: habit.completedDates,
  };
};

/**
 * UPDATE HABIT
 */
export const updateHabitService = async ({
  email,
  habitId,
  updates,
}: {
  email: string;
  habitId: string;
  updates: Record<string, any>;
}) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const habit = await Habit.findOne({ _id: habitId, userId: user._id });
  if (!habit) {
    throw { message: "Habit not found", status: 404 };
  }

  // Allowed fields
  const allowedFields = [
    "title",
    "description",
    "category",
    "frequency",
    "customDays",
    "targetCount",
    "unit",
    "timeOfDay",
    "reminderTime",
    "color",
    "icon",
    "isActive",
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      habit[field] = updates[field];
    }
  }

  await habit.save();
  return habit;
};

/**
 * DELETE / ARCHIVE HABIT
 */
export const deleteHabitService = async ({
  email,
  habitId,
}: {
  email: string;
  habitId: string;
}) => {
  await connectToDatabase();

  if (!email) {
    throw { message: "Unauthorized", status: 401 };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const habit = await Habit.findOneAndDelete({ _id: habitId, userId: user._id });
  if (!habit) {
    throw { message: "Habit not found", status: 404 };
  }

  return { success: true, habitId };
};
