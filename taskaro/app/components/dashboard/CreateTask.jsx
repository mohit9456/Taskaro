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
      <h1 className="text-xl md:text-2xl font-semibold my-6">
        Create New Task
      </h1>
      <div className="bg-(--card-bg) rounded-xl shadow w-[90%] mx-auto flex flex-wrap justify-center items-start gap-10 p-6">
        <div className="max-w-[45%] w-full text-xs md:text-sm">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2 mb-2 border rounded-2xl"
          />
          <div className="relative inline-block w-full">
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({ ...newTask, priority: e.target.value })
              }
              className="py-2 px-2 pr-12 border rounded-2xl mb-2 bg-(--card-bg) shadow appearance-none w-full"
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
              className="w-full p-2 border rounded-2xl text-left"
            >
              {selectedDate ? selectedDate.toDateString() : "Select Due Date"}
            </button>

            {showCalendar && (
              <div className="absolute z-20 mt-2 bg-(--card-bg) rounded-xl shadow p-2">
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
            className="w-full p-2 mb-4 border rounded-2xl bg-(--card-bg)"
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
            className="bg-green-500 text-white px-10 py-1 text-sm disabled: cursor-pointer rounded-2xl"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
        <div className="max-w-[45%] w-full text-xs md:text-sm">
          <textarea
            type="text"
            placeholder="Task Description"
            value={newTask.description}
            rows={3}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded-2xl"
          />
          <div className="relative inline-block w-full">
            <select
              value={newTask.assignTo}
              onChange={(e) =>
                setNewTask({ ...newTask, assignTo: e.target.value })
              }
              className="py-2 px-2 pr-12 border rounded-2xl mb-2 bg-(--card-bg) shadow appearance-none w-full"
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
