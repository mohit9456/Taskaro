export default function WaterSmartReminder() {
  return (
    <div className="rounded-xl bg-(--card-bg) border border-(--color-border) p-4 space-y-3 transition-colors shadow-xs">
      <h3 className="font-medium text-indigo-500">Smart Reminder</h3>

      <p className="text-sm text-(--color-text)">
        ⏰ You usually miss water between <b>1–3 PM</b>
      </p>

      <p className="text-sm text-(--color-desc)">
        🌡️ Today is hot → recommended intake increased by <b>400ml</b>
      </p>

      <p className="text-xs text-(--color-desc)">
        Reminder adapts using weather + gym activity
      </p>
    </div>
  );
}