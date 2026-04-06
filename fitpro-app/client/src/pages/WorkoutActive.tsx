/**
 * FitPro — WorkoutActive Page (Redesigned)
 * Design: Premium Dark Fitness / Full Screen Guided Flow
 * Execução de treino em modo foco: tela cheia, fluxo contínuo,
 * sem distrações, com descanso automático e transições suaves.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Minus,
  Plus,
  SkipForward,
  Zap,
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

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

function RestTimer({ seconds, onComplete, onSkip }: RestTimerProps) {
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
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, rgba(13,13,15,0.98) 0%, rgba(10,10,12,0.98) 100%)' }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="flex flex-col items-center gap-8"
      >
        <div>
          <p className="text-center text-sm uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Space Grotesk' }}>
            Recuperando
          </p>
          <h2 className="mt-2 text-center text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Prepare-se para a próxima série
          </h2>
        </div>

        <div className="relative size-56">
          <svg width="224" height="224" viewBox="0 0 224 224" className="-rotate-90">
            <circle cx="112" cy="112" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="112"
              cy="112"
              r={radius}
              fill="none"
              stroke="var(--theme-accent)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ filter: 'drop-shadow(0 0 16px rgba(var(--theme-accent-rgb), 0.8))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-6xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{remaining}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk' }}>segundos</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onComplete}
            className="w-full rounded-2xl px-6 py-4 text-base font-bold"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
          >
            Próxima série
          </button>
          <button
            onClick={onSkip}
            className="w-full rounded-2xl border px-6 py-4 text-base font-semibold text-white"
            style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Space Grotesk' }}
          >
            Pular descanso
          </button>
        </div>
      </motion.div>
    </motion.div>
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
          <Zap size={28} style={{ color: 'rgba(255,255,255,0.22)' }} />
        </div>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treino não encontrado</h1>
        <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
          Este treino pode ter sido removido ou substituído. Volte para continuar.
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

    const updatedSets = (exerciseState[exerciseId]?.completedSets ?? 0) + 1;
    
    if (updatedSets >= exercise.sets) {
      toast.success(`${exercise.name} concluído!`);
      setTimeout(() => goToNextPendingExercise(), 300);
    } else {
      if (exercise.restSeconds > 0) {
        setTimerSeconds(exercise.restSeconds);
        setShowTimer(true);
      } else {
        goToNextPendingExercise();
      }
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
    toast.success('Exercício pulado.');
    goToNextPendingExercise();
  };

  const finishWorkout = () => {
    const completedIds = workout.exercises.filter(exercise => {
      const progress = exerciseState[exercise.id];
      return progress && !progress.skipped && progress.completedSets > 0;
    }).map(exercise => exercise.id);

    if (completedIds.length === 0) {
      toast.error('Complete pelo menos uma série antes de finalizar.');
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

    toast.success('Sessão salva com sucesso!');
    navigate('/historico');
  };

  const currentProgress = exerciseState[activeExercise?.id ?? '']?.completedSets ?? 0;
  const isWorkoutComplete = completedExercises.length + skippedExercises.length === workout.exercises.length;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0d0d0f]" style={{ height: '100dvh' }}>
      {/* TOPO FIXO */}
      <div className="flex-shrink-0 border-b px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
              {currentExerciseIndex + 1} de {allExercises.length}
            </p>
            <h1 className="mt-1 text-xl font-bold text-white truncate" style={{ fontFamily: 'Space Grotesk' }}>
              {activeExercise?.name ?? 'Treino concluído'}
            </h1>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
              Progresso
            </p>
            <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk', color: 'var(--theme-accent)' }}>
              {progressPercent}%
            </p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${progressPercent}%` }}
            style={{ background: 'linear-gradient(90deg, var(--theme-accent) 0%, #84cc16 100%)' }}
          />
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <AnimatePresence mode="wait">
          {activeExercise && !isWorkoutComplete ? (
            <motion.div
              key={activeExercise.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* INSTRUÇÕES */}
              <div className="rounded-[24px] border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-sm leading-relaxed text-white" style={{ fontFamily: 'Outfit' }}>
                  {activeExercise.instructions || 'Execute o exercício com controle e técnica adequada.'}
                </p>
              </div>

              {/* CONFIGURAÇÃO COMPACTA */}
              <div className="space-y-4">
                {/* Repetições */}
                <div>
                  <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
                    Repetições
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => handleChangeNumber(activeExercise.id, 'reps', -1)}
                      className="flex size-12 items-center justify-center rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex-1 rounded-2xl border py-3 text-center text-lg font-bold text-white" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk' }}>
                      {exerciseState[activeExercise.id]?.reps ?? activeExercise.reps}
                    </div>
                    <button
                      onClick={() => handleChangeNumber(activeExercise.id, 'reps', 1)}
                      className="flex size-12 items-center justify-center rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Carga */}
                <div>
                  <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
                    Carga (kg)
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => handleChangeNumber(activeExercise.id, 'weight', -2.5)}
                      className="flex size-12 items-center justify-center rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex-1 rounded-2xl border py-3 text-center text-lg font-bold text-white" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk' }}>
                      {(exerciseState[activeExercise.id]?.weight ?? activeExercise.weight).toFixed(1)}
                    </div>
                    <button
                      onClick={() => handleChangeNumber(activeExercise.id, 'weight', 2.5)}
                      className="flex size-12 items-center justify-center rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Séries e Descanso */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[20px] border p-4 text-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.12)', borderColor: 'rgba(var(--theme-accent-rgb), 0.22)' }}>
                    <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
                      Séries
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk', color: 'var(--theme-accent)' }}>
                      {currentProgress}/{activeExercise.sets}
                    </p>
                  </div>
                  <div className="rounded-[20px] border p-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
                      Descanso
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      {activeExercise.restSeconds}s
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : isWorkoutComplete ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-6 py-12 text-center"
            >
              <div className="flex size-20 items-center justify-center rounded-full" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', color: 'var(--theme-accent)' }}>
                <Check size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Treino concluído!
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                  Você completou {completedExercises.length} exercícios em {Math.max(1, Math.round((Date.now() - startedAt) / 60000))} minutos.
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* BOTÃO DE AÇÃO (FIXO NA BASE) */}
      <div className="flex-shrink-0 border-t px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="flex gap-3">
          {!isWorkoutComplete ? (
            <>
              <button
                onClick={() => handleCompleteSet(activeExercise?.id ?? '')}
                className="flex-1 rounded-2xl px-4 py-4 text-base font-bold flex items-center justify-center gap-2"
                style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
              >
                <Check size={18} />
                {currentProgress >= (activeExercise?.sets ?? 0) ? 'Próximo' : 'Concluir série'}
              </button>
              <button
                onClick={() => handleSkipExercise(activeExercise?.id ?? '')}
                className="rounded-2xl border px-4 py-4 text-base font-semibold text-white"
                style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Space Grotesk' }}
              >
                <SkipForward size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={finishWorkout}
              className="w-full rounded-2xl px-4 py-4 text-base font-bold flex items-center justify-center gap-2"
              style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
            >
              <Check size={18} />
              Salvar e finalizar
            </button>
          )}
        </div>
      </div>

      {/* TIMER DE DESCANSO */}
      <AnimatePresence>
        {showTimer && (
          <RestTimer
            seconds={timerSeconds}
            onComplete={() => {
              setShowTimer(false);
              goToNextPendingExercise();
            }}
            onSkip={() => {
              setShowTimer(false);
              goToNextPendingExercise();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
