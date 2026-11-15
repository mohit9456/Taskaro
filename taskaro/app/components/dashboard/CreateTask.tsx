"use client";

import { protectedApiPost } from "@/lib/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSearchParams } from "next/navigation";

const CreateTask = () => {
  const searchParams = useSearchParams();
  const dateFromCalendar = searchParams.get("date"); // yyyy-mm-dd

  const [loading, setLoading] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "",
    assignTo: "",
    dueDate: "",
  });

  useEffect(() => {
    if (dateFromCalendar) {
      const parsedDate = new Date(dateFromCalendar);
      setSelectedDate(parsedDate);
      updateDueDate(parsedDate, selectedTime);
    }
  }, [dateFromCalendar]);

  const addTask = async () => {
    try {
      setLoading(true);
      await protectedApiPost("/secure/tasks/create", newTask);
      toast.success("Your task created successfully! Put reminder");
      setNewTask({
        title: "",
        description: "",
        priority: "",
        assignTo: "",
        dueDate: "",
      });
    } catch (err) {
      toast.error(
        err?.response?.data.error ||
          err?.message ||
          "Task not added ! try again later",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateDueDate = (date, time) => {
    if (!date || !time) return;

    const [hours, minutes] = time.split(":");
    const combined = new Date(date);

    combined.setHours(hours);
    combined.setMinutes(minutes);
    combined.setSeconds(0);

    setNewTask((prev) => ({
      ...prev,
      dueDate: combined.toISOString(),
    }));
  };

  return (
    <>
      <h1 className="text-xl md:text-2xl font-semibold my-6 text-(--color-text)">
        Create New Task
      </h1>
      <div className="bg-(--card-bg) border border-(--color-border) text-(--color-text) rounded-xl shadow-xs w-[90%] mx-auto flex flex-wrap justify-center items-start gap-10 p-6 transition-colors">
        <div className="max-w-[45%] w-full text-xs md:text-sm">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2.5 mb-3 border border-(--color-border) bg-(--color-input) text-(--color-text) rounded-xl outline-none focus:border-(--color-primary)"
          />
          <div className="relative inline-block w-full">
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
              className="py-2.5 px-3 pr-12 border border-(--color-border) bg-(--color-input) text-(--color-text) rounded-xl mb-3 shadow-xs appearance-none w-full outline-none focus:border-(--color-primary)"
            >
              <option value="">Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <span className="pointer-events-none text-[9px] absolute right-4 top-1/2 -translate-y-1/2 text-(--color-desc)">
              ▼
            </span>
          </div>
          {/* DATE PICKER */}
          <div className="relative w-full mb-3">
            <button
              type="button"
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full p-2.5 border border-(--color-border) bg-(--color-input) text-(--color-text) rounded-xl text-left cursor-pointer"
            >
              {selectedDate ? selectedDate.toDateString() : "Select Due Date"}
            </button>

            {showCalendar && (
              <div className="absolute z-20 mt-2 bg-(--card-bg) border border-(--color-border) rounded-xl shadow-lg p-2">
                <Calendar
                  onChange={(date) => {
                    setSelectedDate(date);
                    updateDueDate(date, selectedTime);
                    setShowCalendar(false);
                  }}
                  minDate={new Date()}
                  className="react-calendar-custom"
                />
              </div>
            )}
          </div>

          {/* TIME PICKER */}
          <select
            value={selectedTime}
            onChange={(e) => {
              setSelectedTime(e.target.value);
              updateDueDate(selectedDate, e.target.value);
            }}
            className="w-full p-2.5 mb-4 border border-(--color-border) bg-(--color-input) text-(--color-text) rounded-xl outline-none focus:border-(--color-primary)"
          >
            {Array.from({ length: 24 }).map((_, h) =>
              ["00", "30"].map((m) => {
                const time = `${String(h).padStart(2, "0")}:${m}`;
                return (
                  <option key={time} value={time}>
                    {time}
                  </option>
                );
              }),
            )}
          </select>

          <button
            onClick={addTask}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-sm disabled:opacity-50 cursor-pointer rounded-xl font-medium transition-colors"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
        <div className="max-w-[45%] w-full text-xs md:text-sm">
          <textarea
            placeholder="Task Description"
            value={newTask.description}
            rows={3}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full p-2.5 mb-3 border border-(--color-border) bg-(--color-input) text-(--color-text) rounded-xl outline-none focus:border-(--color-primary)"
          />
          <div className="relative inline-block w-full">
            <select
              value={newTask.assignTo}
              onChange={(e) =>
                setNewTask({ ...newTask, assignTo: e.target.value })
              }
              className="py-2.5 px-3 pr-12 border border-(--color-border) bg-(--color-input) text-(--color-text) rounded-xl mb-3 shadow-xs appearance-none w-full outline-none focus:border-(--color-primary)"
            >
              <option value="">Assign To</option>
              <option value="self">Self</option>
            </select>
            <span className="pointer-events-none text-[9px] absolute right-4 top-1/2 -translate-y-1/2 text-(--color-desc)">
              ▼
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTask;
