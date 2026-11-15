export default function WorkoutHistory({ history }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm text-gray-400">Workout History</h3>

      {history.map((h, i) => (
        <div
          key={i}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm flex justify-between"
        >
          <span>{h.exercise}</span>
          <span className="text-indigo-400">{h.calories} kcal</span>
        </div>
      ))}
    </div>
  );
}