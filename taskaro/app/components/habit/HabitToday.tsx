export default function HabitToday() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-blue-50">
        <p className="text-sm">Goal</p>
        <h2 className="text-2xl font-bold">8 Glasses</h2>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-3 bg-green-600 text-white rounded-xl">
          Mark Completed
        </button>
        <button className="px-4 py-3 bg-gray-200 rounded-xl">
          Undo
        </button>
      </div>

      <p className="text-xs text-gray-500">
        ⏰ Reminder at 9:00 AM • ☁️ Weather adaptive
      </p>
    </div>
  );
}