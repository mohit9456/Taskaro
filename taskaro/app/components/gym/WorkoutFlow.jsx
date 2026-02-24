import ExerciseCard from "./ExerciseCard";

export default function WorkoutFlow({ workout }) {
    const exercises = [
  { name: "Bench Press", type: "Indoor", met: 6 },
  { name: "Push Ups", type: "Indoor", met: 8 },
  { name: "Running", type: "Outdoor", met: 10 },
  { name: "Cycling", type: "Outdoor", met: 9 },
];
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">
        Choose Exercise
      </h3>

      {exercises.map((ex) => (
        <ExerciseCard key={ex.name} ex={ex} workout={workout} />
      ))}
    </div>
  );
}