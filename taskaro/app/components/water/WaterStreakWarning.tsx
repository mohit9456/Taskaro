export default function WaterStreakWarning() {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
      <p className="text-sm text-red-400">
        ⚠️ You are <b>1 day away</b> from breaking your hydration streak
      </p>

      <p className="text-xs text-gray-400 mt-1">
        Missing today may reduce gym recovery score by 18%
      </p>
    </div>
  );
}