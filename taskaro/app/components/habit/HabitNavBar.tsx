"use client";
export default function HabitNavbar() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {["Overview", "My Habits", "Insights", "Create"].map(tab => (
        <button
          key={tab}
          className="px-4 py-2 rounded-full bg-gray-100 text-sm whitespace-nowrap"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}