export default function WorkoutSummary({ exercises }) {
  const totalSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.length,
    0
  );

  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  );

  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <h3 className="font-medium">Workout Summary</h3>

      <p className="mt-2">
        Completed {completedSets} / {totalSets} sets
      </p>

      <div className="w-full bg-gray-200 h-2 rounded mt-2">
        <div
          className="bg-black h-2 rounded"
          style={{
            width: `${(completedSets / totalSets) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}