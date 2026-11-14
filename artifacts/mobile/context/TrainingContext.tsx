import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { findExercise, PlanExercise, workoutPlans } from '@/data/catalog';

const STORAGE_KEY = 'podhod-training-v1';

export interface SetEntry { id: string; weight: string; reps: string; completed: boolean; previousLabel: string | null; }
export interface ActivityLog { kind: 'running' | 'rounds'; durationMinutes: string; distanceKm?: string; rounds?: string; completed: boolean; }
export interface WorkoutExercise { id: string; exerciseId: string; name: string; sets: SetEntry[]; activity?: ActivityLog; }
export interface WorkoutSession { id: string; name: string; startedAt: number; completedAt: number; exercises: WorkoutExercise[]; tonnage: number; }
export interface ActiveWorkout { id: string; name: string; startedAt: number; exercises: WorkoutExercise[]; restUntil: number | null; }
interface PersistedState { activeWorkout: ActiveWorkout | null; workouts: WorkoutSession[]; savedPlanIds: string[]; restSeconds: number; }
export interface FinishSummary { session: WorkoutSession; personalRecords: Array<{ name: string; weight: number; e1rm: number }>; }
interface TrainingValue extends PersistedState {
  isReady: boolean;
  storageError: string | null;
  lastFinish: FinishSummary | null;
  startWorkout: (name?: string, planExercises?: PlanExercise[], restSeconds?: number) => void;
  addExercise: (exerciseId: string) => boolean;
  updateSet: (exerciseEntryId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
  toggleSet: (exerciseEntryId: string, setId: string) => boolean;
  updateActivity: (exerciseEntryId: string, field: 'durationMinutes' | 'distanceKm' | 'rounds', value: string) => void;
  toggleActivity: (exerciseEntryId: string) => boolean;
  addSet: (exerciseEntryId: string) => void;
  removeSet: (exerciseEntryId: string, setId: string) => void;
  setRestSeconds: (seconds: number) => void;
  finishWorkout: () => FinishSummary | null;
  discardWorkout: () => void;
  toggleSavedPlan: (planId: string) => void;
  exportBackup: () => string;
  importBackup: (json: string) => string;
}

const TrainingContext = createContext<TrainingValue | null>(null);
const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const numberValue = (value: string) => Number(value.replace(',', '.')) || 0;
const epley = (weight: number, reps: number) => weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;
const priorWorkoutFor = (exerciseId: string, workouts: WorkoutSession[]) => workouts
  .filter((workout) => workout.exercises.some((entry) => entry.exerciseId === exerciseId))
  .sort((a, b) => b.completedAt - a.completedAt)[0];

function makeWorkoutExercise(exerciseId: string, workouts: WorkoutSession[], count = 3, reps = '10'): WorkoutExercise | null {
  const exercise = findExercise(exerciseId);
  if (!exercise) return null;
  if (exercise.tracking === 'running') {
    return { id: makeId(), exerciseId, name: exercise.name, sets: [], activity: { kind: 'running', durationMinutes: '', distanceKm: '', completed: false } };
  }
  if (exercise.tracking === 'rounds') {
    return { id: makeId(), exerciseId, name: exercise.name, sets: [], activity: { kind: 'rounds', durationMinutes: '', rounds: '', completed: false } };
  }
  const prior = priorWorkoutFor(exerciseId, workouts)?.exercises.find((entry) => entry.exerciseId === exerciseId);
  const sets: SetEntry[] = Array.from({ length: count }, (_, index) => {
    const previous = prior?.sets[index] ?? prior?.sets[0];
    const previousWeight = previous ? numberValue(previous.weight) : 0;
    const previousReps = previous ? numberValue(previous.reps) : 0;
    return {
      id: makeId(), weight: '', reps: reps.match(/\d+/)?.[0] ?? '10', completed: false,
      previousLabel: previousWeight > 0 && previousReps > 0 ? previousWeight + ' кг × ' + previousReps : null,
    };
  });
  return { id: makeId(), exerciseId, name: exercise.name, sets };
}

function calculateRecord(workouts: WorkoutSession[], exerciseId: string) {
  let best = 0;
  workouts.forEach((workout) => workout.exercises.forEach((entry) => {
    if (entry.exerciseId !== exerciseId) return;
    entry.sets.forEach((set) => { if (set.completed) best = Math.max(best, epley(numberValue(set.weight), numberValue(set.reps))); });
  }));
  return best;
}

function validWorkoutExercise(value: unknown): value is WorkoutExercise {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<WorkoutExercise>;
  const activityValid = entry.activity === undefined || Boolean(entry.activity && typeof entry.activity === 'object' &&
    (entry.activity.kind === 'running' || entry.activity.kind === 'rounds') &&
    typeof entry.activity.durationMinutes === 'string' &&
    (entry.activity.distanceKm === undefined || typeof entry.activity.distanceKm === 'string') &&
    (entry.activity.rounds === undefined || typeof entry.activity.rounds === 'string') &&
    typeof entry.activity.completed === 'boolean');
  return typeof entry.id === 'string' && typeof entry.exerciseId === 'string' && typeof entry.name === 'string' &&
    activityValid && Array.isArray(entry.sets) && entry.sets.every((set) => Boolean(set && typeof set === 'object' &&
      typeof set.id === 'string' && typeof set.weight === 'string' && typeof set.reps === 'string' &&
      typeof set.completed === 'boolean' && (set.previousLabel === null || typeof set.previousLabel === 'string')));
}
function validWorkout(value: unknown): value is WorkoutSession {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<WorkoutSession>;
  return typeof item.id === 'string' && typeof item.name === 'string' &&
    typeof item.startedAt === 'number' && Number.isFinite(item.startedAt) &&
    typeof item.completedAt === 'number' && Number.isFinite(item.completedAt) &&
    typeof item.tonnage === 'number' && Number.isFinite(item.tonnage) &&
    Array.isArray(item.exercises) && item.exercises.every(validWorkoutExercise);
}
function validActiveWorkout(value: unknown): value is ActiveWorkout {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ActiveWorkout>;
  return typeof item.id === 'string' && typeof item.name === 'string' &&
    typeof item.startedAt === 'number' && Number.isFinite(item.startedAt) &&
    (item.restUntil === null || (typeof item.restUntil === 'number' && Number.isFinite(item.restUntil))) &&
    Array.isArray(item.exercises) && item.exercises.every(validWorkoutExercise);
}

function decodeBackup(value: unknown): PersistedState | null {
  if (!value || typeof value !== 'object') return null;
  const parsed = value as Partial<PersistedState> & { version?: number };
  if (parsed.version !== 1 || !Array.isArray(parsed.workouts) || !Array.isArray(parsed.savedPlanIds)) return null;
  if (parsed.activeWorkout !== null && !validActiveWorkout(parsed.activeWorkout)) return null;
  if (typeof parsed.restSeconds !== 'number' || parsed.restSeconds < 15 || parsed.restSeconds > 300) return null;
  if (!parsed.workouts.every(validWorkout)) return null;
  return {
    activeWorkout: parsed.activeWorkout,
    workouts: parsed.workouts as WorkoutSession[],
    savedPlanIds: parsed.savedPlanIds.filter((id): id is string => typeof id === 'string'),
    restSeconds: parsed.restSeconds,
  };
}

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedState>({ activeWorkout: null, workouts: [], savedPlanIds: [], restSeconds: 75 });
  const dataRef = useRef(data);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [lastFinish, setLastFinish] = useState<FinishSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const parsed = decodeBackup(JSON.parse(raw));
          if (parsed) { dataRef.current = parsed; setData(parsed); }
          else setStorageError('Сохранённые данные не удалось прочитать. Экспортируйте резервную копию перед импортом новых данных.');
        } catch { setStorageError('Сохранённые данные повреждены. Импортируйте резервную копию, чтобы восстановить историю.'); }
      }
      setIsReady(true);
    }).catch(() => {
      if (mounted) { setStorageError('Хранилище недоступно. Изменения пока останутся только на этом устройстве в памяти приложения.'); setIsReady(true); }
    });
    return () => { mounted = false; };
  }, []);

  const persist = useCallback((next: PersistedState) => {
    saveQueue.current = saveQueue.current.catch(() => undefined).then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...next })));
    saveQueue.current.then(() => setStorageError(null)).catch(() => setStorageError('Не удалось сохранить изменения на устройстве. Проверьте свободное место и создайте резервную копию.'));
  }, []);

  const commit = useCallback((update: (current: PersistedState) => PersistedState) => {
    const next = update(dataRef.current);
    dataRef.current = next;
    setData(next);
    persist(next);
    return next;
  }, [persist]);

  const startWorkout = useCallback((name = 'Свободная тренировка', planExercises?: PlanExercise[], restSeconds?: number) => {
    if (dataRef.current.activeWorkout) return;
    const current = dataRef.current;
    const exercises = planExercises?.map((item) => makeWorkoutExercise(item.exerciseId, current.workouts, item.sets, item.reps)).filter((item): item is WorkoutExercise => Boolean(item)) ?? [];
    commit((state) => ({ ...state, restSeconds: restSeconds ?? state.restSeconds, activeWorkout: { id: makeId(), name, startedAt: Date.now(), exercises, restUntil: null } }));
    setLastFinish(null);
  }, [commit]);

  const addExercise = useCallback((exerciseId: string) => {
    let added = false;
    commit((state) => {
      if (!state.activeWorkout || state.activeWorkout.exercises.some((entry) => entry.exerciseId === exerciseId)) return state;
      const entry = makeWorkoutExercise(exerciseId, state.workouts);
      if (!entry) return state;
      added = true;
      return { ...state, activeWorkout: { ...state.activeWorkout, exercises: [...state.activeWorkout.exercises, entry] } };
    });
    return added;
  }, [commit]);

  const updateSet = useCallback((exerciseEntryId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    commit((state) => {
      if (!state.activeWorkout) return state;
      return { ...state, activeWorkout: { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((entry) => entry.id !== exerciseEntryId ? entry : {
        ...entry, sets: entry.sets.map((set) => set.id !== setId ? set : { ...set, [field]: cleaned }),
      }) } };
    });
  }, [commit]);

  const toggleSet = useCallback((exerciseEntryId: string, setId: string) => {
    let allowed = true;
    commit((state) => {
      if (!state.activeWorkout) return state;
      let nextRestUntil = state.activeWorkout.restUntil;
      const exercises = state.activeWorkout.exercises.map((entry) => entry.id !== exerciseEntryId ? entry : {
        ...entry, sets: entry.sets.map((set) => {
          if (set.id !== setId) return set;
          const next = !set.completed;
          if (next && numberValue(set.reps) < 1) { allowed = false; return set; }
          nextRestUntil = next ? Date.now() + state.restSeconds * 1000 : null;
          return { ...set, completed: next };
        }),
      });
      return { ...state, activeWorkout: { ...state.activeWorkout, exercises, restUntil: nextRestUntil } };
    });
    return allowed;
  }, [commit]);

  const updateActivity = useCallback((exerciseEntryId: string, field: 'durationMinutes' | 'distanceKm' | 'rounds', value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    commit((state) => {
      if (!state.activeWorkout) return state;
      return { ...state, activeWorkout: { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((entry) => entry.id !== exerciseEntryId || !entry.activity ? entry : {
        ...entry, activity: { ...entry.activity, [field]: cleaned },
      }) } };
    });
  }, [commit]);

  const toggleActivity = useCallback((exerciseEntryId: string) => {
    let allowed = true;
    commit((state) => {
      if (!state.activeWorkout) return state;
      const exercises = state.activeWorkout.exercises.map((entry) => {
        if (entry.id !== exerciseEntryId || !entry.activity) return entry;
        const next = !entry.activity.completed;
        const duration = numberValue(entry.activity.durationMinutes);
        const secondary = entry.activity.kind === 'running' ? numberValue(entry.activity.distanceKm ?? '') : numberValue(entry.activity.rounds ?? '');
        if (next && (duration < 1 || (entry.activity.kind === 'rounds' && secondary < 1))) { allowed = false; return entry; }
        return { ...entry, activity: { ...entry.activity, completed: next } };
      });
      return { ...state, activeWorkout: { ...state.activeWorkout, exercises } };
    });
    return allowed;
  }, [commit]);

  const addSet = useCallback((exerciseEntryId: string) => commit((state) => {
    if (!state.activeWorkout) return state;
    return { ...state, activeWorkout: { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((entry) => entry.id !== exerciseEntryId ? entry : {
      ...entry, sets: [...entry.sets, { id: makeId(), weight: entry.sets.at(-1)?.weight ?? '', reps: entry.sets.at(-1)?.reps ?? '10', completed: false, previousLabel: entry.sets.at(-1)?.previousLabel ?? null }],
    }) } };
  }), [commit]);

  const removeSet = useCallback((exerciseEntryId: string, setId: string) => commit((state) => {
    if (!state.activeWorkout) return state;
    return { ...state, activeWorkout: { ...state.activeWorkout, exercises: state.activeWorkout.exercises.map((entry) => entry.id !== exerciseEntryId || entry.sets.length < 2 ? entry : { ...entry, sets: entry.sets.filter((set) => set.id !== setId) }) } };
  }), [commit]);

  const setRestSeconds = useCallback((seconds: number) => commit((state) => {
    const nextSeconds = Math.max(15, Math.min(300, seconds));
    const delta = nextSeconds - state.restSeconds;
    const active = state.activeWorkout;
    const restUntil = active?.restUntil ? Math.max(Date.now(), active.restUntil + delta * 1000) : active?.restUntil ?? null;
    return { ...state, restSeconds: nextSeconds, activeWorkout: active ? { ...active, restUntil } : null };
  }), [commit]);

  const finishWorkout = useCallback(() => {
    const current = dataRef.current;
    const active = current.activeWorkout;
    if (!active || !active.exercises.some((entry) => entry.sets.some((set) => set.completed) || entry.activity?.completed)) return null;
    let tonnage = 0;
    const personalRecords: FinishSummary['personalRecords'] = [];
    active.exercises.forEach((entry) => {
      const previousBest = calculateRecord(current.workouts, entry.exerciseId);
      let nextBest = previousBest;
      entry.sets.forEach((set) => {
        if (!set.completed) return;
        const weight = numberValue(set.weight);
        const reps = numberValue(set.reps);
        tonnage += weight * reps;
        const oneRepMax = epley(weight, reps);
        if (oneRepMax > nextBest) nextBest = oneRepMax;
      });
      if (nextBest > previousBest && nextBest > 0) personalRecords.push({ name: entry.name, weight: Math.round(nextBest * 10) / 10, e1rm: Math.round(nextBest * 10) / 10 });
    });
    const session: WorkoutSession = { ...active, completedAt: Date.now(), tonnage: Math.round(tonnage) };
    const summary = { session, personalRecords };
    commit((state) => ({ ...state, activeWorkout: null, workouts: [session, ...state.workouts] }));
    setLastFinish(summary);
    return summary;
  }, [commit]);

  const discardWorkout = useCallback(() => { commit((state) => ({ ...state, activeWorkout: null })); setLastFinish(null); }, [commit]);
  const toggleSavedPlan = useCallback((planId: string) => commit((state) => ({ ...state, savedPlanIds: state.savedPlanIds.includes(planId) ? state.savedPlanIds.filter((id) => id !== planId) : [...state.savedPlanIds, planId] })), [commit]);

  const exportBackup = useCallback(() => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...dataRef.current }, null, 2), []);
  const importBackup = useCallback((json: string) => {
    try {
      const parsed = decodeBackup(JSON.parse(json));
      if (!parsed) return 'Файл не похож на резервную копию приложения. Данные не изменены.';
      dataRef.current = parsed;
      setData(parsed);
      setLastFinish(null);
      persist(parsed);
      return 'Резервная копия импортирована.';
    } catch { return 'Не удалось прочитать JSON. Проверьте текст файла и попробуйте ещё раз.'; }
  }, [persist]);

  const value = useMemo<TrainingValue>(() => ({ ...data, isReady, storageError, lastFinish, startWorkout, addExercise, updateSet, toggleSet, updateActivity, toggleActivity, addSet, removeSet, setRestSeconds, finishWorkout, discardWorkout, toggleSavedPlan, exportBackup, importBackup }), [data, isReady, storageError, lastFinish, startWorkout, addExercise, updateSet, toggleSet, updateActivity, toggleActivity, addSet, removeSet, setRestSeconds, finishWorkout, discardWorkout, toggleSavedPlan, exportBackup, importBackup]);
  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

export function useTraining() {
  const value = useContext(TrainingContext);
  if (!value) throw new Error('useTraining must be used within TrainingProvider');
  return value;
}

export function getPlanLabel(planId: string) { return workoutPlans.find((plan) => plan.id === planId)?.title ?? 'Тренировка'; }
