"use client";
import { useState } from "react";

export const useWorkoutStore = () => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [history, setHistory] = useState([
    { date: "Mon", type: "Push", status: "Completed" },
    { date: "Tue", type: "Pull", status: "Completed" },
    { date: "Wed", type: "Rest", status: "Skipped" },
  ]);

  const exercises = [
    { name: "Bench Press", target: "Chest", suggestion: "40kg × 10" },
    { name: "Shoulder Press", target: "Shoulder", suggestion: "20kg × 10" },
    { name: "Tricep Pushdown", target: "Triceps", suggestion: "30kg × 12" },
  ];

  const startWorkout = () => {
    setStarted(true);
    setCompleted(false);
    setCurrentIndex(0);
  };

  const nextExercise = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
      setStarted(false);

      setHistory((prev) => [
        {
          date: "Today",
          type: "Push",
          status: "Completed",
        },
        ...prev,
      ]);
    }
  };

  return {
    started,
    completed,
    currentIndex,
    exercises,
    history,
    startWorkout,
    nextExercise,
  };
};