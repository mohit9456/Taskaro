export default function HabitOverview() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-green-100">
        <p className="text-sm">🔥 Active Streak</p>
        <h2 className="text-2xl font-bold">12 Days</h2>
      </div>

      <div className="p-4 rounded-xl bg-blue-100">
        <p className="text-sm">✅ Completion</p>
        <h2 className="text-2xl font-bold">78%</h2>
      </div>
    </div>
  );
}