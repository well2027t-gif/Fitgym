/**
 * FitPro — WorkoutActive Page
 * Design: Premium Dark Fitness / Guided Performance Flow
 * Execução de treino com progresso por séries, controle de carga,
 * timer de descanso e persistência detalhada da sessão.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Target,
  Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, useParams } from '@/lib/router';
import { useApp } from '@/contexts/AppContext';

interface ExerciseProgressState {
  completedSets: number;
  weight: number;
  reps: number;
  skipped: boolean;
}

function RestTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(true);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = window.setTimeout(() => setRemaining(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining, running, onComplete]);

  const progress = Math.max(0, remaining / Math.max(seconds, 1));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="w-[320px] rounded-[32px] border p-6 text-center"
        style={{
          background: 'linear-gradient(180deg, rgba(23,23,26,0.98) 0%, rgba(12,12,14,0.98) 100%)',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Space Grotesk' }}>
          Descanso ativo
        </p>
        <h2 className="mt-2 text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
          Recupere e prepare a próxima série.
        </h2>

        <div className="relative mx-auto mt-6 size-44">
          <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
            <circle cx="88" cy="88" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="88"
              cy="88"
              r={radius}
              fill="none"
              stroke="var(--theme-accent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ filter: 'drop-shadow(0 0 12px rgba(var(--theme-accent-rgb), 0.7))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{remaining}</p>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>segundos</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setRunning(value => !value)}
            className="flex size-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={onComplete}
            className="rounded-2xl px-5 py-3 text-sm font-bold"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
          >
            Próximo exercício
          </button>
          <button
            onClick={() => setRemaining(seconds)}
            className="flex size-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MiniMetric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="rounded-[22px] border p-3"
      style={{
        background: highlight ? 'rgba(var(--theme-accent-rgb), 0.12)' : 'rgba(255,255,255,0.04)',
        borderColor: highlight ? 'rgba(var(--theme-accent-rgb), 0.22)' : 'rgba(255,255,255,0.06)',
      }}
    >
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>{label}</p>
      <p className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{value}</p>
    </div>
  );
}

export default function WorkoutActive() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { state, saveWorkoutSession } = useApp();

  const workout = useMemo(() => state.workouts.find(item => item.id === id), [state.workouts, id]);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [startedAt] = useState(Date.now());
  const [exerciseState, setExerciseState] = useState<Record<string, ExerciseProgressState>>({});

  useEffect(() => {
    if (!workout) return;
    setExerciseState(previous => {
      const next: Record<string, ExerciseProgressState> = {};
      workout.exercises.forEach(exercise => {
        next[exercise.id] = previous[exercise.id] ?? {
          completedSets: 0,
          weight: exercise.weight,
          reps: exercise.reps,
          skipped: false,
        };
      });
      return next;
    });
  }, [workout]);

  const allExercises = workout?.exercises ?? [];
  const activeExercise = allExercises[currentExerciseIndex];

  const completedExercises = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.filter(exercise => {
      const progress = exerciseState[exercise.id];
      return progress && !progress.skipped && progress.completedSets >= exercise.sets;
    });
  }, [workout, exerciseState]);

  const skippedExercises = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.filter(exercise => exerciseState[exercise.id]?.skipped).map(exercise => exercise.id);
  }, [workout, exerciseState]);

  const progressPercent = workout && workout.exercises.length > 0
    ? Math.round(((completedExercises.length + skippedExercises.length) / workout.exercises.length) * 100)
    : 0;

  const goToNextPendingExercise = () => {
    if (!workout) return;
    const nextIndex = workout.exercises.findIndex((exercise, index) => {
      if (index <= currentExerciseIndex) return false;
      const progress = exerciseState[exercise.id];
      return !progress?.skipped && (progress?.completedSets ?? 0) < exercise.sets;
    });

    if (nextIndex >= 0) {
      setCurrentExerciseIndex(nextIndex);
      return;
    }

    const fallbackIndex = workout.exercises.findIndex(exercise => {
      const progress = exerciseState[exercise.id];
      return !progress?.skipped && (progress?.completedSets ?? 0) < exercise.sets;
    });

    if (fallbackIndex >= 0) {
      setCurrentExerciseIndex(fallbackIndex);
    }
  };

  if (!workout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0d0f] px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-[28px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Dumbbell size={28} style={{ color: 'rgba(255,255,255,0.22)' }} />
        </div>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treino não encontrado</h1>
        <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
          Este treino pode ter sido removido ou substituído por um plano novo. Volte para a área de treinos para continuar.
        </p>
        <button
          onClick={() => navigate('/treinos')}
          className="rounded-2xl px-5 py-3 text-sm font-bold"
          style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
        >
          Voltar aos treinos
        </button>
      </div>
    );
  }

  const handleChangeNumber = (exerciseId: string, field: 'weight' | 'reps', delta: number) => {
    setExerciseState(previous => {
      const current = previous[exerciseId] ?? { completedSets: 0, weight: 0, reps: 0, skipped: false };
      const nextValue = Math.max(0, (current[field] ?? 0) + delta);
      return {
        ...previous,
        [exerciseId]: {
          ...current,
          [field]: nextValue,
        },
      };
    });
  };

  const handleCompleteSet = (exerciseId: string) => {
    const exercise = workout.exercises.find(item => item.id === exerciseId);
    if (!exercise) return;

    setExerciseState(previous => {
      const current = previous[exerciseId] ?? {
        completedSets: 0,
        weight: exercise.weight,
        reps: exercise.reps,
        skipped: false,
      };
      const nextSets = Math.min(exercise.sets, current.completedSets + 1);
      return {
        ...previous,
        [exerciseId]: {
          ...current,
          skipped: false,
          completedSets: nextSets,
        },
      };
    });

    if (exercise.restSeconds > 0) {
      setTimerSeconds(exercise.restSeconds);
      setShowTimer(true);
    }

    const updatedSets = (exerciseState[exerciseId]?.completedSets ?? 0) + 1;
    if (updatedSets >= exercise.sets) {
      toast.success(`${exercise.name} concluído.`);
      goToNextPendingExercise();
    } else {
      toast.success(`Série ${updatedSets}/${exercise.sets} concluída.`);
    }
  };

  const handleSkipExercise = (exerciseId: string) => {
    setExerciseState(previous => ({
      ...previous,
      [exerciseId]: {
        ...(previous[exerciseId] ?? { completedSets: 0, weight: 0, reps: 0, skipped: false }),
        skipped: true,
      },
    }));
    toast.success('Exercício marcado como pulado.');
    goToNextPendingExercise();
  };

  const finishWorkout = () => {
    const completedIds = workout.exercises.filter(exercise => {
      const progress = exerciseState[exercise.id];
      return progress && !progress.skipped && progress.completedSets > 0;
    }).map(exercise => exercise.id);

    if (completedIds.length === 0) {
      toast.error('Complete pelo menos uma série antes de finalizar o treino.');
      return;
    }

    const details = Object.fromEntries(
      workout.exercises.map(exercise => {
        const progress = exerciseState[exercise.id] ?? {
          completedSets: 0,
          weight: exercise.weight,
          reps: exercise.reps,
          skipped: false,
        };
        return [exercise.id, {
          exerciseName: exercise.name,
          weight: progress.weight,
          reps: progress.reps,
          sets: exercise.sets,
          completedSets: progress.completedSets,
          skipped: progress.skipped,
        }];
      }),
    );

    saveWorkoutSession({
      workoutId: workout.id,
      date: new Date().toISOString().split('T')[0],
      completedExercises: completedIds,
      skippedExercises,
      durationSeconds: Math.round((Date.now() - startedAt) / 1000),
      progressPercent,
      exerciseDetails: details,
    });

    toast.success('Sessão registrada com sucesso.');
    navigate('/historico');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] pb-24">
      <div
        className="sticky top-0 z-30 border-b px-4 pb-4 pt-4"
        style={{ background: 'rgba(13,13,15,0.94)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/treinos')}
            className="flex size-11 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>
              Treino em execução
            </p>
            <h1 className="truncate text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{workout.name}</h1>
          </div>
          <div
            className="rounded-2xl px-3 py-2 text-right"
            style={{ background: 'rgba(var(--theme-accent-rgb), 0.14)', color: 'var(--theme-accent)' }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'Space Grotesk' }}>Progresso</p>
            <p className="text-sm font-bold" style={{ fontFamily: 'Space Grotesk' }}>{progressPercent}%</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progressPercent}%` }}
            style={{ background: 'linear-gradient(90deg, var(--theme-accent) 0%, #84cc16 100%)', boxShadow: '0 0 14px rgba(var(--theme-accent-rgb), 0.65)' }}
          />
        </div>
      </div>

      <div className="px-4 pt-4">
        <section
          className="rounded-[30px] border p-5"
          style={{
            background: 'linear-gradient(160deg, rgba(22,22,24,0.98) 0%, rgba(11,11,13,0.98) 100%)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 26px 70px rgba(0,0,0,0.34)',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>
                Exercício atual
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {activeExercise?.name ?? 'Treino concluído'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                {activeExercise?.instructions ?? 'Todos os exercícios foram percorridos. Você já pode finalizar e salvar a sessão.'}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', color: 'var(--theme-accent)' }}>
              <Target size={20} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniMetric label="Exercícios" value={`${completedExercises.length}/${workout.exercises.length}`} />
            <MiniMetric label="Pulados" value={String(skippedExercises.length)} />
            <MiniMetric label="Tempo" value={`${Math.max(1, Math.round((Date.now() - startedAt) / 60000))} min`} highlight />
          </div>

          {activeExercise && (
            <div className="mt-5 rounded-[26px] border p-4" style={{ background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Carga</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => handleChangeNumber(activeExercise.id, 'weight', -2.5)} className="flex size-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}>
                      <RotateCcw size={14} />
                    </button>
                    <div className="flex-1 rounded-2xl border px-3 py-3 text-center text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk' }}>
                      {(exerciseState[activeExercise.id]?.weight ?? activeExercise.weight).toFixed(1)} kg
                    </div>
                    <button onClick={() => handleChangeNumber(activeExercise.id, 'weight', 2.5)} className="flex size-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Repetições</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => handleChangeNumber(activeExercise.id, 'reps', -1)} className="flex size-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}>
                      <RotateCcw size={14} />
                    </button>
                    <div className="flex-1 rounded-2xl border px-3 py-3 text-center text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk' }}>
                      {exerciseState[activeExercise.id]?.reps ?? activeExercise.reps} reps
                    </div>
                    <button onClick={() => handleChangeNumber(activeExercise.id, 'reps', 1)} className="flex size-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniMetric label="Séries" value={`${exerciseState[activeExercise.id]?.completedSets ?? 0}/${activeExercise.sets}`} highlight />
                <MiniMetric label="Descanso" value={`${activeExercise.restSeconds}s`} />
                <MiniMetric label="Músculo" value={activeExercise.muscleGroup ?? 'Geral'} />
              </div>

              {activeExercise.videoUrl && (
                <a
                  href={activeExercise.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit' }}
                >
                  <Play size={15} />
                  Ver demonstração
                </a>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleCompleteSet(activeExercise.id)}
                  className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold"
                  style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <Check size={15} />
                  Concluir série
                </button>
                <button
                  onClick={() => {
                    setTimerSeconds(activeExercise.restSeconds);
                    setShowTimer(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit' }}
                >
                  <Clock3 size={15} />
                  Abrir descanso
                </button>
                <button
                  onClick={() => handleSkipExercise(activeExercise.id)}
                  className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Outfit' }}
                >
                  <SkipForward size={15} />
                  Pular exercício
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="mt-4 space-y-3">
          {workout.exercises.map((exercise, index) => {
            const progress = exerciseState[exercise.id] ?? {
              completedSets: 0,
              weight: exercise.weight,
              reps: exercise.reps,
              skipped: false,
            };
            const isCurrent = index === currentExerciseIndex;
            const finished = !progress.skipped && progress.completedSets >= exercise.sets;

            return (
              <motion.button
                key={exercise.id}
                layout
                onClick={() => setCurrentExerciseIndex(index)}
                className="w-full rounded-[26px] border p-4 text-left"
                style={{
                  background: isCurrent
                    ? 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.14) 0%, rgba(var(--theme-accent-rgb), 0.06) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  borderColor: isCurrent ? 'rgba(var(--theme-accent-rgb), 0.24)' : 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.62)', fontFamily: 'Space Grotesk' }}>
                        {index + 1}
                      </span>
                      {finished && (
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ background: 'rgba(132,204,22,0.16)', color: '#a3e635', fontFamily: 'Space Grotesk' }}>
                          Concluído
                        </span>
                      )}
                      {progress.skipped && (
                        <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ background: 'rgba(245,158,11,0.16)', color: '#fbbf24', fontFamily: 'Space Grotesk' }}>
                          Pulado
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{exercise.name}</p>
                    <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
                      {exercise.sets} séries • {progress.reps} reps • {progress.weight.toFixed(1)} kg • descanso {exercise.restSeconds}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{progress.completedSets}/{exercise.sets}</p>
                    <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>séries</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </section>

        <section className="mt-4 rounded-[30px] border p-5" style={{ background: 'linear-gradient(180deg, rgba(21,21,24,0.98) 0%, rgba(12,12,14,0.98) 100%)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-start gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', color: 'var(--theme-accent)' }}>
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Finalizar e salvar sessão</h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                O aplicativo vai registrar duração, séries concluídas, exercícios pulados, carga usada e percentual total de progresso.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <MiniMetric label="Completos" value={String(completedExercises.length)} highlight />
            <MiniMetric label="Pulados" value={String(skippedExercises.length)} />
            <MiniMetric label="Duração" value={`${Math.max(1, Math.round((Date.now() - startedAt) / 60000))} min`} />
          </div>

          <button
            onClick={finishWorkout}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
          >
            <Check size={16} />
            Salvar treino concluído
          </button>
        </section>
      </div>

      <AnimatePresence>
        {showTimer && (
          <RestTimer
            seconds={timerSeconds}
            onComplete={() => {
              setShowTimer(false);
              goToNextPendingExercise();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
