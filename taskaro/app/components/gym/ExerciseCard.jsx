export default function ExerciseCard({ ex, workout }) {
  const duration = 10; // minutes
  const calories = Math.round(ex.met * 3.5 * 70 * duration / 200);

  return (
    <div className="rounded-xl bg-zinc-900 p-4 space-y-2">
      <div className="flex justify-between">
        <h4 className="text-white font-medium">
          {ex.name}
        </h4>
        <span className="text-xs text-gray-400">
          {ex.type === "Indoor" ? "🏠 Indoor" : "🌳 Outdoor"}
        </span>
      </div>

      <p className="text-sm text-gray-400">
        ~ {calories} kcal in {duration} min
      </p>

      <button
        onClick={() => workout.completeExercise(ex, calories)}
        className="w-full mt-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
      >
        ✔ Mark Completed
      </button>
    </div>
  );
}