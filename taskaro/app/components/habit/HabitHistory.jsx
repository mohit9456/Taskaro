export default function HabitHistory() {
  const days = Array.from({ length: 14 });

  return (
    <div className="space-y-3">
      {days.map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-lg bg-gray-100 flex justify-between"
        >
          <span>Day {i + 1}</span>
          <span>✅ Completed</span>
        </div>
      ))}
    </div>
  );
}