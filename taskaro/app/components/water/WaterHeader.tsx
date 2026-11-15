export default function WaterHeader() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold text-white">
        💧 {greeting}, stay hydrated
      </h1>
      <p className="text-sm text-gray-400">
        Hydration affects your gym performance, focus & recovery
      </p>
    </div>
  );
}