import Link from "next/link";

export default function HabitCard({ habit }) {
  return (
    <Link href={`/habits/${habit.id}`}>
      <div className="p-4 rounded-xl border flex justify-between items-center hover:bg-gray-50">
        <div>
          <h3 className="font-semibold">
            {habit.emoji} {habit.title}
          </h3>
          <p className="text-xs text-gray-500">
            🔥 {habit.streak} day streak
          </p>
        </div>
        <div className="text-sm">{habit.progress}%</div>
      </div>
    </Link>
  );
}