"use client";
import GymHeader from "@/app/components/gym/GymHeader";
import GymStats from "@/app/components/gym/GymStats";
import GymDashboard from "@/app/components/gym/GymDashboard";
import WorkoutFlow from "@/app/components/gym/WorkoutFlow";
import WorkoutComplete from "@/app/components/gym/WorkoutComplete";
import WorkoutHistory from "@/app/components/gym/WorkoutHistory";
import { useWorkoutStore } from "@/app/components/gym/useWorkoutStore";

const GymPage = () => {
  const workout = useWorkoutStore();

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <GymHeader />
      <GymStats />

      {!workout.started && !workout.completed && (
        <GymDashboard onStart={workout.startWorkout} />
      )}

      {workout.started && <WorkoutFlow workout={workout} />}

      {workout.completed && <WorkoutComplete />}

      <WorkoutHistory history={workout.history} />
    </div>
  );
};

export default GymPage;