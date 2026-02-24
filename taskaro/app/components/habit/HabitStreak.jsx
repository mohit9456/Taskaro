export default function HabitStreak() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-100 rounded-xl">
        <h3 className="font-semibold">🔥 Current Streak</h3>
        <p className="text-2xl">12 Days</p>
      </div>

      <div className="p-4 bg-red-100 rounded-xl">
        ⚠️ If you miss tomorrow, streak will break
      </div>
    </div>
  );
}