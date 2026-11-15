import ExerciseCard from "./ExerciseCard";

export default function ExerciseList({ exercises, setExercises, workout }: any) {
  const updateExercise = (id: any, updated: any) => {
    setExercises((prev: any[]) =>
      prev.map((e) => (e.id === id ? updated : e))
    );
  };

  return (
    <div className="space-y-4">
      {exercises.map((ex: any) => (
        <ExerciseCard
          key={ex.id}
          ex={ex}
          workout={workout}
        />
      ))}
    </div>
  );
}