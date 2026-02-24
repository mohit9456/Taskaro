import ExerciseCard from "./ExerciseCard.jsx";

export default function ExerciseList({ exercises, setExercises }) {
  const updateExercise = (id, updated) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? updated : e))
    );
  };

  return (
    <div className="space-y-4">
      {exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          onChange={(data) => updateExercise(ex.id, data)}
        />
      ))}
    </div>
  );
}