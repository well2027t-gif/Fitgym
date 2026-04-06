/**
 * FitPro — WorkoutActive Page (Premium Layout)
 * Design: Premium Dark Fitness / Full Screen Guided Flow
 * Layout exatamente conforme imagem de referência:
 * - Cabeçalho com contador e timer
 * - Vídeo/imagem centralizada com play button
 * - Caixa de dicas com ícone de lâmpada
 * - 4 cards de métricas (Série, Reps, Carga, Descanso)
 * - Botão principal verde "Concluir série"
 * - Timer de descanso integrado na base
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Lightbulb,
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

function RestTimerBottom({ seconds, onComplete, onSkip }: RestTimerProps) {
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
  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-[24px] border p-5"
      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
        Descanso
      </p>
      
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            {timeDisplay}
          </p>
        </div>

        <div className="relative size-32">
          <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="64"
              cy="64"
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
        </div>

        <button
          onClick={onSkip}
          className="rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
          style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Space Grotesk' }}
        >
          ⏭ Pular descanso
        </button>
      </div>
    </motion.div>
  );
}

export default function WorkoutActive() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { state, saveWorkoutSession } = useApp();

  const workout = useMemo(() => state.workouts.find(item => item.id === id), [state.workouts, id]);
  const [showRestTimer, setShowRestTimer] = useState(false);
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
        setShowRestTimer(true);
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

  // Renderizar indicador de progresso com bolinhas
  const progressDots = Array.from({ length: allExercises.length }).map((_, i) => {
    const isCompleted = completedExercises.some(ex => ex.id === allExercises[i].id);
    const isSkipped = skippedExercises.includes(allExercises[i].id);
    const isCurrent = i === currentExerciseIndex;
    
    return (
      <div
        key={i}
        className="h-2 rounded-full"
        style={{
          width: '32px',
          background: isCurrent ? 'var(--theme-accent)' : isCompleted ? 'var(--theme-accent)' : isSkipped ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
        }}
      />
    );
  });

  // Calcular tempo total do treino
  const elapsedMinutes = Math.floor((Date.now() - startedAt) / 60000);
  const elapsedSeconds = Math.floor(((Date.now() - startedAt) % 60000) / 1000);
  const timeDisplay = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0d0d0f]" style={{ height: '100dvh' }}>
      {/* CABEÇALHO */}
      <div className="flex-shrink-0 px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <button
            onClick={() => navigate('/treinos')}
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {activeExercise?.name ?? 'Treino concluído'}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
              {currentExerciseIndex + 1} / {allExercises.length}
            </p>
          </div>

          <div className="text-right">
            <div className="flex size-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>
                {timeDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* PROGRESSO COM BOLINHAS */}
        <div className="flex gap-1.5 justify-center">
          {progressDots}
        </div>
      </div>

      {/* CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {activeExercise && !isWorkoutComplete ? (
            <motion.div
              key={activeExercise.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {/* VÍDEO/IMAGEM COM PLAY BUTTON */}
              <div className="relative rounded-[24px] overflow-hidden bg-black aspect-video">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 flex items-center justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {activeExercise.videoUrl && (
                  <img
                    src={activeExercise.videoUrl}
                    alt={activeExercise.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* CAIXA DE DICAS COM ÍCONE DE LÂMPADA */}
              <div className="rounded-[20px] border p-4 flex gap-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex-shrink-0 mt-1">
                  <Lightbulb size={20} style={{ color: 'var(--theme-accent)' }} />
                </div>
                <p className="text-sm leading-relaxed text-white" style={{ fontFamily: 'Outfit' }}>
                  {activeExercise.instructions || 'Execute o exercício com controle e técnica adequada.'}
                </p>
              </div>

              {/* 4 CARDS DE MÉTRICAS */}
              <div className="grid grid-cols-4 gap-2">
                {/* Série */}
                <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--theme-accent)" strokeWidth="2">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                  </div>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Série</p>
                  <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {currentProgress}/{activeExercise.sets}
                  </p>
                  <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(var(--theme-accent-rgb), 0.3)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(currentProgress / activeExercise.sets) * 100}%`,
                        background: 'var(--theme-accent)',
                      }}
                    />
                  </div>
                </div>

                {/* Repetições */}
                <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#f59e0b' }}>
                      <path d="M6 9h12M6 15h12M3 3h18v18H3z" />
                    </svg>
                  </div>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Repetições</p>
                  <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {exerciseState[activeExercise.id]?.reps ?? activeExercise.reps} reps
                  </p>
                </div>

                {/* Carga com +/- */}
                <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.12)', borderColor: 'rgba(var(--theme-accent-rgb), 0.22)' }}>
                  <div className="flex justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--theme-accent)" strokeWidth="2">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </div>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Carga</p>
                  <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {(exerciseState[activeExercise.id]?.weight ?? activeExercise.weight).toFixed(0)} kg
                  </p>
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => handleChangeNumber(activeExercise.id, 'weight', -2.5)}
                      className="flex-1 rounded-lg py-1 text-xs font-bold"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    >
                      <Minus size={12} className="mx-auto" />
                    </button>
                    <button
                      onClick={() => handleChangeNumber(activeExercise.id, 'weight', 2.5)}
                      className="flex-1 rounded-lg py-1 text-xs font-bold"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'white' }}
                    >
                      <Plus size={12} className="mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Descanso */}
                <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <p className="text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Descanso</p>
                  <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {activeExercise.restSeconds}s
                  </p>
                </div>
              </div>

              {/* BOTÃO PRINCIPAL VERDE */}
              <button
                onClick={() => handleCompleteSet(activeExercise.id)}
                className="w-full rounded-2xl px-4 py-4 text-lg font-bold flex items-center justify-center gap-2 mt-2"
                style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
              >
                <Check size={20} />
                Concluir série
              </button>
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
                Ao concluir, o descanso será iniciado.
              </p>

              {/* TIMER DE DESCANSO */}
              <AnimatePresence>
                {showRestTimer && (
                  <RestTimerBottom
                    seconds={timerSeconds}
                    onComplete={() => {
                      setShowRestTimer(false);
                      goToNextPendingExercise();
                    }}
                    onSkip={() => {
                      setShowRestTimer(false);
                      goToNextPendingExercise();
                    }}
                  />
                )}
              </AnimatePresence>

              {/* BOTÃO SECUNDÁRIO PULAR */}
              <button
                onClick={() => handleSkipExercise(activeExercise.id)}
                className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
                style={{ borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Space Grotesk' }}
              >
                <SkipForward size={16} className="inline mr-2" />
                Pular exercício
              </button>
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
                  Você completou {completedExercises.length} exercícios em {elapsedMinutes} minutos.
                </p>
              </div>
              <button
                onClick={finishWorkout}
                className="w-full rounded-2xl px-4 py-4 text-base font-bold flex items-center justify-center gap-2"
                style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
              >
                <Check size={18} />
                Salvar e finalizar
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
