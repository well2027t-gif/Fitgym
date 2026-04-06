/**
 * FitPro — Workouts Page
 * Design: Premium Dark Fitness / Performance Editorial
 * Esta tela funciona como hub do sistema de treinos: diagnóstico do perfil,
 * geração automática, modo manual, biblioteca de exercícios e acesso rápido à execução.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Dumbbell,
  Flame,
  Layers3,
  PencilLine,
  Play,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  UserRound,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from '@/lib/router';
import { type Exercise, type Goal, type Workout, useApp } from '@/contexts/AppContext';
import {
  buildExerciseFromTemplate,
  getExerciseLibrary,
  getRecommendedExercises,
  type WorkoutProfileInput,
} from '@/lib/workoutEngine';

const HERO_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-workout-bg-ZvMSyEQH7ULJ9PwivEHvMf.webp';

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombro',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Posterior',
  'Abdômen',
  'Core',
  'Condicionamento',
] as const;

const GOAL_LABELS: Record<Goal, string> = {
  ganhar_massa: 'Hipertrofia',
  perder_gordura: 'Perda de gordura',
  manter_peso: 'Manutenção',
  definicao: 'Definição',
  resistencia: 'Resistência',
};

function buildProfileInput(stateProfile: ReturnType<typeof useApp>['state']['profile']): WorkoutProfileInput {
  return {
    goal: stateProfile.goal,
    age: stateProfile.age,
    weight: stateProfile.weight,
    height: stateProfile.height,
    sex: stateProfile.sex,
    level: stateProfile.level,
    trainingFrequency: stateProfile.trainingFrequency,
    trainingLocation: stateProfile.trainingLocation,
    availableEquipment: stateProfile.availableEquipment,
    limitations: stateProfile.limitations,
  };
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[28px] border p-4 shadow-[0_22px_60px_rgba(0,0,0,0.28)] ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(14,14,16,0.98) 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div
      className="rounded-3xl border p-3"
      style={{ background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Outfit' }}>
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
        {value}
      </p>
      <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
        {hint}
      </p>
    </div>
  );
}

function ModeButton({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-[26px] border p-4 text-left transition-transform active:scale-[0.99]"
      style={{
        background: active
          ? 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.18) 0%, rgba(var(--theme-accent-rgb), 0.08) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        borderColor: active ? 'rgba(var(--theme-accent-rgb), 0.32)' : 'rgba(255,255,255,0.08)',
        boxShadow: active ? '0 18px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(var(--theme-accent-rgb), 0.12) inset' : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-11 items-center justify-center rounded-2xl"
          style={{
            background: active ? 'rgba(var(--theme-accent-rgb), 0.18)' : 'rgba(255,255,255,0.06)',
            color: active ? 'var(--theme-accent)' : 'rgba(255,255,255,0.72)',
          }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            {title}
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.54)', fontFamily: 'Outfit' }}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function WorkoutCard({
  workout,
  isToday,
  onStart,
  onSetToday,
  onDelete,
}: {
  workout: Workout;
  isToday: boolean;
  onStart: () => void;
  onSetToday: () => void;
  onDelete: () => void;
}) {
  const totalWork = workout.exercises.reduce((sum, exercise) => sum + (exercise.sets * Math.max(exercise.reps, 1)), 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[28px] border p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(26,26,29,0.96) 0%, rgba(13,13,15,0.98) 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-20"
        style={{ background: 'radial-gradient(circle at top right, rgba(var(--theme-accent-rgb), 0.18) 0%, rgba(0,0,0,0) 60%)' }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  background: workout.origin === 'auto' ? 'rgba(var(--theme-accent-rgb), 0.14)' : 'rgba(255,255,255,0.08)',
                  color: workout.origin === 'auto' ? 'var(--theme-accent)' : 'rgba(255,255,255,0.7)',
                  fontFamily: 'Space Grotesk',
                }}
              >
                {workout.origin === 'auto' ? 'Automático' : 'Manual'}
              </span>
              {isToday && (
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ background: 'rgba(132,204,22,0.16)', color: '#a3e635', fontFamily: 'Space Grotesk' }}
                >
                  Hoje
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {workout.name}
            </h3>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
              {workout.muscleGroups.join(' • ')}
            </p>
          </div>
          <button
            onClick={onDelete}
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.62)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <MetricCard label="Exercícios" value={String(workout.exercises.length)} hint="blocos" />
          <MetricCard label="Volume" value={String(totalWork)} hint="reps totais" />
          <MetricCard label="Duração" value={`${workout.durationMinutes ?? 45} min`} hint="estimativa" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
          >
            <Play size={15} />
            Iniciar treino
          </button>
          {!isToday && (
            <button
              onClick={onSetToday}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit' }}
            >
              <CalendarDays size={15} />
              Marcar para hoje
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {workout.exercises.slice(0, 4).map(exercise => (
            <div
              key={exercise.id}
              className="flex items-center justify-between rounded-2xl border px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div>
                <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {exercise.name}
                </p>
                <p className="mt-0.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                  {exercise.sets} séries • {exercise.reps} reps • descanso {exercise.restSeconds}s
                </p>
              </div>
              <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </div>
          ))}
          {workout.exercises.length > 4 && (
            <p className="pt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Outfit' }}>
              +{workout.exercises.length - 4} exercícios adicionais dentro do treino.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ExerciseLibraryRow({
  exercise,
  onAdd,
}: {
  exercise: ReturnType<typeof getExerciseLibrary>[number];
  onAdd: () => void;
}) {
  return (
    <div
      className="rounded-[24px] border p-3"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            {exercise.name}
          </p>
          <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
            {exercise.muscleGroup} • {exercise.locations.join(' / ')} • {exercise.levels.join(' / ')}
          </p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)', fontFamily: 'Outfit' }}>
            {exercise.instructions}
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold"
          style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}
        >
          <Plus size={14} />
          Adicionar
        </button>
      </div>
    </div>
  );
}

export default function Workouts() {
  const {
    state,
    needsWorkoutRefresh,
    addWorkout,
    addExerciseToWorkout,
    deleteWorkout,
    generateAutoWorkoutPlan,
    replaceWorkouts,
    setTodayWorkout,
    updateWorkoutMode,
  } = useApp();
  const [, navigate] = useLocation();

  const [manualWorkoutName, setManualWorkoutName] = useState('');
  const [manualMuscles, setManualMuscles] = useState<string[]>(['Peito', 'Tríceps']);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(state.workouts[0]?.id ?? null);
  const [libraryFilter, setLibraryFilter] = useState<string>('Todos');

  const profileInput = useMemo(() => buildProfileInput(state.profile), [state.profile]);

  const recentSessions = useMemo(() => state.workoutSessions.slice(-7).reverse(), [state.workoutSessions]);
  const totalExercises = useMemo(
    () => state.workouts.reduce((sum, workout) => sum + workout.exercises.length, 0),
    [state.workouts],
  );

  const recommendedExercises = useMemo(() => {
    if (libraryFilter === 'Todos') {
      return getRecommendedExercises(profileInput).slice(0, 10);
    }
    return getRecommendedExercises(profileInput, libraryFilter).slice(0, 10);
  }, [profileInput, libraryFilter]);

  const selectedWorkout = state.workouts.find(workout => workout.id === selectedWorkoutId) ?? null;

  const handleGenerateAutomatic = () => {
    generateAutoWorkoutPlan();
    toast.success('Plano automático atualizado com base no seu perfil.');
  };

  const handleChooseAuto = () => {
    updateWorkoutMode('auto');
    handleGenerateAutomatic();
  };

  const handleChooseManual = () => {
    updateWorkoutMode('manual');
    if (state.workouts.length === 0) {
      setSelectedWorkoutId(null);
    }
    toast.success('Modo manual ativado. Agora você pode montar seus treinos.');
  };

  const handleResetManual = () => {
    replaceWorkouts([], { mode: 'manual', sourceSignature: null, summary: null });
    setSelectedWorkoutId(null);
    toast.success('Área de treinos manuais limpa.');
  };

  const handleCreateManualWorkout = () => {
    const cleanName = manualWorkoutName.trim();
    if (!cleanName) {
      toast.error('Dê um nome para o treino antes de criar.');
      return;
    }
    if (manualMuscles.length === 0) {
      toast.error('Selecione pelo menos um foco muscular.');
      return;
    }

    const workout = addWorkout({
      name: cleanName,
      muscleGroups: manualMuscles,
      exercises: [],
      durationMinutes: 45,
      origin: 'manual',
      dayKey: `manual-${Date.now()}`,
    });

    updateWorkoutMode('manual');
    setSelectedWorkoutId(workout.id);
    setManualWorkoutName('');
    toast.success('Treino manual criado. Agora adicione exercícios da biblioteca.');
  };

  const handleAddExercise = (template: ReturnType<typeof getExerciseLibrary>[number]) => {
    if (!selectedWorkout) {
      toast.error('Selecione ou crie um treino manual antes de adicionar exercícios.');
      return;
    }

    const exercise = buildExerciseFromTemplate(template, profileInput);
    addExerciseToWorkout(selectedWorkout.id, exercise);
    toast.success(`${template.name} adicionado ao treino.`);
  };

  const handleDeleteWorkout = (workout: Workout) => {
    deleteWorkout(workout.id);
    if (selectedWorkoutId === workout.id) {
      const next = state.workouts.find(item => item.id !== workout.id);
      setSelectedWorkoutId(next?.id ?? null);
    }
    toast.success('Treino removido.');
  };

  return (
    <div className="min-h-screen pb-28" style={{ background: '#0d0d0f' }}>
      <div className="px-4 pb-8 pt-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[34px] border p-5"
          style={{
            background: 'linear-gradient(160deg, rgba(22,22,24,0.98) 0%, rgba(11,11,13,0.98) 100%)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.34)',
          }}
        >
          <img
            src={HERO_IMAGE}
            alt="Treino premium"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(7,7,8,0.34) 0%, rgba(7,7,8,0.88) 78%)' }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.66)', fontFamily: 'Space Grotesk' }}>
              <Sparkles size={12} />
              Sistema de treinos
            </div>

            <div className="mt-4 max-w-sm">
              <h1 className="text-[30px] font-bold leading-[1.02] text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Seu plano agora responde ao seu perfil e ao seu jeito de treinar.
              </h1>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.62)', fontFamily: 'Outfit' }}>
                O FitGym cruza objetivo, nível, frequência, local de treino e limitações para sugerir uma estrutura melhor. Se preferir, você também pode montar tudo manualmente.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <MetricCard label="Objetivo" value={GOAL_LABELS[state.profile.goal]} hint="direção principal" />
              <MetricCard label="Frequência" value={`${state.profile.trainingFrequency}x`} hint="por semana" />
              <MetricCard label="Modo" value={state.workoutMode === 'auto' ? 'Auto' : state.workoutMode === 'manual' ? 'Manual' : 'Escolher'} hint="planejamento" />
            </div>
          </div>
        </motion.section>

        <div className="mt-4 grid gap-4">
          <Panel>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
                  Tipo de treino
                </p>
                <h2 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Escolha como você quer organizar sua semana.
                </h2>
              </div>
              <div
                className="rounded-2xl border px-3 py-2 text-[11px]"
                style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}
              >
                Perfil ativo
              </div>
            </div>

            <div className="grid gap-3">
              <ModeButton
                active={state.workoutMode === 'auto'}
                title="Treino automático"
                description="O app monta e atualiza sua divisão com base no seu perfil atual, usando um raciocínio coerente com frequência, local e limitações."
                icon={<Bot size={18} />}
                onClick={handleChooseAuto}
              />
              <ModeButton
                active={state.workoutMode === 'manual'}
                title="Treino manual"
                description="Você escolhe os dias, a divisão muscular e os exercícios. Ideal para quem já tem estrutura própria ou quer personalizar tudo."
                icon={<PencilLine size={18} />}
                onClick={handleChooseManual}
              />
            </div>
          </Panel>

          <Panel>
            <div className="flex items-start gap-3">
              <div
                className="flex size-12 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', color: 'var(--theme-accent)' }}
              >
                <UserRound size={18} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Perfil usado para treinos
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                  Esses dados determinam o volume, a divisão e as recomendações da biblioteca.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <MetricCard label="Nível" value={state.profile.level} hint="ajuste de intensidade" />
              <MetricCard label="Local" value={state.profile.trainingLocation} hint="academia ou casa" />
              <MetricCard label="Equipamentos" value={String(state.profile.availableEquipment.length)} hint="itens informados" />
              <MetricCard label="Limitações" value={state.profile.limitations ? 'Sim' : 'Não'} hint="impacto na seleção" />
            </div>

            <button
              onClick={() => navigate('/perfil')}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
              style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit' }}
            >
              Ajustar perfil de treino
              <ArrowRight size={15} />
            </button>
          </Panel>

          {state.workoutMode === 'auto' && (
            <Panel>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
                    Plano automático
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {state.workoutAutoSummary?.split ?? 'Plano inteligente'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                    {state.workoutAutoSummary?.reasoning ?? 'O app ainda não gerou uma justificativa para este plano.'}
                  </p>
                </div>
                <button
                  onClick={handleGenerateAutomatic}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold"
                  style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <RefreshCcw size={15} />
                  Regenerar
                </button>
              </div>

              {needsWorkoutRefresh && (
                <div
                  className="mt-4 rounded-[24px] border p-4"
                  style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-amber-400">
                      <Wand2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                        Seu perfil mudou desde a última geração.
                      </p>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)', fontFamily: 'Outfit' }}>
                        Atualize o plano para refletir a nova frequência, equipamentos, objetivo ou limitações registradas no perfil.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          )}

          {state.workoutMode === 'manual' && (
            <>
              <Panel>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
                      Construtor manual
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      Monte a sua própria divisão semanal.
                    </h2>
                  </div>
                  <button
                    onClick={handleResetManual}
                    className="rounded-2xl border px-4 py-3 text-xs font-semibold text-white"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit' }}
                  >
                    Limpar tudo
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Space Grotesk' }}>
                      Nome do treino
                    </label>
                    <input
                      value={manualWorkoutName}
                      onChange={event => setManualWorkoutName(event.target.value)}
                      placeholder="Ex.: Upper A, Push, Pernas e glúteos"
                      className="h-12 w-full rounded-2xl border px-4 text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Space Grotesk' }}>
                      Focos musculares
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map(group => {
                        const active = manualMuscles.includes(group);
                        return (
                          <button
                            key={group}
                            onClick={() => setManualMuscles(current => current.includes(group) ? current.filter(item => item !== group) : [...current, group])}
                            className="rounded-full px-3 py-2 text-xs font-semibold"
                            style={{
                              background: active ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'rgba(255,255,255,0.05)',
                              color: active ? 'var(--theme-accent)' : 'rgba(255,255,255,0.65)',
                              fontFamily: 'Outfit',
                            }}
                          >
                            {group}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateManualWorkout}
                    className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold"
                    style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                  >
                    <Plus size={16} />
                    Criar treino manual
                  </button>
                </div>
              </Panel>

              <Panel>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
                      Biblioteca inteligente
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      Exercícios recomendados para o seu perfil.
                    </h2>
                    <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                      Selecione um treino manual e adicione exercícios já ajustados ao seu nível, local e objetivo.
                    </p>
                  </div>
                  <div
                    className="rounded-2xl border px-3 py-2 text-[11px]"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.54)', fontFamily: 'Outfit' }}
                  >
                    {selectedWorkout ? `Destino: ${selectedWorkout.name}` : 'Sem treino selecionado'}
                  </div>
                </div>

                {state.workouts.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Space Grotesk' }}>
                      Treino selecionado
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {state.workouts.map(workout => (
                        <button
                          key={workout.id}
                          onClick={() => setSelectedWorkoutId(workout.id)}
                          className="rounded-full px-3 py-2 text-xs font-semibold"
                          style={{
                            background: selectedWorkoutId === workout.id ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'rgba(255,255,255,0.05)',
                            color: selectedWorkoutId === workout.id ? 'var(--theme-accent)' : 'rgba(255,255,255,0.65)',
                            fontFamily: 'Outfit',
                          }}
                        >
                          {workout.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {['Todos', ...MUSCLE_GROUPS].map(group => (
                    <button
                      key={group}
                      onClick={() => setLibraryFilter(group)}
                      className="rounded-full px-3 py-2 text-xs font-semibold"
                      style={{
                        background: libraryFilter === group ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'rgba(255,255,255,0.05)',
                        color: libraryFilter === group ? 'var(--theme-accent)' : 'rgba(255,255,255,0.65)',
                        fontFamily: 'Outfit',
                      }}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                <div className="mt-4 space-y-3">
                  {recommendedExercises.length === 0 ? (
                    <div className="rounded-[24px] border p-4" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                        Nenhuma sugestão compatível encontrada.
                      </p>
                      <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                        Ajuste seu perfil de treino ou remova limitações muito restritivas para ampliar a biblioteca.
                      </p>
                    </div>
                  ) : (
                    recommendedExercises.map(exercise => (
                      <ExerciseLibraryRow
                        key={exercise.id}
                        exercise={exercise}
                        onAdd={() => handleAddExercise(exercise)}
                      />
                    ))
                  )}
                </div>
              </Panel>
            </>
          )}

          <Panel>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
                  Semana ativa
                </p>
                <h2 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Seus treinos prontos para execução.
                </h2>
              </div>
              <div className="rounded-2xl border px-3 py-2 text-[11px]" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.54)', fontFamily: 'Outfit' }}>
                {state.workouts.length} treinos • {totalExercises} exercícios
              </div>
            </div>

            {state.workouts.length === 0 ? (
              <div className="rounded-[28px] border p-5 text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="mx-auto flex size-14 items-center justify-center rounded-3xl" style={{ background: 'rgba(var(--theme-accent-rgb), 0.14)', color: 'var(--theme-accent)' }}>
                  <ClipboardList size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Nenhum treino configurado ainda.
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.54)', fontFamily: 'Outfit' }}>
                  Escolha o modo automático para receber uma divisão pronta ou o modo manual para começar do zero.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {state.workouts.map(workout => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      isToday={state.todayWorkoutId === workout.id}
                      onStart={() => navigate(`/treino-ativo/${workout.id}`)}
                      onSetToday={() => {
                        setTodayWorkout(workout.id);
                        toast.success('Treino definido para hoje.');
                      }}
                      onDelete={() => handleDeleteWorkout(workout)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Panel>

          <Panel>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
                  Histórico recente
                </p>
                <h2 className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Leitura rápida da sua consistência.
                </h2>
              </div>
              <button
                onClick={() => navigate('/historico')}
                className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
                style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit' }}
              >
                Ver análise
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Sessões" value={String(state.workoutSessions.length)} hint="registradas" />
              <MetricCard label="Sequência" value={`${state.stats.currentStreak}d`} hint="streak atual" />
              <MetricCard label="Pontos" value={String(state.stats.totalPoints)} hint="gamificação" />
            </div>

            <div className="mt-4 space-y-2">
              {recentSessions.length === 0 ? (
                <div className="rounded-[24px] border p-4" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    Você ainda não concluiu nenhum treino com o novo sistema.
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                    Assim que finalizar uma sessão, o app começará a preencher volume, progressão e streak.
                  </p>
                </div>
              ) : (
                recentSessions.map(session => {
                  const workout = state.workouts.find(item => item.id === session.workoutId);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-[24px] border p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                      <div>
                        <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                          {workout?.name ?? 'Treino concluído'}
                        </p>
                        <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
                          {new Date(session.date).toLocaleDateString('pt-BR')} • {session.completedExercises.length} exercícios completos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                          {Math.max(1, Math.round(session.durationSeconds / 60))} min
                        </p>
                        <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
                          {session.progressPercent ? `${session.progressPercent}%` : 'Sessão salva'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', color: 'var(--theme-accent)' }}>
                <Layers3 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  O que mudou nesta versão
                </h2>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                  Agora a área de treinos responde ao perfil do usuário, diferencia origem automática e manual, oferece biblioteca contextual e centraliza a execução semanal em uma única estrutura.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              {[
                { icon: <Bot size={16} />, title: 'Geração por perfil', desc: 'Usa objetivo, frequência, local, equipamentos e limitações.' },
                { icon: <PencilLine size={16} />, title: 'Construtor manual', desc: 'Crie seus próprios dias e alimente com a biblioteca local.' },
                { icon: <Flame size={16} />, title: 'Execução integrada', desc: 'Cada treino abre um fluxo próprio de conclusão e histórico.' },
                { icon: <Clock3 size={16} />, title: 'Histórico mais rico', desc: 'As próximas sessões passam a alimentar volume, PRs e sequência.' },
              ].map(item => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-[22px] border p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="mt-0.5 text-[var(--theme-accent)]">{item.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
