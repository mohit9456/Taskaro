"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LuPlus, LuClock, LuTrendingUp, LuUser } from "react-icons/lu";
import { HiCheckCircle } from "react-icons/hi2";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"; // For advanced charts
import { useSession } from "next-auth/react";
import { protectedApiGet } from "@/lib/api";
import { useRouter } from "next/navigation";

const DashboardContent = () => {
  const { data } = useSession();

  const [timeFilter, setTimeFilter] = useState("week"); // For interactivity: filter charts by time
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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

  const completedTasks = filteredTasks.filter(
    (task) => task.status === "done",
  ).length;
  const pendingTasks = filteredTasks.filter(
    (task) => task.status !== "done",
  ).length;
  const completionRate =
    filteredTasks.length > 0
      ? Math.round((completedTasks / filteredTasks.length) * 100)
      : 0;

  // Sample data for advanced charts (in real app, fetch from API based on timeFilter)
  const chartData = useMemo(() => {
    const map = {};

    filteredTasks.forEach((task) => {
      const d = new Date(task.dueDate);

      let key = "";

      if (timeFilter === "week") {
        key = d.toLocaleDateString("en-US", { weekday: "short" });
      }

      if (timeFilter === "month") {
        key = d.getDate().toString(); // 1,2,3...
      }

      if (timeFilter === "year") {
        key = d.toLocaleDateString("en-US", { month: "short" });
      }

      if (!map[key]) {
        map[key] = { name: key, completed: 0, pending: 0 };
      }

      if (task.status === "done") {
        map[key].completed += 1;
      } else {
        map[key].pending += 1;
      }
    });

    return Object.values(map);
  }, [filteredTasks, timeFilter]);

  const pieData = [
    { name: "Completed", value: completedTasks, color: "#10B981" },
    { name: "Pending", value: pendingTasks, color: "#F59E0B" },
  ];

  const recentTasks = tasks.slice(0, 3); // Show last 5 tasks

  const productivityTips = [
    "Break down large tasks into smaller steps for better focus.",
    "Use the Pomodoro technique: 25 minutes work, 5 minutes break.",
    "Prioritize tasks with high impact first.",
  ];

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Section */}
      <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {data?.user?.name ?? "User"}! 👋
            </h1>
            <p className="text-blue-100">
              Ready to conquer your tasks today? Taskaro is here to help you
              stay organized and productive.
            </p>
          </div>
          <LuUser size={48} className="hidden md:block" />
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => router.push("/dashboard/create-task")}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <LuPlus size={16} className="inline mr-2" /> Add Task
          </button>
          <button
            onClick={() => router.push("/dashboard/my-tasks")}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            View All Tasks
          </button>
        </div>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Tasks"
          value={tasks.length}
          icon={<HiCheckCircle size={24} />}
          color="bg-blue-500"
          onClick={() => alert("Navigate to Tasks page")} // Interactive: clickable
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={<LuTrendingUp size={24} />}
          color="bg-green-500"
          onClick={() => alert("View completed tasks")}
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          icon={<LuClock size={24} />}
          color="bg-yellow-500"
          onClick={() => alert("View pending tasks")}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<LuTrendingUp size={24} />}
          color="bg-purple-500"
          onClick={() => alert("View detailed reports")}
        />
      </div>

      {/* Time Filter for Charts */}
      <div className="flex justify-center">
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
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart: Task Completion Over Time */}
        <div className="bg-(--card-bg) rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Task Completion Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="completed" fill="#10B981" name="Completed" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Task Status Distribution */}
        <div className="bg-(--card-bg) rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Task Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="bg-(--card-bg) rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
        <ul className="space-y-3">
          {recentTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between border p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 cursor-pointer transition"
              onClick={() => alert(`Edit task: ${task.title}`)} // Interactive: click to edit
            >
              <div>
                <span
                  className={
                    task.status === "DONE" ? "line-through text-gray-500" : ""
                  }
                >
                  {task.title}
                </span>
                <div className="text-xs text-gray-500 mt-1">
                  Priority: {task.priority} | Due: {task.dueDate}
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  task.status === "DONE"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {task.status}
              </span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => router.push("/dashboard/my-tasks")}
          className="mt-4 text-blue-600 hover:underline cursor-pointer"
        >
          View All Tasks
        </button>
      </div>

      {/* Productivity Tips Section */}
      <div className="bg-linear-to-r from-green-400 to-blue-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">💡 Productivity Tip</h2>
        <p className="text-green-100">
          {
            productivityTips[
              Math.floor(Math.random() * productivityTips.length)
            ]
          }
        </p>
        <p className="text-sm mt-2 opacity-80">Stay productive with Taskaro!</p>
      </div>
    </div>
  );
};

export default DashboardContent;

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${color} text-white rounded-xl shadow p-5 cursor-pointer hover:shadow-lg transition transform hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm opacity-90">{title}</p>
        {icon}
      </div>
      <h3 className="text-2xl md:text-3xl font-bold">{value}</h3>
    </div>
  );
}
