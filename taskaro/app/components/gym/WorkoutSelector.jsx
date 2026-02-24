export default function WorkoutSelector({ value, onChange }) {
  const workouts = ["Push", "Pull", "Legs"];

  return (
    <div className="flex gap-3">
      {workouts.map((w) => (
        <button
          key={w}
          onClick={() => onChange(w)}
          className={`px-4 py-2 rounded-lg border ${
            value === w
              ? "bg-black text-white"
              : "bg-white text-black"
          }`}
        >
          {w}
        </button>
      ))}
    </div>
  );
}