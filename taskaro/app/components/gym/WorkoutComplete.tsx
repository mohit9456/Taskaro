export default function WorkoutComplete() {
  return (
    <div className="rounded-xl bg-linear-to-br from-green-600 to-emerald-700 p-6 space-y-3">
      <h2 className="text-2xl font-bold">Workout Completed 🎉</h2>

      <p className="text-sm opacity-90">
        Calories burned increased your weekly score
      </p>

      <ul className="text-sm">
        <li>🔥 +1 Streak Day</li>
        <li>💧 Hydration need increased</li>
        <li>😴 Sleep quality expected +12%</li>
      </ul>
    </div>
  );
}