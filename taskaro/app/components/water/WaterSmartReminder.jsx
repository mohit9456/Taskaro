export default function WaterSmartReminder() {
  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
      <h3 className="font-medium text-indigo-400">Smart Reminder</h3>

      <p className="text-sm text-gray-300">
        ⏰ You usually miss water between <b>1–3 PM</b>
      </p>

      <p className="text-sm text-gray-400">
        🌡️ Today is hot → recommended intake increased by <b>400ml</b>
      </p>

      <p className="text-xs text-gray-500">
        Reminder adapts using weather + gym activity
      </p>
    </div>
  );
}