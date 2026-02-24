export default function WaterLog() {
  const logs = [
    { time: "08:10 AM", amount: 300 },
    { time: "11:45 AM", amount: 500 },
    { time: "03:20 PM", amount: 250 },
    { time: "07:30 PM", amount: 400 },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm text-gray-400">Today’s Log</h3>

      <div className="space-y-2">
        {logs.map((log, i) => (
          <div
            key={i}
            className="flex justify-between text-sm bg-zinc-800 rounded-lg px-3 py-2"
          >
            <span className="text-gray-300">{log.time}</span>
            <span className="text-blue-400">{log.amount} ml</span>
          </div>
        ))}
      </div>
    </div>
  );
}