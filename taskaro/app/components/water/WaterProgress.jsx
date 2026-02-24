export default function WaterProgress() {
  const current = 1850;
  const goal = 3000;
  const percent = Math.round((current / goal) * 100);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-400">
        <span>{current} ml</span>
        <span>{goal} ml</span>
      </div>

      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-cyan-400"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-gray-400">
        {percent}% completed • expected finish by <b>9:40 PM</b>
      </p>
    </div>
  );
}