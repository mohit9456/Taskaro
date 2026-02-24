export default function WaterQuickAdd() {
  const amounts = [200, 300, 500, 750];

  return (
    <div className="space-y-3">
      <h3 className="text-sm text-gray-400">Quick Add</h3>

      <div className="grid grid-cols-4 gap-2">
        {amounts.map((ml) => (
          <button
            key={ml}
            className="rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm py-2"
          >
            +{ml}ml
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        Custom bottles detected from your history
      </p>
    </div>
  );
}