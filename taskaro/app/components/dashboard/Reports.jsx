"use client";

import { protectedApiGet } from "@/lib/api";
import React, { useEffect, useState } from "react";
import {
  HiChartBar,
  HiCheckCircle,
  HiExclamationTriangle,
} from "react-icons/hi2";
import { LuClock, LuDownload, LuTarget, LuTrendingUp } from "react-icons/lu";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Reports = () => {
  const [timeFilter, setTimeFilter] = useState("week"); // For filtering data
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const data = await protectedApiGet("/secure/tasks/list");
        // 🗑️ trash waale hata do
        const activeTasks = data?.task;
        setTasks(activeTasks);
      } catch (error) {
        toast.error(
          error?.response.data.error ||
            error?.message ||
            "something went wrong !",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, []);

  const isSameWeek = (date) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return date >= start && date <= end;
  };

  const isSameMonth = (date) => {
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isSameYear = (date) => {
    return date.getFullYear() === new Date().getFullYear();
  };

  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.dueDate);

    if (timeFilter === "week") return isSameWeek(taskDate);
    if (timeFilter === "month") return isSameMonth(taskDate);
    if (timeFilter === "year") return isSameYear(taskDate);

    return true;
  });

  // Calculate stats
  const highPriority = filteredTasks.filter(
    (task) => task.priority === "high",
  ).length;

  const mediumPriority = filteredTasks.filter(
    (task) => task.priority === "medium",
  ).length;

  const lowPriority = filteredTasks.filter(
    (task) => task.priority === "low",
  ).length;

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "done",
  ).length;

  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "inprogress",
  ).length;

  const todoTasks = filteredTasks.filter(
    (task) => task.status === "todo",
  ).length;

  const overdueTasks = filteredTasks.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "done",
  ).length;

  const averageTasksPerDay =
    timeFilter === "week"
      ? Math.round(totalTasks / 7)
      : timeFilter === "month"
        ? Math.round(totalTasks / 30)
        : Math.round(totalTasks / 365);

  const productivityScore = Math.min(
    100,
    Math.round(
      (completedTasks / totalTasks) * 100 + (highPriority / totalTasks) * 20,
    ),
  ); // Custom score

  const completionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Data for charts
  const priorityData = [
    { name: "high", value: highPriority, color: "#EF4444" },
    { name: "medium", value: mediumPriority, color: "#F59E0B" },
    { name: "low", value: lowPriority, color: "#10B981" },
  ];

  const statusData = [
    { name: "todo", count: todoTasks },
    { name: "inprogress", count: inProgressTasks },
    { name: "done", count: completedTasks },
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const generateTrendData = () => {
    const map = {};

    filteredTasks.forEach((task) => {
      const date = new Date(task.dueDate);

      let key = "";

      if (timeFilter === "week") {
        key = weekDays[date.getDay()];
      } else if (timeFilter === "month") {
        key = date.getDate(); // 1–31
      } else if (timeFilter === "year") {
        key = months[date.getMonth()];
      }

      if (!map[key]) {
        map[key] = { label: key, completed: 0, total: 0 };
      }

      map[key].total += 1;
      if (task.status === "done") {
        map[key].completed += 1;
      }
    });

    return Object.values(map);
  };

  const trendData = generateTrendData();

  // Export report as PDF or image (placeholder)
  const exportReport = () => {
    alert(
      "Exporting report... (Integrate with jsPDF or html2canvas for real export)",
    );
  };

  // Insights based on data
  const insights = [];
  if (overdueTasks > 0)
    insights.push(
      "You have overdue tasks. Prioritize them to improve productivity.",
    );
  if (completionRate < 50)
    insights.push(
      "Your completion rate is low. Try breaking tasks into smaller steps.",
    );
  if (highPriority > mediumPriority + lowPriority)
    insights.push("Focus on high-priority tasks to maximize impact.");
  if (insights.length === 0)
    insights.push("Great job! Your task management is on track.");

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
        <HiChartBar size={24} className="text-blue-500" />
        Reports & Analytics
      </h1>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="relative inline-block">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="py-1 px-4 pr-12 border rounded-lg bg-(--card-bg) shadow appearance-none w-full"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--color-desc)">
            ▼
          </span>
        </div>
        <button
          onClick={exportReport}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
        >
          <LuDownload size={16} /> Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCards
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<LuTrendingUp size={24} />}
          color="bg-green-500"
        />
        <StatCards
          title="Productivity Score"
          value={`${productivityScore}/100`}
          icon={<LuTarget size={24} />}
          color="bg-blue-500"
        />
        <StatCards
          title="Overdue Tasks"
          value={overdueTasks}
          icon={<HiExclamationTriangle size={24} />}
          color="bg-red-500"
        />
        <StatCards
          title="Avg Tasks/Day"
          value={averageTasksPerDay}
          icon={<LuClock size={24} />}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart: Priority Distribution */}
        <div className="bg-(--card-bg) rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Status Breakdown */}
        <div className="bg-(--card-bg) rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Task Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart: Completion Trend */}
        <div className="bg-(--card-bg) rounded-xl shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Completion Trend Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#F59E0B"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HiCheckCircle size={20} />
          Insights & Recommendations
        </h2>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="text-blue-100">
              • {insight}
            </li>
          ))}
        </ul>
        <p className="text-sm mt-4 opacity-80">
          Taskaro analyzes your data to help you improve productivity. Keep
          tracking your tasks!
        </p>
      </div>

      {/* Additional Stats Table */}
      <div className="bg-(--card-bg) rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Detailed Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Metric</th>
              <th className="text-left py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Total Tasks</td>
              <td className="py-2">{totalTasks}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Completed Tasks</td>
              <td className="py-2">{completedTasks}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">In Progress</td>
              <td className="py-2">{inProgressTasks}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">To-Do</td>
              <td className="py-2">{todoTasks}</td>
            </tr>
            <tr>
              <td className="py-2">Overdue</td>
              <td className="py-2">{overdueTasks}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;

// Reusable StatCard
function StatCards({ title, value, icon, color }) {
  return (
    <div className={`${color} text-white rounded-xl shadow p-5`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm opacity-90">{title}</p>
        {icon}
      </div>
      <h3 className="text-2xl md:text-3xl font-bold">{value}</h3>
    </div>
  );
}
