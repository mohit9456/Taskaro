export default function GymDashboard({ onStart }) {
  return (
    <div className="rounded-xl bg-zinc-900 p-6 space-y-4">
      <h3 className="text-lg font-medium text-white">
        Ready to Train?
      </h3>

      <p className="text-sm text-gray-400">
        Based on your past workouts, today is best for:
        <b className="text-indigo-400"> Chest + Cardio</b>
      </p>

      <button
        onClick={onStart}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700"
      >
        ▶ Start Workout
      </button>
    </div>
  );
}