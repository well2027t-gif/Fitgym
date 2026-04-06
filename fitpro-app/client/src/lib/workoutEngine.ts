/**
 * FitPro — workoutEngine
 * Design: Premium Dark Fitness
 * Motor local para biblioteca de exercícios, geração automática,
 * assinatura de perfil e resumos usados pelo sistema completo de treinos.
 */

import { nanoid } from 'nanoid';

export type WorkoutObjective = 'ganhar_massa' | 'perder_gordura' | 'manter_peso' | 'definicao' | 'resistencia';
export type WorkoutLevel = 'iniciante' | 'intermediario' | 'avancado';
export type TrainingLocation = 'academia' | 'casa';
export type UserSex = 'masculino' | 'feminino' | 'outro';
export type WorkoutMode = 'unset' | 'auto' | 'manual';

export interface WorkoutProfileInput {
  goal: WorkoutObjective;
  age: number;
  weight: number;
  height: number;
  sex: UserSex;
  level: WorkoutLevel;
  trainingFrequency: number;
  trainingLocation: TrainingLocation;
  availableEquipment: string[];
  limitations: string;
}

export interface WorkoutExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryGroups: string[];
  levels: WorkoutLevel[];
  locations: TrainingLocation[];
  equipment: string[];
  tags: string[];
  contraindications: string[];
  videoUrl: string;
  instructions: string;
  defaultSets: Record<WorkoutLevel, number>;
  defaultReps: Record<WorkoutLevel, number>;
  defaultRestSeconds: Record<WorkoutLevel, number>;
}

export interface GeneratedWorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryGroups: string[];
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
  notes?: string;
  instructions?: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface GeneratedWorkout {
  id: string;
  name: string;
  muscleGroups: string[];
  exercises: GeneratedWorkoutExercise[];
  createdAt: string;
  lastPerformed?: string;
  durationMinutes?: number;
  origin: 'auto' | 'manual';
  dayKey: string;
}

export interface AutoPlanSummary {
  split: string;
  reasoning: string;
  weeklyDays: string[];
  generatedFrom: string;
}

