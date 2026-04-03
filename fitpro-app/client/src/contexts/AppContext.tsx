/**
 * FitPro — AppContext
 * Design: Premium Dark Fitness
 * Global state management with localStorage persistence.
 * Structured for future React Native / mobile conversion.
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { nanoid } from 'nanoid';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Goal = 'ganhar_massa' | 'perder_gordura' | 'manter_peso' | 'definicao' | 'resistencia';

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: Goal;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  avatarUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number; // kg
  restSeconds: number;
  notes?: string;
  completed?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  muscleGroups: string[];
  exercises: Exercise[];
  createdAt: string;
  lastPerformed?: string;
  durationMinutes?: number;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
  quantity: number;
  unit: string;
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export interface Meal {
  id: string;
  type: MealType;
  foods: Food[];
}

export interface DietDay {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  notes?: string;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  chest?: number;
  waist?: number;
  hips?: number;
  thigh?: number;
  arm?: number;
  calf?: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  dataUrl: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  date: string;
  completedExercises: string[]; // exercise ids
  durationSeconds: number;
  notes?: string;
  exerciseDetails?: Record<string, { weight: number; reps: number; sets: number }>; // track actual performance
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  objective: Goal;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  durationWeeks: number;
  workouts: Workout[];
  createdAt: string;
}

export interface OneRMCalculation {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
  date: string;
}

export interface NotificationReminder {
  id: string;
  type: 'workout' | 'meal' | 'water' | 'weight_check';
  enabled: boolean;
  time: string; // HH:MM format
  frequency: 'daily' | 'weekly' | 'custom';
}

export type ThemeColor = 'green' | 'blue' | 'pink';

export interface UserPreferences {
  theme: ThemeColor;
  notifications: NotificationReminder[];
  offlineMode: boolean;
  lastSyncTime?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  condition: 'first_workout' | 'streak_7' | 'streak_30' | 'weight_goal' | 'photo_milestone' | 'diet_perfect_day' | 'pr_achieved';
}

export interface UserStats {
  totalPoints: number;
  currentStreak: number; // dias seguidos
  longestStreak: number;
  totalWorkouts: number;
  totalDietDays: number;
  badges: Badge[];
  personalRecords: Record<string, number>; // exerciseName -> maxWeight
  lastWorkoutDate?: string;
  oneRMHistory: OneRMCalculation[];
  volumeHistory: Array<{ date: string; exercise: string; volume: number }>; // weight * reps * sets
}

export interface AppState {
  profile: UserProfile;
  workouts: Workout[];
  todayWorkoutId: string | null;
  dietDays: DietDay[];
  weightEntries: WeightEntry[];
  measurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
  workoutSessions: WorkoutSession[];
  stats: UserStats;
  workoutPlans: WorkoutPlan[];
  preferences: UserPreferences;
}

// ─── Default State ────────────────────────────────────────────────────────────

const defaultProfile: UserProfile = {
  name: 'Atleta',
  age: 25,
  height: 175,
  weight: 75,
  goal: 'ganhar_massa',
  calorieGoal: 2800,
  proteinGoal: 180,
  carbGoal: 320,
  fatGoal: 80,
};

const defaultWorkout: Workout = {
  id: nanoid(),
  name: 'Treino A — Peito e Tríceps',
  muscleGroups: ['Peito', 'Tríceps', 'Ombro'],
  exercises: [
    { id: nanoid(), name: 'Supino Reto', sets: 4, reps: 10, weight: 60, restSeconds: 90 },
    { id: nanoid(), name: 'Supino Inclinado', sets: 3, reps: 12, weight: 50, restSeconds: 75 },
    { id: nanoid(), name: 'Crucifixo', sets: 3, reps: 15, weight: 14, restSeconds: 60 },
    { id: nanoid(), name: 'Tríceps Pulley', sets: 4, reps: 12, weight: 30, restSeconds: 60 },
    { id: nanoid(), name: 'Tríceps Testa', sets: 3, reps: 12, weight: 20, restSeconds: 60 },
  ],
  createdAt: new Date().toISOString(),
};

const defaultDietDay: DietDay = {
  date: new Date().toISOString().split('T')[0],
  meals: [
    {
      id: nanoid(),
      type: 'breakfast',
      foods: [
        { id: nanoid(), name: 'Ovos mexidos (3 unid)', calories: 210, protein: 18, carbs: 2, fat: 15, quantity: 3, unit: 'unid' },
        { id: nanoid(), name: 'Pão integral', calories: 140, protein: 6, carbs: 26, fat: 2, quantity: 2, unit: 'fatias' },
        { id: nanoid(), name: 'Whey Protein', calories: 120, protein: 25, carbs: 3, fat: 2, quantity: 1, unit: 'scoop' },
      ],
    },
    {
      id: nanoid(),
      type: 'lunch',
      foods: [
        { id: nanoid(), name: 'Frango grelhado', calories: 280, protein: 52, carbs: 0, fat: 6, quantity: 200, unit: 'g' },
        { id: nanoid(), name: 'Arroz integral', calories: 220, protein: 5, carbs: 46, fat: 2, quantity: 150, unit: 'g' },
        { id: nanoid(), name: 'Brócolis cozido', calories: 55, protein: 4, carbs: 10, fat: 0, quantity: 100, unit: 'g' },
      ],
    },
    {
      id: nanoid(),
      type: 'snack',
      foods: [
        { id: nanoid(), name: 'Banana', calories: 90, protein: 1, carbs: 23, fat: 0, quantity: 1, unit: 'unid' },
        { id: nanoid(), name: 'Pasta de amendoim', calories: 190, protein: 8, carbs: 6, fat: 16, quantity: 2, unit: 'col. sopa' },
      ],
    },
    {
      id: nanoid(),
      type: 'dinner',
      foods: [
        { id: nanoid(), name: 'Salmão grelhado', calories: 310, protein: 42, carbs: 0, fat: 15, quantity: 200, unit: 'g' },
        { id: nanoid(), name: 'Batata doce', calories: 130, protein: 2, carbs: 30, fat: 0, quantity: 150, unit: 'g' },
        { id: nanoid(), name: 'Salada verde', calories: 30, protein: 2, carbs: 5, fat: 0, quantity: 100, unit: 'g' },
      ],
    },
  ],
};

const defaultState: AppState = {
  profile: defaultProfile,
  workouts: [defaultWorkout],
  todayWorkoutId: defaultWorkout.id,
  dietDays: [defaultDietDay],
  weightEntries: [
    { id: nanoid(), date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], weight: 76.2 },
    { id: nanoid(), date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], weight: 75.8 },
    { id: nanoid(), date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], weight: 75.5 },
    { id: nanoid(), date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], weight: 75.3 },
    { id: nanoid(), date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], weight: 75.1 },
    { id: nanoid(), date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], weight: 75.0 },
    { id: nanoid(), date: new Date().toISOString().split('T')[0], weight: 74.8 },
  ],
  measurements: [],
  progressPhotos: [],
  workoutSessions: [],
  stats: {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalDietDays: 0,
    badges: [],
    personalRecords: {},
    oneRMHistory: [],
    volumeHistory: [],
  },
  workoutPlans: [],
  preferences: {
    theme: 'green',
    notifications: [
      { id: nanoid(), type: 'workout', enabled: true, time: '06:00', frequency: 'daily' },
      { id: nanoid(), type: 'meal', enabled: true, time: '12:00', frequency: 'daily' },
      { id: nanoid(), type: 'water', enabled: false, time: '09:00', frequency: 'daily' },
    ],
    offlineMode: false,
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => Workout;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  setTodayWorkout: (id: string | null) => void;
  addExerciseToWorkout: (workoutId: string, exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (workoutId: string, exerciseId: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (workoutId: string, exerciseId: string) => void;
  getTodayDiet: () => DietDay;
  addFoodToMeal: (mealType: MealType, food: Omit<Food, 'id'>) => void;
  updateFood: (mealType: MealType, foodId: string, food: Partial<Food>) => void;
  deleteFood: (mealType: MealType, foodId: string) => void;
  addWeightEntry: (entry: Omit<WeightEntry, 'id'>) => void;
  deleteWeightEntry: (id: string) => void;
  addMeasurement: (m: Omit<BodyMeasurement, 'id'>) => void;
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  deleteProgressPhoto: (id: string) => void;
  saveWorkoutSession: (session: Omit<WorkoutSession, 'id'>) => void;
  getTodayCalories: () => { consumed: number; protein: number; carbs: number; fat: number };
  addWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => WorkoutPlan;
  deleteWorkoutPlan: (id: string) => void;
  calculateOneRM: (exerciseName: string, weight: number, reps: number) => number;
  addOneRMRecord: (record: Omit<OneRMCalculation, 'id'>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  getVolumeHistory: (exerciseName?: string, days?: number) => Array<{ date: string; volume: number }>;
  getWorkoutHistory: (days?: number) => WorkoutSession[];
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'fitpro_app_state_v2'; // Bumped version to force reset of old state

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AppState;
      
      // Merge with defaults to ensure all new fields exist
      const merged: AppState = {
        ...defaultState,
        ...parsed,
        profile: { ...defaultProfile, ...parsed.profile },
        stats: {
          ...defaultState.stats,
          ...parsed.stats,
          volumeHistory: parsed.stats?.volumeHistory ?? [],
          oneRMHistory: parsed.stats?.oneRMHistory ?? [],
          personalRecords: parsed.stats?.personalRecords ?? {},
          badges: parsed.stats?.badges ?? [],
        },
        preferences: {
          ...defaultState.preferences,
          ...parsed.preferences,
          notifications: parsed.preferences?.notifications ?? defaultState.preferences.notifications,
        },
      };
      
      // Ensure today's diet exists
      const today = new Date().toISOString().split('T')[0];
      if (!merged.dietDays.find(d => d.date === today)) {
        merged.dietDays.push({
          date: today,
          meals: [
            { id: nanoid(), type: 'breakfast', foods: [] },
            { id: nanoid(), type: 'lunch', foods: [] },
            { id: nanoid(), type: 'snack', foods: [] },
            { id: nanoid(), type: 'dinner', foods: [] },
          ],
        });
      }
      return merged;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return defaultState;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [state]);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setState(s => ({ ...s, profile: { ...s.profile, ...profile } }));
  }, []);

  const addWorkout = useCallback((workout: Omit<Workout, 'id' | 'createdAt'>): Workout => {
    const newWorkout: Workout = { ...workout, id: nanoid(), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, workouts: [...s.workouts, newWorkout] }));
    return newWorkout;
  }, []);

  const updateWorkout = useCallback((id: string, workout: Partial<Workout>) => {
    setState(s => ({
      ...s,
      workouts: s.workouts.map(w => w.id === id ? { ...w, ...workout } : w),
    }));
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setState(s => ({
      ...s,
      workouts: s.workouts.filter(w => w.id !== id),
      todayWorkoutId: s.todayWorkoutId === id ? null : s.todayWorkoutId,
    }));
  }, []);

  const setTodayWorkout = useCallback((id: string | null) => {
    setState(s => ({ ...s, todayWorkoutId: id }));
  }, []);

  const addExerciseToWorkout = useCallback((workoutId: string, exercise: Omit<Exercise, 'id'>) => {
    setState(s => ({
      ...s,
      workouts: s.workouts.map(w =>
        w.id === workoutId
          ? { ...w, exercises: [...w.exercises, { ...exercise, id: nanoid() }] }
          : w
      ),
    }));
  }, []);

  const updateExercise = useCallback((workoutId: string, exerciseId: string, exercise: Partial<Exercise>) => {
    setState(s => ({
      ...s,
      workouts: s.workouts.map(w =>
        w.id === workoutId
          ? { ...w, exercises: w.exercises.map(e => e.id === exerciseId ? { ...e, ...exercise } : e) }
          : w
      ),
    }));
  }, []);

  const deleteExercise = useCallback((workoutId: string, exerciseId: string) => {
    setState(s => ({
      ...s,
      workouts: s.workouts.map(w =>
        w.id === workoutId
          ? { ...w, exercises: w.exercises.filter(e => e.id !== exerciseId) }
          : w
      ),
    }));
  }, []);

  const getTodayDiet = useCallback((): DietDay => {
    const today = new Date().toISOString().split('T')[0];
    return state.dietDays.find(d => d.date === today) || {
      date: today,
      meals: [
        { id: nanoid(), type: 'breakfast', foods: [] },
        { id: nanoid(), type: 'lunch', foods: [] },
        { id: nanoid(), type: 'snack', foods: [] },
        { id: nanoid(), type: 'dinner', foods: [] },
      ],
    };
  }, [state.dietDays]);

  const addFoodToMeal = useCallback((mealType: MealType, food: Omit<Food, 'id'>) => {
    const today = new Date().toISOString().split('T')[0];
    setState(s => {
      const dietDays = [...s.dietDays];
      let dayIndex = dietDays.findIndex(d => d.date === today);
      if (dayIndex === -1) {
        dietDays.push({
          date: today,
          meals: [
            { id: nanoid(), type: 'breakfast', foods: [] },
            { id: nanoid(), type: 'lunch', foods: [] },
            { id: nanoid(), type: 'snack', foods: [] },
            { id: nanoid(), type: 'dinner', foods: [] },
          ],
        });
        dayIndex = dietDays.length - 1;
      }
      const day = { ...dietDays[dayIndex] };
      day.meals = day.meals.map(m =>
        m.type === mealType
          ? { ...m, foods: [...m.foods, { ...food, id: nanoid() }] }
          : m
      );
      dietDays[dayIndex] = day;
      return { ...s, dietDays };
    });
  }, []);

  const updateFood = useCallback((mealType: MealType, foodId: string, food: Partial<Food>) => {
    const today = new Date().toISOString().split('T')[0];
    setState(s => ({
      ...s,
      dietDays: s.dietDays.map(d =>
        d.date === today
          ? {
              ...d,
              meals: d.meals.map(m =>
                m.type === mealType
                  ? { ...m, foods: m.foods.map(f => f.id === foodId ? { ...f, ...food } : f) }
                  : m
              ),
            }
          : d
      ),
    }));
  }, []);

  const deleteFood = useCallback((mealType: MealType, foodId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setState(s => ({
      ...s,
      dietDays: s.dietDays.map(d =>
        d.date === today
          ? {
              ...d,
              meals: d.meals.map(m =>
                m.type === mealType
                  ? { ...m, foods: m.foods.filter(f => f.id !== foodId) }
                  : m
              ),
            }
          : d
      ),
    }));
  }, []);

  const addWeightEntry = useCallback((entry: Omit<WeightEntry, 'id'>) => {
    setState(s => ({
      ...s,
      weightEntries: [...s.weightEntries.filter(e => e.date !== entry.date), { ...entry, id: nanoid() }]
        .sort((a, b) => a.date.localeCompare(b.date)),
    }));
  }, []);

  const deleteWeightEntry = useCallback((id: string) => {
    setState(s => ({ ...s, weightEntries: s.weightEntries.filter(e => e.id !== id) }));
  }, []);

  const addMeasurement = useCallback((m: Omit<BodyMeasurement, 'id'>) => {
    setState(s => ({ ...s, measurements: [...s.measurements, { ...m, id: nanoid() }] }));
  }, []);

  const addProgressPhoto = useCallback((photo: Omit<ProgressPhoto, 'id'>) => {
    setState(s => ({ ...s, progressPhotos: [...s.progressPhotos, { ...photo, id: nanoid() }] }));
  }, []);

  const deleteProgressPhoto = useCallback((id: string) => {
    setState(s => ({ ...s, progressPhotos: s.progressPhotos.filter(p => p.id !== id) }));
  }, []);

  const saveWorkoutSession = useCallback((session: Omit<WorkoutSession, 'id'>) => {
    setState(s => ({ ...s, workoutSessions: [...s.workoutSessions, { ...session, id: nanoid() }] }));
  }, []);

  const getTodayCalories = useCallback(() => {
    const today = getTodayDiet();
    return today.meals.reduce(
      (acc, meal) => {
        meal.foods.forEach(f => {
          acc.consumed += f.calories;
          acc.protein += f.protein;
          acc.carbs += f.carbs;
          acc.fat += f.fat;
        });
        return acc;
      },
      { consumed: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [getTodayDiet]);

  const addWorkoutPlan = useCallback((plan: Omit<WorkoutPlan, 'id' | 'createdAt'>): WorkoutPlan => {
    const newPlan: WorkoutPlan = { ...plan, id: nanoid(), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, workoutPlans: [...s.workoutPlans, newPlan] }));
    return newPlan;
  }, []);

  const deleteWorkoutPlan = useCallback((id: string) => {
    setState(s => ({ ...s, workoutPlans: s.workoutPlans.filter(p => p.id !== id) }));
  }, []);

  const calculateOneRM = useCallback((exerciseName: string, weight: number, reps: number): number => {
    // Epley Formula: 1RM = weight * (1 + reps/30)
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
  }, []);

  const addOneRMRecord = useCallback((record: Omit<OneRMCalculation, 'id'>) => {
    setState(s => ({
      ...s,
      stats: {
        ...s.stats,
        oneRMHistory: [...s.stats.oneRMHistory, { ...record, id: nanoid() }],
      },
    }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setState(s => ({ ...s, preferences: { ...s.preferences, ...prefs } }));
  }, []);

  const getVolumeHistory = useCallback((exerciseName?: string, days: number = 30) => {
    const cutoffDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    let history = state.stats.volumeHistory.filter(v => v.date >= cutoffDate);
    if (exerciseName) {
      history = history.filter(v => v.exercise === exerciseName);
    }
    return history.map(v => ({ date: v.date, volume: v.volume }));
  }, [state.stats.volumeHistory]);

  const getWorkoutHistory = useCallback((days: number = 30) => {
    const cutoffDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return state.workoutSessions.filter(s => s.date >= cutoffDate);
  }, [state.workoutSessions]);

  return (
    <AppContext.Provider value={{
      state,
      updateProfile,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      setTodayWorkout,
      addExerciseToWorkout,
      updateExercise,
      deleteExercise,
      getTodayDiet,
      addFoodToMeal,
      updateFood,
      deleteFood,
      addWeightEntry,
      deleteWeightEntry,
      addMeasurement,
      addProgressPhoto,
      deleteProgressPhoto,
      saveWorkoutSession,
      getTodayCalories,
      addWorkoutPlan,
      deleteWorkoutPlan,
      calculateOneRM,
      addOneRMRecord,
      updatePreferences,
      getVolumeHistory,
      getWorkoutHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Utility: Epley Formula for 1RM
export function calculateOneRMEpley(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

// Utility: Brzycki Formula for 1RM (alternative)
export function calculateOneRMBrzycki(weight: number, reps: number): number {
  return Math.round((weight * 36) / (37 - reps) * 10) / 10;
}
