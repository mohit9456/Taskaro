export default function GymStats() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat label="Streak" value="5 days" icon="🔥" />
      <Stat label="Calories" value="420 kcal" icon="⚡" />
      <Stat label="Duration" value="52 min" icon="⏱️" />
    </div>
  );
}

const Stat = ({ label, value, icon }) => (
  <div className="rounded-xl bg-zinc-900 p-4 text-center">
    <p className="text-2xl">{icon}</p>
    <p className="text-lg font-semibold text-white">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);