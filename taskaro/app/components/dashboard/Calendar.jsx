"use client";

import React, { useEffect, useState } from "react";
import { LuCalendarDays, LuClock, LuInfo, LuPlus } from "react-icons/lu";
import Calendar from "react-calendar"; // For the calendar component
import "react-calendar/dist/Calendar.css";
import { protectedApiGet } from "@/lib/api";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

const CalendarSection = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, day
  const [filterPriority, setFilterPriority] = useState("all");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Filter tasks based on selected date and priority
  const tasksForDate = tasks.filter((task) => {
    const taskDate = new Date(task.dueDate);
    const isSameDate = taskDate.toDateString() === selectedDate.toDateString();
    const priorityMatch =
      filterPriority === "all" || task.priority === filterPriority;
    return isSameDate && priorityMatch && task.status !== "done";
  });

  const upcomingTasks = tasks
    .filter(
      (task) => new Date(task.dueDate) >= new Date() && task.status !== "done",
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10); // Show next 10 upcoming

  // Custom tile content to show task indicators on calendar dates
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayTasks = tasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.toDateString() === date.toDateString() &&
          task.status !== "done"
        );
      });
      if (dayTasks.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        );
      }
    }
    return null;
  };

  // Handle date click
  const onDateClick = (date) => {
    setSelectedDate(date);
  };

  const isSameDay = (date1, date2) =>
    date1.toDateString() === date2.toDateString();

  const isSameWeek = (date, selected) => {
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return date >= start && date <= end;
  };

  const isSameMonth = (date, selected) =>
    date.getMonth() === selected.getMonth() &&
    date.getFullYear() === selected.getFullYear();

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      if (viewMode === "day" && isSameDay(date, selectedDate)) {
        return "cal-selected";
      }

      if (viewMode === "week" && isSameWeek(date, selectedDate)) {
        return "cal-week-selected";
      }
    }

    if (view === "year") {
      if (isSameMonth(date, selectedDate)) {
        return "cal-month-selected";
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold mb-4 flex items-center gap-2">
        <LuCalendarDays size={24} className="text-blue-500" />
        Calendar View
      </h1>

      {/* Controls */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[70vh]">
          <Loader />
        </div>
      ) : (
        <div className="bg-(--card-bg) rounded-xl shadow p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-lg font-semibold">Schedule Your Tasks</h2>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <div className="relative inline-block">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="py-1 px-4 pr-12 border rounded-lg bg-(--card-bg) shadow appearance-none w-full"
                >
                  <option value="month">Month</option>
                  <option value="week">Week</option>
                  <option value="day">Day</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--color-desc)">
                  ▼
                </span>
              </div>
              <div className="relative inline-block">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="py-1 px-4 pr-12 border rounded-lg bg-(--card-bg) shadow appearance-none w-full"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--color-desc)">
                  ▼
                </span>
              </div>
              <button
                onClick={() => {
                  const dateParam = selectedDate.toISOString().split("T")[0];
                  router.push(`/dashboard/create-task?date=${dateParam}`);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition"
              >
                <LuPlus size={16} /> Add Task to Date
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div className="mb-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              onClickDay={onDateClick}
              tileClassName={tileClassName}
              tileContent={tileContent}
              className="react-calendar-custom"
              view={
                viewMode === "day" || viewMode === "week" ? "month" : "year"
              }
            />
          </div>

          {/* Selected Date Tasks */}
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
              <LuClock size={18} className="text-gray-500" />
              Tasks for {selectedDate.toDateString()}
            </h3>
            {tasksForDate.length > 0 ? (
              <ul className="space-y-2">
                {tasksForDate.map((task) => (
                  <li
                    key={task.id}
                    className="flex justify-between items-center border p-3 rounded-lg hover:bg-(--color-bg) transition cursor-pointer"
                    onClick={() => alert(`Edit task: ${task.title}`)} // Placeholder for navigation
                  >
                    <div>
                      <span className="font-medium">{task.title}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        Priority: {task.priority}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        task.status === "IN PROGRESS"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {task.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No tasks for this date.</p>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div>
            <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
              <LuInfo size={18} className="text-gray-500" />
              Upcoming Tasks
            </h3>
            <ul className="space-y-2">
              {upcomingTasks.map((task) => (
                <li
                  key={task._id}
                  className="flex justify-between items-center border p-3 rounded-lg hover:bg-(--color-bg) transition"
                >
                  <span>{task.title}</span>
                  <span className="text-sm text-gray-500">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "---"}
                  </span>
                </li>
              ))}
            </ul>
            {upcomingTasks.length === 0 && (
              <p className="text-sm text-gray-500">No upcoming tasks.</p>
            )}
          </div>
        </div>
      )}

      {/* Productivity Tip */}
      <div className="bg-linear-to-r from-green-400 to-blue-500 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">📅 Calendar Tip</h2>
        <p className="text-green-100">
          Use the calendar to visualize your deadlines and plan your week ahead.
          Taskaro helps you stay on track!
        </p>
      </div>
    </div>
  );
};

export default CalendarSection;
