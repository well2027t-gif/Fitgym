/**
 * FitPro — AppContext
 * Design: Premium Dark Fitness
 * Estado global com suporte a perfil expandido, sistema completo de treinos,
 * execução com histórico enriquecido e persistência em localStorage.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { nanoid } from 'nanoid';
import {
  generateAutoWorkouts,
  profileSignature,
  type AutoPlanSummary,
  type TrainingLocation,
  type UserSex,
  type WorkoutLevel,
  type WorkoutMode,
} from '@/lib/workoutEngine';

export type Goal = 'ganhar_massa' | 'perder_gordura' | 'manter_peso' | 'definicao' | 'resistencia';

export interface UserProfile {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: Goal;
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  avatarUrl?: string;
  sex: UserSex;
  level: WorkoutLevel;
  trainingFrequency: number;
  trainingLocation: TrainingLocation;
  availableEquipment: string[];
  limitations: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup?: string;
  secondaryGroups?: string[];
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
  notes?: string;
  instructions?: string;
  videoUrl?: string;
  completed?: boolean;
  skipped?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  muscleGroups: string[];
  exercises: Exercise[];
  createdAt: string;
  lastPerformed?: string;
  durationMinutes?: number;
  origin?: 'auto' | 'manual';
  dayKey?: string;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  date: string;
  meals: Meal[];
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
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

export interface WorkoutPerformanceDetail {
  exerciseName?: string;
  weight: number;
  reps: number;
  sets: number;
  completedSets?: number;
  skipped?: boolean;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  date: string;
  completedExercises: string[];
  skippedExercises?: string[];
  durationSeconds: number;
  notes?: string;
  progressPercent?: number;
  exerciseDetails?: Record<string, WorkoutPerformanceDetail>;
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

export interface StepEntry {
  date: string;
  steps: number;
  updatedAt?: string;
}

export interface WaterEntry {
  date: string;
  cups: number;
  updatedAt?: string;
}

export interface NotificationReminder {
  id: string;
  type: 'workout' | 'meal' | 'water' | 'weight_check' | 'cycle_start';
  enabled: boolean;
  time: string;
  frequency: 'daily' | 'weekly' | 'custom';
}

export type ThemeColor = 'green' | 'blue' | 'pink';

export interface UserPreferences {
  theme: ThemeColor;
  notifications: NotificationReminder[];
  offlineMode: boolean;
  stepTrackingEnabled: boolean;
  dailyStepGoal: number;
  lastSyncTime?: string;
  waterGoalLiters: number;
  cupSizeMl: number;
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
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalDietDays: number;
  badges: Badge[];
  personalRecords: Record<string, number>;
  lastWorkoutDate?: string;
  oneRMHistory: OneRMCalculation[];
  volumeHistory: Array<{ date: string; exercise: string; volume: number }>;
}

export interface CycleDayEntry {
  id: string;
  date: string;
  flow?: 'light' | 'medium' | 'heavy';
  symptoms?: string[];
  mood?: string;
  energy?: 'baixa' | 'normal' | 'alta';
  libido?: 'baixa' | 'normal' | 'alta';
  sleep?: number;
  temperature?: number;
  notes?: string;
}

export interface CycleProfile {
  cycleLengthDays: number;
  menstruationDays: number;
  useContraceptive: boolean;
  contraceptiveType?: string;
  objective: 'track' | 'conceive' | 'avoid' | 'performance';
  lastMenstruationDate?: string;
}

export interface CycleEntry {
  id: string;
  startDate: string;
  endDate?: string;
  cycleLengthDays?: number;
  dayEntries: CycleDayEntry[];
}

export interface AppState {
  profile: UserProfile;
  workouts: Workout[];
  todayWorkoutId: string | null;
  workoutMode: WorkoutMode;
  workoutAutoSummary: AutoPlanSummary | null;
  lastAutoProfileSignature: string | null;
  lastGeneratedAt?: string;
  dietDays: DietDay[];
  weightEntries: WeightEntry[];
  measurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];
  workoutSessions: WorkoutSession[];
  stats: UserStats;
  workoutPlans: WorkoutPlan[];
  stepEntries: StepEntry[];
  waterEntries: WaterEntry[];
  preferences: UserPreferences;
  cycleEntries: CycleEntry[];
  cycleProfile: CycleProfile | null;
}

interface ReplaceWorkoutsOptions {
  mode?: WorkoutMode;
  sourceSignature?: string | null;
  summary?: AutoPlanSummary | null;
}

interface AppContextValue {
  state: AppState;
  needsWorkoutRefresh: boolean;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addWorkout: (workout: Omit<Workout, 'id' | 'createdAt'>) => Workout;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  replaceWorkouts: (workouts: Workout[], options?: ReplaceWorkoutsOptions) => void;
  updateWorkoutMode: (mode: WorkoutMode) => void;
  generateAutoWorkoutPlan: () => Workout[];
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
  getTodaySteps: () => number;
  setTodaySteps: (steps: number) => void;
  incrementTodaySteps: (steps: number) => void;
  getVolumeHistory: (exerciseName?: string, days?: number) => Array<{ date: string; volume: number }>;
  getWorkoutHistory: (days?: number) => WorkoutSession[];
  addCycleEntry: (entry: Omit<CycleEntry, 'id'>) => void;
  updateCycleEntry: (id: string, entry: Partial<CycleEntry>) => void;
  deleteCycleEntry: (id: string) => void;
  updateCycleProfile: (profile: Partial<CycleProfile>) => void;
  getTodayWaterCups: () => number;
  setTodayWaterCups: (cups: number) => void;
  getWaterHistory: (days?: number) => Array<{ date: string; cups: number; liters: number }>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);
const STORAGE_KEY = 'fitpro_app_state_v3';

const today = () => new Date().toISOString().split('T')[0];

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
  sex: 'masculino',
  level: 'intermediario',
  trainingFrequency: 4,
  trainingLocation: 'academia',
  availableEquipment: ['halteres', 'barra', 'banco', 'cabo', 'polia', 'leg press', 'rack'],
  limitations: '',
};

function toWorkoutProfile(profile: UserProfile) {
  return {
    goal: profile.goal,
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    sex: profile.sex,
    level: profile.level,
    trainingFrequency: profile.trainingFrequency,
    trainingLocation: profile.trainingLocation,
    availableEquipment: profile.availableEquipment,
    limitations: profile.limitations,
  };
}

const seededAuto = generateAutoWorkouts(toWorkoutProfile(defaultProfile));

const defaultDietDay: DietDay = {
  date: today(),
  meals: [
    {
      id: nanoid(),
      type: 'breakfast',
      foods: [
        { id: nanoid(), name: 'Ovos mexidos (3 unid)', calories: 210, protein: 18, carbs: 2, fat: 15, quantity: 3, unit: 'unid' },
        { id: nanoid(), name: 'Pão integral', calories: 140, protein: 6, carbs: 26, fat: 2, quantity: 2, unit: 'fatias' },
      ],
    },
    {
      id: nanoid(),
      type: 'lunch',
      foods: [
        { id: nanoid(), name: 'Frango grelhado', calories: 280, protein: 52, carbs: 0, fat: 6, quantity: 200, unit: 'g' },
        { id: nanoid(), name: 'Arroz integral', calories: 220, protein: 5, carbs: 46, fat: 2, quantity: 150, unit: 'g' },
      ],
    },
    {
      id: nanoid(),
      type: 'snack',
      foods: [
        { id: nanoid(), name: 'Banana', calories: 90, protein: 1, carbs: 23, fat: 0, quantity: 1, unit: 'unid' },
      ],
    },
    {
      id: nanoid(),
      type: 'dinner',
      foods: [
        { id: nanoid(), name: 'Salmão grelhado', calories: 310, protein: 42, carbs: 0, fat: 15, quantity: 200, unit: 'g' },
        { id: nanoid(), name: 'Batata doce', calories: 130, protein: 2, carbs: 30, fat: 0, quantity: 150, unit: 'g' },
      ],
    },
  ],
};

const defaultState: AppState = {
  profile: defaultProfile,
  workouts: seededAuto.workouts,
  todayWorkoutId: seededAuto.workouts[0]?.id ?? null,
  workoutMode: 'auto',
  workoutAutoSummary: seededAuto.summary,
  lastAutoProfileSignature: seededAuto.summary.generatedFrom,
  lastGeneratedAt: new Date().toISOString(),
  dietDays: [defaultDietDay],
  weightEntries: [
    { id: nanoid(), date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], weight: 76.2 },
    { id: nanoid(), date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], weight: 75.3 },
    { id: nanoid(), date: today(), weight: 74.8 },
  ],
  measurements: [],
  progressPhotos: [],
  workoutSessions: [],
  stats: {
    totalPoints: 200,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalDietDays: 0,
    badges: [
      {
        id: nanoid(),
        name: 'Meta Atingida',
        description: 'Você configurou seu objetivo principal e começou sua jornada.',
        icon: '🎯',
        unlockedAt: new Date().toISOString(),
        condition: 'weight_goal',
      },
    ],
    personalRecords: {},
    oneRMHistory: [],
    volumeHistory: [],
  },
  workoutPlans: [],
  stepEntries: [{ date: today(), steps: 0, updatedAt: new Date().toISOString() }],
  waterEntries: [{ date: today(), cups: 0, updatedAt: new Date().toISOString() }],
  preferences: {
    theme: 'green',
    notifications: [
      { id: nanoid(), type: 'workout', enabled: true, time: '06:00', frequency: 'daily' },
      { id: nanoid(), type: 'meal', enabled: true, time: '12:00', frequency: 'daily' },
      { id: nanoid(), type: 'water', enabled: false, time: '09:00', frequency: 'daily' },
    ],
    offlineMode: false,
    stepTrackingEnabled: true,
    dailyStepGoal: 8000,
    waterGoalLiters: 2.5,
    cupSizeMl: 250,
  },
  cycleEntries: [],
  cycleProfile: {
    cycleLengthDays: 28,
    menstruationDays: 5,
    useContraceptive: false,
    objective: 'performance',
  },
};

function createMealSet(): Meal[] {
  return [
    { id: nanoid(), type: 'breakfast', foods: [] },
    { id: nanoid(), type: 'lunch', foods: [] },
    { id: nanoid(), type: 'snack', foods: [] },
    { id: nanoid(), type: 'dinner', foods: [] },
  ];
}

function normalizeExercise(raw: Partial<Exercise> & Pick<Exercise, 'name' | 'sets' | 'reps' | 'weight' | 'restSeconds'>): Exercise {
  return {
    id: raw.id ?? nanoid(),
    name: raw.name,
    muscleGroup: raw.muscleGroup,
    secondaryGroups: raw.secondaryGroups ?? [],
    sets: raw.sets,
    reps: raw.reps,
    weight: raw.weight,
    restSeconds: raw.restSeconds,
    notes: raw.notes,
    instructions: raw.instructions,
    videoUrl: raw.videoUrl,
    completed: raw.completed ?? false,
    skipped: raw.skipped ?? false,
  };
}

function normalizeWorkout(raw: Partial<Workout> & Pick<Workout, 'name' | 'muscleGroups' | 'exercises'>): Workout {
  return {
    id: raw.id ?? nanoid(),
    name: raw.name,
    muscleGroups: raw.muscleGroups ?? [],
    exercises: raw.exercises.map(exercise => normalizeExercise(exercise)),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    lastPerformed: raw.lastPerformed,
    durationMinutes: raw.durationMinutes,
    origin: raw.origin ?? 'manual',
    dayKey: raw.dayKey ?? `custom-${Math.random().toString(36).slice(2, 8)}`,
  };
}

function deriveStreak(dates: string[]) {
  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  if (uniqueDates.length === 0) return 0;
  let streak = 0;
  let cursor = new Date();

  for (let i = 0; i < uniqueDates.length; i += 1) {
    const target = cursor.toISOString().split('T')[0];
    if (uniqueDates.includes(target)) {
      streak += 1;
      cursor = new Date(cursor.getTime() - 86400000);
      continue;
    }

    if (streak === 0) {
      cursor = new Date(cursor.getTime() - 86400000);
      const yesterday = cursor.toISOString().split('T')[0];
      if (uniqueDates.includes(yesterday)) {
        streak += 1;
        cursor = new Date(cursor.getTime() - 86400000);
        continue;
      }
    }
    break;
  }

  return streak;
}

function normalizeLoadedState(raw: Partial<AppState>): AppState {
  const mergedProfile: UserProfile = {
    ...defaultProfile,
    ...(raw.profile ?? {}),
    availableEquipment: raw.profile?.availableEquipment ?? defaultProfile.availableEquipment,
  };

  const workouts = (raw.workouts ?? defaultState.workouts).map(workout => normalizeWorkout(workout));
  const derivedSignature = profileSignature(toWorkoutProfile(mergedProfile));

  return {
    ...defaultState,
    ...raw,
    profile: mergedProfile,
    workouts,
    todayWorkoutId: raw.todayWorkoutId ?? workouts[0]?.id ?? null,
    workoutMode: raw.workoutMode ?? (workouts.some(workout => workout.origin === 'auto') ? 'auto' : 'manual'),
    workoutAutoSummary: raw.workoutAutoSummary ?? defaultState.workoutAutoSummary,
    lastAutoProfileSignature: raw.lastAutoProfileSignature ?? derivedSignature,
    lastGeneratedAt: raw.lastGeneratedAt ?? defaultState.lastGeneratedAt,
    dietDays: raw.dietDays ?? defaultState.dietDays,
    weightEntries: raw.weightEntries ?? defaultState.weightEntries,
    measurements: raw.measurements ?? [],
    progressPhotos: raw.progressPhotos ?? [],
    workoutSessions: raw.workoutSessions ?? [],
    workoutPlans: raw.workoutPlans ?? [],
    stepEntries: raw.stepEntries ?? defaultState.stepEntries,
    waterEntries: raw.waterEntries ?? defaultState.waterEntries,
    preferences: {
      ...defaultState.preferences,
      ...(raw.preferences ?? {}),
      notifications: raw.preferences?.notifications ?? defaultState.preferences.notifications,
    },
    stats: {
      ...defaultState.stats,
      ...(raw.stats ?? {}),
      badges: raw.stats?.badges ?? defaultState.stats.badges,
      personalRecords: raw.stats?.personalRecords ?? {},
      oneRMHistory: raw.stats?.oneRMHistory ?? [],
      volumeHistory: raw.stats?.volumeHistory ?? [],
    },
    cycleEntries: raw.cycleEntries ?? [],
    cycleProfile: raw.cycleProfile ?? defaultState.cycleProfile,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState;
    try {
      return normalizeLoadedState(JSON.parse(saved) as Partial<AppState>);
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const needsWorkoutRefresh = useMemo(() => {
    if (state.workoutMode !== 'auto') return false;
    return profileSignature(toWorkoutProfile(state.profile)) !== state.lastAutoProfileSignature;
  }, [state.profile, state.workoutMode, state.lastAutoProfileSignature]);

  const updateProfile = useCallback((profile: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...profile,
        availableEquipment: profile.availableEquipment ?? prev.profile.availableEquipment,
      },
    }));
  }, []);

  const replaceWorkouts = useCallback((workouts: Workout[], options?: ReplaceWorkoutsOptions) => {
    setState(prev => ({
      ...prev,
      workouts: workouts.map(workout => normalizeWorkout(workout)),
      todayWorkoutId: workouts[0]?.id ?? null,
      workoutMode: options?.mode ?? prev.workoutMode,
      workoutAutoSummary: options?.summary ?? prev.workoutAutoSummary,
      lastAutoProfileSignature: options?.sourceSignature ?? prev.lastAutoProfileSignature,
      lastGeneratedAt: options?.mode === 'auto' ? new Date().toISOString() : prev.lastGeneratedAt,
    }));
  }, []);

  const updateWorkoutMode = useCallback((mode: WorkoutMode) => {
    setState(prev => ({ ...prev, workoutMode: mode }));
  }, []);

  const generateAutoWorkoutPlan = useCallback(() => {
    const generated = generateAutoWorkouts(toWorkoutProfile(state.profile));
    setState(prev => ({
      ...prev,
      workouts: generated.workouts.map(workout => normalizeWorkout(workout)),
      todayWorkoutId: generated.workouts[0]?.id ?? null,
      workoutMode: 'auto',
      workoutAutoSummary: generated.summary,
      lastAutoProfileSignature: generated.summary.generatedFrom,
      lastGeneratedAt: new Date().toISOString(),
    }));
    return generated.workouts;
  }, [state.profile]);

  const addWorkout = useCallback((workout: Omit<Workout, 'id' | 'createdAt'>): Workout => {
    const newWorkout = normalizeWorkout({
      ...workout,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      origin: workout.origin ?? 'manual',
      dayKey: workout.dayKey ?? `manual-${Date.now()}`,
    });
    setState(prev => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout],
      workoutMode: prev.workoutMode === 'unset' ? 'manual' : prev.workoutMode,
    }));
    return newWorkout;
  }, []);

  const updateWorkout = useCallback((id: string, workout: Partial<Workout>) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.map(item => item.id === id ? {
        ...item,
        ...workout,
        exercises: workout.exercises ? workout.exercises.map(exercise => normalizeExercise(exercise)) : item.exercises,
      } : item),
    }));
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setState(prev => {
      const workouts = prev.workouts.filter(item => item.id !== id);
      return {
        ...prev,
        workouts,
        todayWorkoutId: prev.todayWorkoutId === id ? workouts[0]?.id ?? null : prev.todayWorkoutId,
      };
    });
  }, []);

  const setTodayWorkout = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, todayWorkoutId: id }));
  }, []);

  const addExerciseToWorkout = useCallback((workoutId: string, exercise: Omit<Exercise, 'id'>) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.map(workout => workout.id === workoutId
        ? { ...workout, exercises: [...workout.exercises, normalizeExercise({ ...exercise, id: nanoid() })] }
        : workout),
    }));
  }, []);

  const updateExercise = useCallback((workoutId: string, exerciseId: string, exercise: Partial<Exercise>) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.map(workout => workout.id === workoutId ? {
        ...workout,
        exercises: workout.exercises.map(item => item.id === exerciseId ? { ...item, ...exercise } : item),
      } : workout),
    }));
  }, []);

  const deleteExercise = useCallback((workoutId: string, exerciseId: string) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.map(workout => workout.id === workoutId ? {
        ...workout,
        exercises: workout.exercises.filter(item => item.id !== exerciseId),
      } : workout),
    }));
  }, []);

  const getTodayDiet = useCallback(() => {
    const date = today();
    const existing = state.dietDays.find(day => day.date === date);
    return existing ?? { date, meals: createMealSet() };
  }, [state.dietDays]);

  const addFoodToMeal = useCallback((mealType: MealType, food: Omit<Food, 'id'>) => {
    const date = today();
    setState(prev => {
      const dietDays = [...prev.dietDays];
      let index = dietDays.findIndex(day => day.date === date);
      if (index === -1) {
        dietDays.push({ date, meals: createMealSet() });
        index = dietDays.length - 1;
      }
      dietDays[index] = {
        ...dietDays[index],
        meals: dietDays[index].meals.map(meal => meal.type === mealType ? {
          ...meal,
          foods: [...meal.foods, { ...food, id: nanoid() }],
        } : meal),
      };
      return { ...prev, dietDays };
    });
  }, []);

  const updateFood = useCallback((mealType: MealType, foodId: string, food: Partial<Food>) => {
    const date = today();
    setState(prev => ({
      ...prev,
      dietDays: prev.dietDays.map(day => day.date === date ? {
        ...day,
        meals: day.meals.map(meal => meal.type === mealType ? {
          ...meal,
          foods: meal.foods.map(item => item.id === foodId ? { ...item, ...food } : item),
        } : meal),
      } : day),
    }));
  }, []);

  const deleteFood = useCallback((mealType: MealType, foodId: string) => {
    const date = today();
    setState(prev => ({
      ...prev,
      dietDays: prev.dietDays.map(day => day.date === date ? {
        ...day,
        meals: day.meals.map(meal => meal.type === mealType ? {
          ...meal,
          foods: meal.foods.filter(item => item.id !== foodId),
        } : meal),
      } : day),
    }));
  }, []);

  const addWeightEntry = useCallback((entry: Omit<WeightEntry, 'id'>) => {
    setState(prev => ({
      ...prev,
      weightEntries: [...prev.weightEntries.filter(item => item.date !== entry.date), { ...entry, id: nanoid() }].sort((a, b) => a.date.localeCompare(b.date)),
    }));
  }, []);

  const deleteWeightEntry = useCallback((id: string) => {
    setState(prev => ({ ...prev, weightEntries: prev.weightEntries.filter(item => item.id !== id) }));
  }, []);

  const addMeasurement = useCallback((measurement: Omit<BodyMeasurement, 'id'>) => {
    setState(prev => ({ ...prev, measurements: [...prev.measurements, { ...measurement, id: nanoid() }] }));
  }, []);

  const addProgressPhoto = useCallback((photo: Omit<ProgressPhoto, 'id'>) => {
    setState(prev => ({ ...prev, progressPhotos: [...prev.progressPhotos, { ...photo, id: nanoid() }] }));
  }, []);

  const deleteProgressPhoto = useCallback((id: string) => {
    setState(prev => ({ ...prev, progressPhotos: prev.progressPhotos.filter(photo => photo.id !== id) }));
  }, []);

  const saveWorkoutSession = useCallback((session: Omit<WorkoutSession, 'id'>) => {
    setState(prev => {
      const newSession: WorkoutSession = { ...session, id: nanoid() };
      const allSessions = [...prev.workoutSessions, newSession];
      const performedDates = allSessions.map(item => item.date);
      const currentStreak = deriveStreak(performedDates);
      const longestStreak = Math.max(prev.stats.longestStreak, currentStreak);
      const performedWorkout = prev.workouts.find(workout => workout.id === session.workoutId);

      const personalRecords = { ...prev.stats.personalRecords };
      const volumeHistory = [...prev.stats.volumeHistory];

      Object.entries(session.exerciseDetails ?? {}).forEach(([exerciseId, detail]) => {
        const exerciseName = detail.exerciseName ?? performedWorkout?.exercises.find(exercise => exercise.id === exerciseId)?.name ?? 'Exercício';
        personalRecords[exerciseName] = Math.max(personalRecords[exerciseName] ?? 0, detail.weight ?? 0);
        const volume = (detail.weight ?? 0) * (detail.reps ?? 0) * (detail.completedSets ?? detail.sets ?? 0);
        if (volume > 0) {
          volumeHistory.push({ date: session.date, exercise: exerciseName, volume });
        }
      });

      const totalPoints = prev.stats.totalPoints + Math.max(60, (session.completedExercises.length * 15));

      return {
        ...prev,
        workoutSessions: allSessions,
        workouts: prev.workouts.map(workout => workout.id === session.workoutId ? { ...workout, lastPerformed: session.date } : workout),
        stats: {
          ...prev.stats,
          totalPoints,
          currentStreak,
          longestStreak,
          totalWorkouts: allSessions.length,
          lastWorkoutDate: session.date,
          personalRecords,
          volumeHistory: volumeHistory.slice(-240),
        },
      };
    });
  }, []);

  const getTodayCalories = useCallback(() => {
    const currentDay = getTodayDiet();
    return currentDay.meals.reduce((acc, meal) => {
      meal.foods.forEach(food => {
        acc.consumed += food.calories;
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
      });
      return acc;
    }, { consumed: 0, protein: 0, carbs: 0, fat: 0 });
  }, [getTodayDiet]);

  const addWorkoutPlan = useCallback((plan: Omit<WorkoutPlan, 'id' | 'createdAt'>): WorkoutPlan => {
    const nextPlan: WorkoutPlan = { ...plan, id: nanoid(), createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, workoutPlans: [...prev.workoutPlans, nextPlan] }));
    return nextPlan;
  }, []);

  const deleteWorkoutPlan = useCallback((id: string) => {
    setState(prev => ({ ...prev, workoutPlans: prev.workoutPlans.filter(plan => plan.id !== id) }));
  }, []);

  const calculateOneRM = useCallback((exerciseName: string, weight: number, reps: number) => {
    void exerciseName;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
  }, []);

  const addOneRMRecord = useCallback((record: Omit<OneRMCalculation, 'id'>) => {
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        oneRMHistory: [...prev.stats.oneRMHistory, { ...record, id: nanoid() }],
      },
    }));
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, ...prefs } }));
  }, []);

  const getTodaySteps = useCallback(() => {
    const date = today();
    return state.stepEntries.find(entry => entry.date === date)?.steps ?? 0;
  }, [state.stepEntries]);

  const setTodaySteps = useCallback((steps: number) => {
    const date = today();
    const nextSteps = Math.max(0, Math.round(steps));
    setState(prev => {
      const existing = prev.stepEntries.find(entry => entry.date === date);
      const stepEntries = existing
        ? prev.stepEntries.map(entry => entry.date === date ? { ...entry, steps: nextSteps, updatedAt: new Date().toISOString() } : entry)
        : [...prev.stepEntries, { date, steps: nextSteps, updatedAt: new Date().toISOString() }];
      return { ...prev, stepEntries };
    });
  }, []);

  const incrementTodaySteps = useCallback((steps: number) => {
    const date = today();
    setState(prev => {
      const existing = prev.stepEntries.find(entry => entry.date === date);
      const current = existing?.steps ?? 0;
      const next = Math.max(0, current + Math.round(steps));
      const stepEntries = existing
        ? prev.stepEntries.map(entry => entry.date === date ? { ...entry, steps: next, updatedAt: new Date().toISOString() } : entry)
        : [...prev.stepEntries, { date, steps: next, updatedAt: new Date().toISOString() }];
      return { ...prev, stepEntries };
    });
  }, []);

  const getVolumeHistory = useCallback((exerciseName?: string, days: number = 30) => {
    const cutoffDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const history = state.stats.volumeHistory.filter(item => item.date >= cutoffDate && (!exerciseName || item.exercise === exerciseName));
    return history.map(item => ({ date: item.date, volume: item.volume }));
  }, [state.stats.volumeHistory]);

  const getWorkoutHistory = useCallback((days: number = 30) => {
    const cutoffDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    return state.workoutSessions.filter(session => session.date >= cutoffDate);
  }, [state.workoutSessions]);

  const addCycleEntry = useCallback((entry: Omit<CycleEntry, 'id'>) => {
    setState(prev => ({
      ...prev,
      cycleEntries: [...prev.cycleEntries, { ...entry, id: nanoid() }].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    }));
  }, []);

  const updateCycleEntry = useCallback((id: string, entry: Partial<CycleEntry>) => {
    setState(prev => ({
      ...prev,
      cycleEntries: prev.cycleEntries.map(item => item.id === id ? { ...item, ...entry } : item),
    }));
  }, []);

  const deleteCycleEntry = useCallback((id: string) => {
    setState(prev => ({ ...prev, cycleEntries: prev.cycleEntries.filter(item => item.id !== id) }));
  }, []);

  const updateCycleProfile = useCallback((profile: Partial<CycleProfile>) => {
    setState(prev => ({
      ...prev,
      cycleProfile: prev.cycleProfile ? { ...prev.cycleProfile, ...profile } : (profile as CycleProfile),
    }));
  }, []);

  const getTodayWaterCups = useCallback(() => {
    const date = today();
    return state.waterEntries.find(entry => entry.date === date)?.cups ?? 0;
  }, [state.waterEntries]);

  const setTodayWaterCups = useCallback((cups: number) => {
    const date = today();
    const nextCups = Math.max(0, Math.round(cups));
    setState(prev => {
      const existing = prev.waterEntries.find(entry => entry.date === date);
      const waterEntries = existing
        ? prev.waterEntries.map(entry => entry.date === date ? { ...entry, cups: nextCups, updatedAt: new Date().toISOString() } : entry)
        : [...prev.waterEntries, { date, cups: nextCups, updatedAt: new Date().toISOString() }];
      return { ...prev, waterEntries };
    });
  }, []);

  const getWaterHistory = useCallback((days: number = 7) => {
    const cupSizeMl = state.preferences.cupSizeMl || 250;
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(Date.now() - (days - index - 1) * 86400000).toISOString().split('T')[0];
      const entry = state.waterEntries.find(item => item.date === date);
      return {
        date,
        cups: entry?.cups ?? 0,
        liters: parseFloat((((entry?.cups ?? 0) * cupSizeMl) / 1000).toFixed(2)),
      };
    });
  }, [state.waterEntries, state.preferences.cupSizeMl]);

  return (
    <AppContext.Provider
      value={{
        state,
        needsWorkoutRefresh,
        updateProfile,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        replaceWorkouts,
        updateWorkoutMode,
        generateAutoWorkoutPlan,
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
        getTodaySteps,
        setTodaySteps,
        incrementTodaySteps,
        getVolumeHistory,
        getWorkoutHistory,
        addCycleEntry,
        updateCycleEntry,
        deleteCycleEntry,
        updateCycleProfile,
        getTodayWaterCups,
        setTodayWaterCups,
        getWaterHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function calculateOneRMEpley(weight: number, reps: number): number {
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function calculateOneRMBrzycki(weight: number, reps: number): number {
  return Math.round((weight * 36) / (37 - reps) * 10) / 10;
}
