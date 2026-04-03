import { nanoid } from 'nanoid';
import type {
  MealType,
  ProgressPhoto,
  UserProfile,
  WorkoutSession,
} from '@/contexts/AppContext';
import type { GeneratedPlan, PersonalObjective } from '@/contexts/PersonalTrainerContext';
import type { PersonalApiUserPayload, WorkoutHistoryPayload } from '@/lib/personalApi';

const mealOrder: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export function mapGoalToObjective(goal: UserProfile['goal']): PersonalObjective {
  switch (goal) {
    case 'ganhar_massa':
      return 'hipertrofia';
    case 'perder_gordura':
    case 'manter_peso':
      return 'emagrecimento';
    case 'definicao':
    case 'resistencia':
    default:
      return 'definicao';
  }
}

export function buildPersonalApiUserPayload(params: {
  profile: UserProfile;
  nivel: PersonalApiUserPayload['nivel'];
  frequencia: number;
  restricoes: string;
  historico: string[];
  fotos: ProgressPhoto[];
}): PersonalApiUserPayload {
  const { profile, nivel, frequencia, restricoes, historico, fotos } = params;
  return {
    idade: profile.age,
    peso: profile.weight,
    altura: profile.height,
    objetivo: mapGoalToObjective(profile.goal),
    nivel,
    frequencia,
    restricoes,
    historico,
    fotos: fotos.slice(-3).map(photo => photo.dataUrl),
  };
}

export function buildWorkoutHistoryPayload(sessions: WorkoutSession[], workoutsById: Record<string, string>): WorkoutHistoryPayload[] {
  return sessions.slice(-20).map(session => ({
    date: session.date,
    workoutName: workoutsById[session.workoutId] ?? 'Treino registrado',
    durationSeconds: session.durationSeconds,
    completedExercises: session.completedExercises.length,
  }));
}

export function normalizeMealLabel(index: number, entry: GeneratedPlan['dieta']['refeicoes'][number]) {
  if (typeof entry === 'string') return entry;
  return entry.nome || `Refeição ${index + 1}`;
}

export function buildDietImport(plan: GeneratedPlan) {
  const totalMeals = Math.max(plan.dieta.refeicoes.length, 1);
  const approxCalories = Math.max(100, Math.round(plan.dieta.calorias_estimadas / totalMeals));

  return mealOrder.map((mealType, index) => {
    const entry = plan.dieta.refeicoes[index];
    const name = entry ? normalizeMealLabel(index, entry) : `Refeição ${index + 1}`;
    const details = typeof entry === 'string'
      ? entry
      : [entry.nome, ...(entry.alimentos ?? []), entry.observacao].filter(Boolean).join(' • ');

    return {
      mealType,
      food: {
        name: details,
        calories: approxCalories,
        protein: 0,
        carbs: 0,
        fat: 0,
        quantity: 1,
        unit: 'plano',
      },
    };
  });
}

export function buildWorkoutImport(plan: GeneratedPlan) {
  return plan.treino.dias.map(day => ({
    name: `${day.dia} — ${day.foco}`,
    muscleGroups: [day.foco],
    exercises: day.exercicios.map(exercise => ({
      name: exercise.nome,
      sets: exercise.series,
      reps: parseRepetitionRange(exercise.repeticoes),
      weight: 0,
      restSeconds: parseRestSeconds(exercise.descanso),
      notes: exercise.observacao,
      completed: false,
    })),
  }));
}

export function buildWorkoutPlanSummary(plan: GeneratedPlan, objectiveLabel: string, difficulty: 'iniciante' | 'intermediario' | 'avancado') {
  return {
    name: `Plano IA — ${objectiveLabel}`,
    description: `${plan.treino.divisao} • ${plan.treino.nivel_intensidade}`,
    objective: mapObjectiveToGoal(objectiveLabel),
    difficulty,
    durationWeeks: 4,
    workouts: buildWorkoutImport(plan).map(workout => ({
      id: nanoid(),
      createdAt: new Date().toISOString(),
      ...workout,
    })),
  };
}

function mapObjectiveToGoal(objectiveLabel: string): UserProfile['goal'] {
  if (objectiveLabel === 'hipertrofia') return 'ganhar_massa';
  if (objectiveLabel === 'emagrecimento') return 'perder_gordura';
  return 'definicao';
}

function parseRepetitionRange(value: string) {
  const match = value.match(/\d+/);
  if (!match) return 10;
  return Number(match[0]);
}

function parseRestSeconds(value: string) {
  const minuteMatch = value.match(/(\d+)\s*min/i);
  if (minuteMatch) return Number(minuteMatch[1]) * 60;
  const secMatch = value.match(/(\d+)\s*s/i);
  if (secMatch) return Number(secMatch[1]);
  const rawNumber = value.match(/\d+/);
  return rawNumber ? Number(rawNumber[0]) : 60;
}
