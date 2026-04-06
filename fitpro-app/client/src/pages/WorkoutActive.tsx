/**
 * FitPro — WorkoutActive Page (Ultra Premium Design)
 * Design: Glassmorphism + Premium Dark Fitness
 * Interface visualmente deslumbrante com efeitos de vidro,
 * gradientes suaves, sombras profundas e micro-interações refinadas.
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
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-[28px] border p-6 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        borderColor: 'rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Space Grotesk' }}>
        Descanso Ativo
      </p>
      
      <div className="mt-5 flex items-center justify-between gap-6">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-5xl font-bold text-white" style={{ fontFamily: 'Space Grotesk', color: 'var(--theme-accent)' }}>
            {timeDisplay}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
            Recuperando
          </p>
        </motion.div>

        <div className="relative size-40">
          <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#gradientAccent)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ filter: 'drop-shadow(0 0 16px rgba(var(--theme-accent-rgb), 0.8))' }}
            />
            <defs>
              <linearGradient id="gradientAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--theme-accent)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#84cc16', stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <motion.button
          onClick={onSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-2xl border px-5 py-3 text-sm font-semibold text-white backdrop-blur-lg"
          style={{
            borderColor: 'rgba(255,255,255,0.15)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            fontFamily: 'Space Grotesk',
          }}
        >
          ⏭ Pular
        </motion.button>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon, label, value, highlight = false, children }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-[24px] border p-4 backdrop-blur-xl transition-all"
      style={{
        background: highlight
          ? 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        borderColor: highlight ? 'rgba(var(--theme-accent-rgb), 0.3)' : 'rgba(255,255,255,0.12)',
        boxShadow: highlight
          ? '0 8px 24px rgba(var(--theme-accent-rgb), 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex size-8 items-center justify-center rounded-lg" style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)' }}>
          {icon}
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
        {value}
      </p>
      {children}
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
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex size-20 items-center justify-center rounded-2xl backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)',
            border: '1px solid rgba(var(--theme-accent-rgb), 0.3)',
            color: 'var(--theme-accent)',
          }}
        >
          <Zap size={32} />
        </motion.div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treino não encontrado</h1>
        <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
          Este treino pode ter sido removido ou substituído. Volte para continuar.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/treinos')}
          className="rounded-2xl px-6 py-3 text-sm font-bold"
          style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
        >
          Voltar aos treinos
        </motion.button>
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

  const progressDots = Array.from({ length: allExercises.length }).map((_, i) => {
    const isCompleted = completedExercises.some(ex => ex.id === allExercises[i].id);
    const isCurrent = i === currentExerciseIndex;
    
    return (
      <motion.div
        key={i}
        layoutId={`dot-${i}`}
        animate={{
          width: isCurrent ? '40px' : '28px',
          background: isCurrent ? 'var(--theme-accent)' : isCompleted ? 'var(--theme-accent)' : 'rgba(255,255,255,0.15)',
        }}
        className="h-2 rounded-full transition-all"
      />
    );
  });

  const elapsedMinutes = Math.floor((Date.now() - startedAt) / 60000);
  const elapsedSeconds = Math.floor(((Date.now() - startedAt) % 60000) / 1000);
  const timeDisplay = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gradient-to-br from-[#0d0d0f] via-[#0a0a0c] to-[#0d0d0f]" style={{ height: '100dvh' }}>
      {/* CABEÇALHO PREMIUM */}
      <motion.div className="flex-shrink-0 px-5 py-5 backdrop-blur-xl border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/treinos')}
            className="flex size-11 items-center justify-center rounded-2xl backdrop-blur-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
          >
            <ArrowLeft size={20} />
          </motion.button>
          
          <motion.div className="flex-1 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              {activeExercise?.name ?? 'Treino concluído'}
            </motion.h1>
            <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Space Grotesk' }}>
              {currentExerciseIndex + 1} de {allExercises.length}
            </p>
          </motion.div>

          <motion.div
            className="flex size-11 items-center justify-center rounded-2xl backdrop-blur-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)',
              border: '1px solid rgba(var(--theme-accent-rgb), 0.3)',
            }}
          >
            <p className="text-sm font-bold" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>
              {timeDisplay}
            </p>
          </motion.div>
        </div>

        {/* PROGRESSO COM BOLINHAS */}
        <div className="flex gap-2 justify-center">
          {progressDots}
        </div>
      </motion.div>

      {/* CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <AnimatePresence mode="wait">
          {activeExercise && !isWorkoutComplete ? (
            <motion.div
              key={activeExercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {/* VÍDEO/IMAGEM COM PLAY BUTTON */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative rounded-[28px] overflow-hidden bg-black aspect-video backdrop-blur-xl border"
                style={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex size-20 items-center justify-center rounded-full border-2 border-white"
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                </div>
                {activeExercise.videoUrl && (
                  <img
                    src={activeExercise.videoUrl}
                    alt={activeExercise.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </motion.div>

              {/* CAIXA DE DICAS COM ÍCONE DE LÂMPADA */}
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-[24px] border p-5 flex gap-4 backdrop-blur-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex-shrink-0 mt-1 flex size-10 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)' }}
                >
                  <Lightbulb size={22} style={{ color: 'var(--theme-accent)' }} />
                </motion.div>
                <p className="text-sm leading-relaxed text-white" style={{ fontFamily: 'Outfit' }}>
                  {activeExercise.instructions || 'Execute o exercício com controle e técnica adequada.'}
                </p>
              </motion.div>

              {/* 4 CARDS DE MÉTRICAS */}
              <div className="grid grid-cols-4 gap-3">
                {/* Série */}
                <MetricCard
                  highlight
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--theme-accent)" strokeWidth="2">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5" />
                    </svg>
                  }
                  label="Série"
                  value={`${currentProgress}/${activeExercise.sets}`}
                >
                  <div className="mt-3 h-1.5 rounded-full" style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)' }}>
                    <motion.div
                      animate={{ width: `${(currentProgress / activeExercise.sets) * 100}%` }}
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--theme-accent) 0%, #84cc16 100%)',
                        boxShadow: '0 0 8px rgba(var(--theme-accent-rgb), 0.6)',
                      }}
                    />
                  </div>
                </MetricCard>

                {/* Repetições */}
                <MetricCard
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#f59e0b' }}>
                      <path d="M6 9h12M6 15h12M3 3h18v18H3z" />
                    </svg>
                  }
                  label="Reps"
                  value={`${exerciseState[activeExercise.id]?.reps ?? activeExercise.reps}`}
                />

                {/* Carga com +/- */}
                <MetricCard
                  highlight
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--theme-accent)" strokeWidth="2">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  }
                  label="Carga"
                  value={`${(exerciseState[activeExercise.id]?.weight ?? activeExercise.weight).toFixed(0)}`}
                >
                  <div className="mt-3 flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleChangeNumber(activeExercise.id, 'weight', -2.5)}
                      className="flex-1 rounded-lg py-2 text-xs font-bold backdrop-blur-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'white',
                      }}
                    >
                      <Minus size={12} className="mx-auto" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleChangeNumber(activeExercise.id, 'weight', 2.5)}
                      className="flex-1 rounded-lg py-2 text-xs font-bold backdrop-blur-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'white',
                      }}
                    >
                      <Plus size={12} className="mx-auto" />
                    </motion.button>
                  </div>
                </MetricCard>

                {/* Descanso */}
                <MetricCard
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                  label="Descanso"
                  value={`${activeExercise.restSeconds}s`}
                />
              </div>

              {/* BOTÃO PRINCIPAL VERDE */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCompleteSet(activeExercise.id)}
                className="w-full rounded-2xl px-4 py-5 text-lg font-bold flex items-center justify-center gap-3 backdrop-blur-xl border"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-accent) 0%, #84cc16 100%)',
                  color: '#0d0d0f',
                  fontFamily: 'Space Grotesk',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 12px 32px rgba(var(--theme-accent-rgb), 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Check size={22} />
                </motion.div>
                Concluir série
              </motion.button>
              <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                Ao concluir, o descanso será iniciado automaticamente
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSkipExercise(activeExercise.id)}
                className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-white backdrop-blur-lg"
                style={{
                  borderColor: 'rgba(255,255,255,0.15)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  fontFamily: 'Space Grotesk',
                }}
              >
                <SkipForward size={16} className="inline mr-2" />
                Pular exercício
              </motion.button>
            </motion.div>
          ) : isWorkoutComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-6 py-12 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex size-24 items-center justify-center rounded-full backdrop-blur-xl border"
                style={{
                  background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.2) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)',
                  border: '2px solid var(--theme-accent)',
                  color: 'var(--theme-accent)',
                  boxShadow: '0 12px 32px rgba(var(--theme-accent-rgb), 0.3)',
                }}
              >
                <Check size={48} />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Treino concluído!
                </h2>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                  Você completou {completedExercises.length} exercícios em {elapsedMinutes} minutos e {elapsedSeconds} segundos.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={finishWorkout}
                className="w-full rounded-2xl px-4 py-4 text-base font-bold flex items-center justify-center gap-2 backdrop-blur-xl border"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-accent) 0%, #84cc16 100%)',
                  color: '#0d0d0f',
                  fontFamily: 'Space Grotesk',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 12px 32px rgba(var(--theme-accent-rgb), 0.4)',
                }}
              >
                <Check size={20} />
                Salvar e finalizar
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
