import { WorkoutSession } from '@/context/TrainingContext';
import { epley } from '@/components/common';

export function workoutVolume(workout: WorkoutSession) {
  return workout.exercises.reduce((total, entry) => total + entry.sets.reduce((sum, set) => set.completed ? sum + (Number(set.weight.replace(',', '.')) || 0) * (Number(set.reps) || 0) : sum, 0), 0);
}
export function bestRecords(workouts: WorkoutSession[]) {
  const records = new Map<string, { name: string; weight: number; e1rm: number; date: number }>();
  workouts.forEach((workout) => workout.exercises.forEach((entry) => entry.sets.forEach((set) => {
    if (!set.completed) return;
    const weight = Number(set.weight.replace(',', '.')) || 0;
    const reps = Number(set.reps) || 0;
    const estimate = epley(weight, reps);
    if (estimate > (records.get(entry.exerciseId)?.e1rm ?? 0)) records.set(entry.exerciseId, { name: entry.name, weight, e1rm: estimate, date: workout.completedAt });
  })));
  return Array.from(records.entries()).map(([exerciseId, record]) => ({ exerciseId, ...record })).sort((a, b) => b.e1rm - a.e1rm);
}
export function formatVolume(value: number) { return value >= 1000 ? (value / 1000).toFixed(1).replace('.', ',') + ' т' : Math.round(value) + ' кг'; }