const EXERCISE_LIBRARY: WorkoutExerciseTemplate[] = [
  {
    id: 'agachamento-livre',
    name: 'Agachamento Livre',
    muscleGroup: 'Pernas',
    secondaryGroups: ['Glúteos', 'Core'],
    levels: ['intermediario', 'avancado'],
    locations: ['academia'],
    equipment: ['barra', 'rack'],
    tags: ['composto', 'forca'],
    contraindications: ['joelho', 'lombar'],
    videoUrl: 'https://videos.pexels.com/video-files/7934710/7934710-sd_640_360_25fps.mp4',
    instructions: 'Mantenha o abdômen firme, desça com controle e preserve a coluna neutra.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 5 },
    defaultReps: { iniciante: 10, intermediario: 8, avancado: 6 },
    defaultRestSeconds: { iniciante: 75, intermediario: 90, avancado: 120 },
  },
  {
    id: 'leg-press',
    name: 'Leg Press 45°',
    muscleGroup: 'Pernas',
    secondaryGroups: ['Glúteos'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia'],
    equipment: ['leg press'],
    tags: ['maquina', 'volume'],
    contraindications: ['joelho'],
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
    instructions: 'Controle a descida e evite estender totalmente os joelhos no topo.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 10 },
    defaultRestSeconds: { iniciante: 60, intermediario: 75, avancado: 90 },
  },
  {
    id: 'levantamento-romeno',
    name: 'Levantamento Romeno',
    muscleGroup: 'Posterior',
    secondaryGroups: ['Glúteos', 'Lombar'],
    levels: ['intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: ['barra', 'halteres'],
    tags: ['posterior', 'composto'],
    contraindications: ['lombar'],
    videoUrl: 'https://www.youtube.com/watch?v=2SHsk9AzdjA',
    instructions: 'Empurre o quadril para trás e mantenha os ombros encaixados durante o movimento.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 10, intermediario: 8, avancado: 8 },
    defaultRestSeconds: { iniciante: 75, intermediario: 90, avancado: 105 },
  },
  {
    id: 'supino-reto',
    name: 'Supino Reto',
    muscleGroup: 'Peito',
    secondaryGroups: ['Tríceps', 'Ombro'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia'],
    equipment: ['barra', 'banco'],
    tags: ['composto', 'forca'],
    contraindications: ['ombro'],
    videoUrl: 'https://videos.pexels.com/video-files/5320001/5320001-sd_640_360_25fps.mp4',
    instructions: 'Mantenha os pés firmes no chão, escápulas encaixadas e trajetória controlada.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 5 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 6 },
    defaultRestSeconds: { iniciante: 60, intermediario: 90, avancado: 120 },
  },
  {
    id: 'supino-halteres',
    name: 'Supino com Halteres',
    muscleGroup: 'Peito',
    secondaryGroups: ['Tríceps', 'Ombro'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: ['halteres', 'banco'],
    tags: ['hipertrofia'],
    contraindications: ['ombro'],
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    instructions: 'Controle a amplitude e evite perder estabilidade no punho.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 8 },
    defaultRestSeconds: { iniciante: 60, intermediario: 75, avancado: 90 },
  },
  {
    id: 'flexao',
    name: 'Flexão de Braço',
    muscleGroup: 'Peito',
    secondaryGroups: ['Tríceps', 'Core'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['casa', 'academia'],
    equipment: [],
    tags: ['peso corporal', 'casa'],
    contraindications: ['punho', 'ombro'],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    instructions: 'Forme uma linha reta dos ombros aos pés e desça com o peitoral em direção ao chão.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 15, avancado: 20 },
    defaultRestSeconds: { iniciante: 45, intermediario: 45, avancado: 60 },
  },
  {
    id: 'remada-baixa',
    name: 'Remada Baixa',
    muscleGroup: 'Costas',
    secondaryGroups: ['Bíceps'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia'],
    equipment: ['cabo'],
    tags: ['maquina', 'costas'],
    contraindications: ['lombar'],
    videoUrl: 'https://videos.pexels.com/video-files/4920820/4920820-sd_640_360_25fps.mp4',
    instructions: 'Puxe com os cotovelos, mantenha o peito aberto e evite compensar com o tronco.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 8 },
    defaultRestSeconds: { iniciante: 60, intermediario: 75, avancado: 90 },
  },
  {
    id: 'puxada-frente',
    name: 'Puxada Frente',
    muscleGroup: 'Costas',
    secondaryGroups: ['Bíceps'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia'],
    equipment: ['polia'],
    tags: ['vertical pull'],
    contraindications: ['ombro'],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    instructions: 'Leve a barra em direção ao peito com escápulas deprimidas e cotovelos apontando para baixo.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 8 },
    defaultRestSeconds: { iniciante: 60, intermediario: 75, avancado: 90 },
  },
  {
    id: 'remada-halter',
    name: 'Remada Unilateral com Halter',
    muscleGroup: 'Costas',
    secondaryGroups: ['Bíceps', 'Core'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['casa', 'academia'],
    equipment: ['halteres', 'banco'],
    tags: ['unilateral'],
    contraindications: ['lombar'],
    videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
    instructions: 'Evite rodar o tronco e puxe o cotovelo para perto do quadril.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 8 },
    defaultRestSeconds: { iniciante: 60, intermediario: 60, avancado: 75 },
  },
  {
    id: 'desenvolvimento-halteres',
    name: 'Desenvolvimento com Halteres',
    muscleGroup: 'Ombro',
    secondaryGroups: ['Tríceps'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: ['halteres'],
    tags: ['ombro', 'composto'],
    contraindications: ['ombro'],
    videoUrl: 'https://www.youtube.com/watch?v=B-aVuyhvLHU',
    instructions: 'Suba os halteres sem perder alinhamento do punho e do ombro.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 8 },
    defaultRestSeconds: { iniciante: 60, intermediario: 75, avancado: 90 },
  },
  {
    id: 'elevacao-lateral',
    name: 'Elevação Lateral',
    muscleGroup: 'Ombro',
    secondaryGroups: [],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: ['halteres', 'elastico'],
    tags: ['isolador'],
    contraindications: ['ombro'],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    instructions: 'Eleve até a linha do ombro sem compensar com balanço do tronco.',
    defaultSets: { iniciante: 3, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 15, intermediario: 15, avancado: 12 },
    defaultRestSeconds: { iniciante: 45, intermediario: 45, avancado: 60 },
  },
  {
    id: 'rosca-direta',
    name: 'Rosca Direta',
    muscleGroup: 'Bíceps',
    secondaryGroups: ['Antebraço'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: ['barra', 'halteres', 'elastico'],
    tags: ['isolador'],
    contraindications: ['cotovelo'],
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    instructions: 'Mantenha os cotovelos fixos e suba sem impulsionar com o quadril.',
    defaultSets: { iniciante: 3, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 8 },
    defaultRestSeconds: { iniciante: 45, intermediario: 60, avancado: 60 },
  },
  {
    id: 'triceps-corda',
    name: 'Tríceps na Corda',
    muscleGroup: 'Tríceps',
    secondaryGroups: [],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia'],
    equipment: ['cabo'],
    tags: ['isolador'],
    contraindications: ['cotovelo'],
    videoUrl: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
    instructions: 'Estenda os cotovelos por completo e separe a corda ao final do movimento.',
    defaultSets: { iniciante: 3, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 12, avancado: 10 },
    defaultRestSeconds: { iniciante: 45, intermediario: 45, avancado: 60 },
  },
  {
    id: 'triceps-banco',
    name: 'Mergulho no Banco',
    muscleGroup: 'Tríceps',
    secondaryGroups: ['Peito'],
    levels: ['iniciante', 'intermediario'],
    locations: ['casa', 'academia'],
    equipment: ['banco', 'cadeira'],
    tags: ['peso corporal'],
    contraindications: ['ombro', 'punho'],
    videoUrl: 'https://www.youtube.com/watch?v=0326dy_-CzM',
    instructions: 'Desça com os cotovelos apontando para trás e preserve o ombro estável.',
    defaultSets: { iniciante: 3, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 10, intermediario: 12, avancado: 15 },
    defaultRestSeconds: { iniciante: 45, intermediario: 60, avancado: 60 },
  },
  {
    id: 'afundo',
    name: 'Afundo Alternado',
    muscleGroup: 'Pernas',
    secondaryGroups: ['Glúteos'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: ['halteres'],
    tags: ['unilateral'],
    contraindications: ['joelho'],
    videoUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    instructions: 'Mantenha o joelho da frente alinhado ao pé e o tronco firme.',
    defaultSets: { iniciante: 3, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 10, intermediario: 12, avancado: 12 },
    defaultRestSeconds: { iniciante: 60, intermediario: 60, avancado: 75 },
  },
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'Glúteos',
    secondaryGroups: ['Posterior'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: ['barra', 'halteres', 'banco'],
    tags: ['gluteos'],
    contraindications: ['lombar'],
    videoUrl: 'https://www.youtube.com/watch?v=SEdqd1n0cvg',
    instructions: 'Suba o quadril até alinhar joelhos, quadril e ombros, contraindo os glúteos no topo.',
    defaultSets: { iniciante: 3, intermediario: 4, avancado: 4 },
    defaultReps: { iniciante: 12, intermediario: 10, avancado: 8 },
    defaultRestSeconds: { iniciante: 60, intermediario: 75, avancado: 90 },
  },
  {
    id: 'prancha',
    name: 'Prancha Isométrica',
    muscleGroup: 'Core',
    secondaryGroups: ['Abdômen'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: [],
    tags: ['core', 'estabilidade'],
    contraindications: ['lombar'],
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    instructions: 'Ative abdômen e glúteos para evitar que o quadril afunde.',
    defaultSets: { iniciante: 3, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 30, intermediario: 40, avancado: 50 },
    defaultRestSeconds: { iniciante: 30, intermediario: 30, avancado: 45 },
  },
  {
    id: 'abdominal-bicicleta',
    name: 'Abdominal Bicicleta',
    muscleGroup: 'Abdômen',
    secondaryGroups: ['Core'],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: [],
    tags: ['abdomen'],
    contraindications: ['lombar'],
    videoUrl: 'https://www.youtube.com/watch?v=9FGilxCbdz8',
    instructions: 'Gire o tronco com controle e mantenha a lombar próxima ao chão.',
    defaultSets: { iniciante: 3, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 16, intermediario: 20, avancado: 24 },
    defaultRestSeconds: { iniciante: 30, intermediario: 30, avancado: 45 },
  },
  {
    id: 'burpee',
    name: 'Burpee',
    muscleGroup: 'Condicionamento',
    secondaryGroups: ['Peito', 'Pernas', 'Core'],
    levels: ['intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: [],
    tags: ['metabolico', 'cardio'],
    contraindications: ['joelho', 'ombro', 'lombar'],
    videoUrl: 'https://www.youtube.com/watch?v=TU8QYVW0gDU',
    instructions: 'Mantenha ritmo controlado e priorize técnica antes de velocidade.',
    defaultSets: { iniciante: 2, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 8, intermediario: 10, avancado: 12 },
    defaultRestSeconds: { iniciante: 60, intermediario: 60, avancado: 75 },
  },
  {
    id: 'corrida-esteira',
    name: 'Corrida na Esteira',
    muscleGroup: 'Condicionamento',
    secondaryGroups: [],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia'],
    equipment: ['esteira'],
    tags: ['cardio'],
    contraindications: ['joelho'],
    videoUrl: 'https://www.youtube.com/watch?v=_kGESn8ArrU',
    instructions: 'Ajuste o ritmo para sua capacidade e mantenha postura ereta com passada natural.',
    defaultSets: { iniciante: 1, intermediario: 1, avancado: 1 },
    defaultReps: { iniciante: 12, intermediario: 15, avancado: 20 },
    defaultRestSeconds: { iniciante: 0, intermediario: 0, avancado: 0 },
  },
  {
    id: 'polichinelo',
    name: 'Polichinelo',
    muscleGroup: 'Condicionamento',
    secondaryGroups: [],
    levels: ['iniciante', 'intermediario', 'avancado'],
    locations: ['academia', 'casa'],
    equipment: [],
    tags: ['cardio', 'aquecimento'],
    contraindications: ['joelho'],
    videoUrl: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
    instructions: 'Mantenha aterrissagem suave e ritmo constante ao longo da série.',
    defaultSets: { iniciante: 2, intermediario: 3, avancado: 4 },
    defaultReps: { iniciante: 30, intermediario: 40, avancado: 50 },
    defaultRestSeconds: { iniciante: 30, intermediario: 30, avancado: 30 },
  },
];

const DAY_LABELS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const SPLITS: Record<string, Array<{ key: string; label: string; groups: string[] }>> = {
  fullbody_3: [
    { key: 'day-1', label: 'Dia 1', groups: ['Peito', 'Costas', 'Pernas', 'Core'] },
    { key: 'day-2', label: 'Dia 2', groups: ['Ombro', 'Glúteos', 'Posterior', 'Abdômen'] },
    { key: 'day-3', label: 'Dia 3', groups: ['Peito', 'Costas', 'Pernas', 'Condicionamento'] },
  ],
  upper_lower_4: [
    { key: 'upper-1', label: 'Upper A', groups: ['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps'] },
    { key: 'lower-1', label: 'Lower A', groups: ['Pernas', 'Glúteos', 'Posterior', 'Abdômen'] },
    { key: 'upper-2', label: 'Upper B', groups: ['Costas', 'Peito', 'Ombro', 'Bíceps', 'Tríceps'] },
    { key: 'lower-2', label: 'Lower B', groups: ['Pernas', 'Posterior', 'Glúteos', 'Core'] },
  ],
  bro_split_5: [
    { key: 'push', label: 'Push', groups: ['Peito', 'Ombro', 'Tríceps'] },
    { key: 'pull', label: 'Pull', groups: ['Costas', 'Bíceps', 'Antebraço'] },
    { key: 'legs', label: 'Legs', groups: ['Pernas', 'Glúteos', 'Posterior', 'Panturrilha'] },
    { key: 'upper', label: 'Upper Detail', groups: ['Peito', 'Costas', 'Ombro'] },
    { key: 'conditioning', label: 'Conditioning', groups: ['Core', 'Abdômen', 'Condicionamento'] },
  ],
  bro_split_6: [
    { key: 'push-1', label: 'Push A', groups: ['Peito', 'Ombro', 'Tríceps'] },
    { key: 'pull-1', label: 'Pull A', groups: ['Costas', 'Bíceps'] },
    { key: 'legs-1', label: 'Legs A', groups: ['Pernas', 'Glúteos', 'Posterior'] },
    { key: 'push-2', label: 'Push B', groups: ['Peito', 'Ombro', 'Tríceps'] },
    { key: 'pull-2', label: 'Pull B', groups: ['Costas', 'Bíceps', 'Core'] },
    { key: 'legs-2', label: 'Legs B', groups: ['Pernas', 'Posterior', 'Panturrilha', 'Abdômen'] },
  ],
};

export function getExerciseLibrary() {
  return EXERCISE_LIBRARY;
}

export function profileSignature(profile: WorkoutProfileInput) {
  return [
    profile.goal,
    profile.level,
    profile.sex,
    profile.age,
    profile.weight,
    profile.height,
    profile.trainingFrequency,
    profile.trainingLocation,
    profile.availableEquipment.slice().sort().join(','),
    sanitize(profile.limitations),
  ].join('|');
}

export function resolveSplit(profile: WorkoutProfileInput) {
  const days = Math.max(2, Math.min(profile.trainingFrequency || 3, 6));
  if (days <= 3) {
    return {
      key: 'fullbody_3',
      name: 'Full Body',
      reasoning: 'A frequência semanal favorece estímulos completos por sessão para acelerar adaptação e consistência.',
      days: SPLITS.fullbody_3.slice(0, days),
    };
  }

  if (days === 4) {
    return {
      key: 'upper_lower_4',
      name: 'Upper / Lower',
      reasoning: 'A divisão superior e inferior equilibra recuperação com volume suficiente para evolução semanal.',
      days: SPLITS.upper_lower_4,
    };
  }

  return {
    key: days === 5 ? 'bro_split_5' : 'bro_split_6',
    name: 'Divisão por Grupos Musculares',
    reasoning: 'A maior frequência permite distribuir grupos musculares e elevar o volume total com recuperação adequada.',
    days: (days === 5 ? SPLITS.bro_split_5 : SPLITS.bro_split_6),
  };
}

export function generateAutoWorkouts(profile: WorkoutProfileInput): { workouts: GeneratedWorkout[]; summary: AutoPlanSummary } {
  const split = resolveSplit(profile);
  const createdAt = new Date().toISOString();

  const workouts = split.days.map((day, index) => {
    const exercises = selectExercisesForGroups(day.groups, profile);
    const filteredGroups = Array.from(new Set(exercises.map(exercise => exercise.muscleGroup)));

    return {
      id: nanoid(),
      name: `${DAY_LABELS[index] ?? `Dia ${index + 1}`} — ${day.label}`,
      muscleGroups: filteredGroups,
      exercises,
      createdAt,
      durationMinutes: estimateDuration(exercises),
      origin: 'auto' as const,
      dayKey: day.key,
    };
  });

  return {
    workouts,
    summary: {
      split: split.name,
      reasoning: split.reasoning,
      weeklyDays: workouts.map(workout => workout.name),
      generatedFrom: profileSignature(profile),
    },
  };
}

export function getRecommendedExercises(profile: WorkoutProfileInput, muscleGroup?: string) {
  const limitations = sanitize(profile.limitations);
  return EXERCISE_LIBRARY.filter(exercise => {
    const locationOk = exercise.locations.includes(profile.trainingLocation);
    const levelOk = exercise.levels.includes(profile.level);
    const muscleOk = muscleGroup ? exercise.muscleGroup === muscleGroup || exercise.secondaryGroups.includes(muscleGroup) : true;
    const equipmentOk = exercise.equipment.length === 0 || exercise.equipment.some(item => profile.availableEquipment.includes(item));
    const restrictionBlocked = exercise.contraindications.some(tag => limitations.includes(sanitize(tag)));
    return locationOk && levelOk && muscleOk && (profile.trainingLocation === 'casa' ? equipmentOk || exercise.equipment.length === 0 : true) && !restrictionBlocked;
  });
}

export function buildExerciseFromTemplate(template: WorkoutExerciseTemplate, profile: WorkoutProfileInput): GeneratedWorkoutExercise {
  const reps = adaptRepsForGoal(template.defaultReps[profile.level], profile.goal);
  const restSeconds = adaptRestForGoal(template.defaultRestSeconds[profile.level], profile.goal);
  return {
    id: nanoid(),
    name: template.name,
    muscleGroup: template.muscleGroup,
    secondaryGroups: template.secondaryGroups,
    sets: template.defaultSets[profile.level],
    reps,
    weight: 0,
    restSeconds,
    notes: buildExerciseNote(template, profile.goal),
    instructions: template.instructions,
    videoUrl: template.videoUrl,
    completed: false,
  };
}

function selectExercisesForGroups(groups: string[], profile: WorkoutProfileInput) {
  const picked: GeneratedWorkoutExercise[] = [];
  const usedIds = new Set<string>();

  groups.forEach(group => {
    const candidates = getRecommendedExercises(profile, group)
      .filter(candidate => !usedIds.has(candidate.id))
      .sort((a, b) => rankExercise(a, group, profile) - rankExercise(b, group, profile));

    const quantity = desiredExerciseCount(group, profile);
    candidates.slice(0, quantity).forEach(candidate => {
      usedIds.add(candidate.id);
      picked.push(buildExerciseFromTemplate(candidate, profile));
    });
  });

  if (picked.length < minimumExercises(profile)) {
    getRecommendedExercises(profile)
      .filter(candidate => !usedIds.has(candidate.id))
      .sort((a, b) => rankExercise(a, a.muscleGroup, profile) - rankExercise(b, b.muscleGroup, profile))
      .slice(0, minimumExercises(profile) - picked.length)
      .forEach(candidate => {
        usedIds.add(candidate.id);
        picked.push(buildExerciseFromTemplate(candidate, profile));
      });
  }

  return picked.slice(0, maximumExercises(profile));
}

function desiredExerciseCount(group: string, profile: WorkoutProfileInput) {
  if (group === 'Condicionamento') return profile.goal === 'ganhar_massa' ? 1 : 2;
  if (group === 'Core' || group === 'Abdômen') return 1;
  if (profile.level === 'iniciante') return 1;
  if (profile.level === 'avancado') return 2;
  return 1;
}

function minimumExercises(profile: WorkoutProfileInput) {
  if (profile.level === 'iniciante') return 4;
  if (profile.level === 'avancado') return 6;
  return 5;
}

function maximumExercises(profile: WorkoutProfileInput) {
  if (profile.level === 'iniciante') return 6;
  if (profile.level === 'avancado') return 8;
  return 7;
}

function rankExercise(exercise: WorkoutExerciseTemplate, targetGroup: string, profile: WorkoutProfileInput) {
  let score = 0;
  if (exercise.muscleGroup !== targetGroup) score += 3;
  if (exercise.tags.includes('maquina') && profile.trainingLocation === 'casa') score += 5;
  if (exercise.tags.includes('cardio') && profile.goal === 'ganhar_massa') score += 2;
  if (exercise.tags.includes('forca') && profile.goal === 'perder_gordura') score += 1;
  if (exercise.equipment.length > 0 && profile.trainingLocation === 'casa') {
    const missingEquipment = exercise.equipment.every(item => !profile.availableEquipment.includes(item));
    if (missingEquipment) score += 8;
  }
  return score;
}

function estimateDuration(exercises: GeneratedWorkoutExercise[]) {
  const total = exercises.reduce((sum, exercise) => {
    const workSeconds = Math.max(exercise.reps * 4, 30);
    return sum + exercise.sets * (workSeconds + exercise.restSeconds);
  }, 0);
  return Math.max(25, Math.round(total / 60));
}

function adaptRepsForGoal(baseReps: number, goal: WorkoutObjective) {
  if (goal === 'ganhar_massa') return Math.max(6, baseReps - 1);
  if (goal === 'perder_gordura' || goal === 'resistencia') return baseReps + 2;
  if (goal === 'definicao') return baseReps + 1;
  return baseReps;
}

function adaptRestForGoal(baseRest: number, goal: WorkoutObjective) {
  if (goal === 'ganhar_massa') return baseRest + 15;
  if (goal === 'perder_gordura' || goal === 'resistencia') return Math.max(30, baseRest - 15);
  return baseRest;
}

function buildExerciseNote(template: WorkoutExerciseTemplate, goal: WorkoutObjective) {
  if (goal === 'ganhar_massa') return `Foco em controle excêntrico e progressão de carga em ${template.name.toLowerCase()}.`;
  if (goal === 'perder_gordura') return `Mantenha o intervalo curto para aumentar densidade do treino em ${template.name.toLowerCase()}.`;
  if (goal === 'resistencia') return `Priorize ritmo estável e técnica limpa em ${template.name.toLowerCase()}.`;
  return template.instructions;
}

function sanitize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
