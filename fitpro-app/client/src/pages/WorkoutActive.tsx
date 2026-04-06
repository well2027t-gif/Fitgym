/**
 * FitPro — WorkoutActive Page (Fidelity to Reference Design 44C3F156)
 * Design: Exatamente como a nova imagem de referência
 * Com selo técnica, ícone de anatomia, timer tracejado e rodapé
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

export default function WorkoutActive() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { state, saveWorkoutSession } = useApp();

  const workout = useMemo(() => state.workouts.find(item => item.id === id), [state.workouts, id]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [startedAt] = useState(Date.now());
  const [exerciseState, setExerciseState] = useState<Record<string, ExerciseProgressState>>({});
  const [restTimeRemaining, setRestTimeRemaining] = useState<number | null>(null);

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

  // Timer de descanso
  useEffect(() => {
    if (restTimeRemaining === null || restTimeRemaining <= 0) return;
    
    const timer = window.setTimeout(() => {
      setRestTimeRemaining(prev => {
        const next = (prev ?? 0) - 1;
        if (next <= 0) {
          toast.success('Descanso concluído!');
        }
        return next;
      });
    }, 1000);
    
    return () => window.clearTimeout(timer);
  }, [restTimeRemaining]);

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
        <button
          onClick={() => navigate('/treinos')}
          className="rounded-2xl px-5 py-3 text-sm font-bold"
          style={{ background: '#4ade80', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
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
        setRestTimeRemaining(exercise.restSeconds);
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
    setRestTimeRemaining(null);
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
      <div
        key={i}
        className="h-2 rounded-full transition-all"
        style={{
          width: '32px',
          background: isCurrent ? '#4ade80' : isCompleted ? '#4ade80' : 'rgba(255,255,255,0.15)',
        }}
      />
    );
  });

  const elapsedMinutes = Math.floor((Date.now() - startedAt) / 60000);
  const elapsedSeconds = Math.floor(((Date.now() - startedAt) % 60000) / 1000);
  const timeDisplay = `${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`;

  const restMinutes = restTimeRemaining ? Math.floor(restTimeRemaining / 60) : 0;
  const restSecs = restTimeRemaining ? restTimeRemaining % 60 : 0;
  const restDisplay = `${String(restMinutes).padStart(2, '0')}:${String(restSecs).padStart(2, '0')}`;

  const restProgress = activeExercise && restTimeRemaining !== null
    ? Math.max(0, restTimeRemaining / activeExercise.restSeconds)
    : 0;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0d0d0f]" style={{ height: '100dvh', overflow: 'hidden' }}>
      {/* CABEÇALHO */}
      <div className="flex-shrink-0 px-4 py-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/treinos')}
            className="flex size-10 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
          >
            <ArrowLeft size={18} />
          </motion.button>
          
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {activeExercise?.name ?? 'Treino concluído'}
            </h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Space Grotesk' }}>
              {currentExerciseIndex + 1} de {allExercises.length} exercícios
            </p>
          </div>

          <div
            className="flex size-10 items-center justify-center rounded-2xl flex-shrink-0"
            style={{
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
            }}
          >
            <p className="text-xs font-bold" style={{ color: '#4ade80', fontFamily: 'Space Grotesk' }}>
              {timeDisplay}
            </p>
          </div>
        </div>

        {/* PROGRESSO COM BOLINHAS */}
        <div className="flex gap-1.5 justify-center">
          {progressDots}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <AnimatePresence mode="wait">
        {activeExercise && !isWorkoutComplete ? (
          <motion.div
            key={activeExercise.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden px-4 py-3"
          >
            {/* VÍDEO COM SELO TÉCNICA */}
            <div className="relative rounded-[20px] overflow-hidden bg-black aspect-video border mb-3" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              {/* SELO TÉCNICA - Canto superior esquerdo */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                <Lightbulb size={14} style={{ color: '#4ade80' }} />
                <span className="text-xs font-semibold text-white" style={{ fontFamily: 'Space Grotesk', color: '#4ade80' }}>Técnica</span>
              </div>

              {/* BOTÃO EXPANDIR - Canto inferior direito */}
              <div className="absolute bottom-3 right-3 z-10 flex size-8 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </div>

              {/* PLAY BUTTON */}
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

            {/* CAIXA DE DICAS COM ÍCONE DE ANATOMIA */}
            <div className="rounded-[20px] border p-4 flex gap-3 mb-3" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex-shrink-0 flex size-8 items-center justify-center rounded-lg" style={{ background: 'rgba(74, 222, 128, 0.2)' }}>
                {/* Ícone de anatomia (corpo com destaque) */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                  <circle cx="12" cy="4" r="1.5" />
                  <path d="M9 8h6M7 10v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6M9 16h6M10 10v6M14 10v6" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-white" style={{ fontFamily: 'Outfit' }}>
                  {activeExercise.instructions || 'Execute o exercício com controle e técnica adequada.'}
                </p>
                {/* Destaque em verde nas palavras-chave */}
                <style>{`
                  .instruction-text strong { color: #4ade80; }
                `}</style>
              </div>
            </div>

            {/* 4 CARDS DE MÉTRICAS */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {/* Série */}
              <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex justify-center mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Série</p>
                <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {currentProgress}/{activeExercise.sets}
                </p>
                <div className="mt-2 h-1 rounded-full" style={{ background: 'rgba(74, 222, 128, 0.2)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(currentProgress / activeExercise.sets) * 100}%`,
                      background: '#4ade80',
                    }}
                  />
                </div>
              </div>

              {/* Repetições */}
              <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex justify-center mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M6 9h12M6 15h12M3 3h18v18H3z" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Repetições</p>
                <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {exerciseState[activeExercise.id]?.reps ?? activeExercise.reps} reps
                </p>
              </div>

              {/* Carga com +/- */}
              <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(74, 222, 128, 0.12)', borderColor: 'rgba(74, 222, 128, 0.25)' }}>
                <div className="flex justify-center mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Carga</p>
                <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {(exerciseState[activeExercise.id]?.weight ?? activeExercise.weight).toFixed(0)} kg
                </p>
                <div className="mt-2 flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleChangeNumber(activeExercise.id, 'weight', -2.5)}
                    className="flex-1 rounded-lg py-1.5 text-xs font-bold"
                    style={{
                      background: 'rgba(74, 222, 128, 0.2)',
                      color: '#4ade80',
                    }}
                  >
                    <Minus size={12} className="mx-auto" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleChangeNumber(activeExercise.id, 'weight', 2.5)}
                    className="flex-1 rounded-lg py-1.5 text-xs font-bold"
                    style={{
                      background: 'rgba(74, 222, 128, 0.2)',
                      color: '#4ade80',
                    }}
                  >
                    <Plus size={12} className="mx-auto" />
                  </motion.button>
                </div>
              </div>

              {/* Descanso */}
              <div className="rounded-[20px] border p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex justify-center mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Descanso</p>
                <p className="mt-1 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {activeExercise.restSeconds}s
                </p>
              </div>
            </div>

            {/* BOTÃO PRINCIPAL VERDE COM GRADIENTE */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCompleteSet(activeExercise.id)}
              className="w-full rounded-2xl px-4 py-4 text-lg font-bold flex items-center justify-center gap-2 mb-1"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#0d0d0f',
                fontFamily: 'Space Grotesk',
                boxShadow: '0 8px 24px rgba(74, 222, 128, 0.3)',
              }}
            >
              <Check size={20} />
              Concluir série
            </motion.button>
            <p className="text-xs text-center mb-3" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
              Ao concluir, o descanso será iniciado.
            </p>

            {/* TIMER DE DESCANSO INFERIOR COM CÍRCULO TRACEJADO */}
            <AnimatePresence>
              {restTimeRemaining !== null && restTimeRemaining > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="rounded-[20px] border p-4 mb-2"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <p className="text-xs uppercase tracking-[0.16em] mb-3" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>
                    Descanso
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    {/* Cronômetro à esquerda */}
                    <div>
                      <p className="text-4xl font-bold text-white" style={{ fontFamily: 'Space Grotesk', color: '#4ade80' }}>
                        {restDisplay}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>Tempo restante</p>
                    </div>

                    {/* Círculo tracejado no meio */}
                    <div className="relative size-24">
                      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(74, 222, 128, 0.2)" strokeWidth="5" strokeDasharray="8 4" />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="40"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - restProgress)}
                          style={{ filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.8))' }}
                        />
                      </svg>
                    </div>

                    {/* Botão Pular à direita */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRestTimeRemaining(null)}
                      className="rounded-2xl border px-3 py-2 text-xs font-semibold text-white whitespace-nowrap"
                      style={{
                        borderColor: 'rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)',
                        fontFamily: 'Space Grotesk',
                      }}
                    >
                      ⏭ Pular descanso
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BOTÃO PULAR EXERCÍCIO */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSkipExercise(activeExercise.id)}
              className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-white"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
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
            className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center"
          >
            <div className="flex size-20 items-center justify-center rounded-full" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
              <Check size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Treino concluído!
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                Você completou {completedExercises.length} exercícios em {elapsedMinutes}m {elapsedSeconds}s.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={finishWorkout}
              className="w-full rounded-2xl px-4 py-4 text-base font-bold flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#0d0d0f',
                fontFamily: 'Space Grotesk',
              }}
            >
              <Check size={18} />
              Salvar e finalizar
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* RODAPÉ COM FOCO • EXECUÇÃO • EVOLUÇÃO */}
      <div className="flex-shrink-0 text-center py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
          FOCO • EXECUÇÃO • EVOLUÇÃO
        </p>
      </div>
    </div>
  );
}
