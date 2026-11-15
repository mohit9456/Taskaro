export default function WaterQuickAdd() {
  const amounts = [200, 300, 500, 750];

  return (
    <div className="space-y-3">
      <h3 className="text-sm text-(--color-desc)">Quick Add</h3>

      <div className="grid grid-cols-4 gap-2">
        {amounts.map((ml) => (
          <button
            key={ml}
            className="rounded-lg bg-(--hover-card-bg) hover:bg-(--color-border) border border-(--color-border) text-(--color-text) text-sm py-2 font-medium transition-colors cursor-pointer"
          >
            +{ml}ml
          </button>
        ))}
      </div>

      <p className="text-xs text-(--color-desc)">
        Custom bottles detected from your history
      </p>
    </div>
  );
}