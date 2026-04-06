/**
 * FitPro — WorkoutActive Page (Ultra Pro Design)
 * Iluminação dinâmica, glassmorphism avançado e micro-interações de elite
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
  Clock,
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
  const [seriesStarted, setSeriesStarted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTime(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

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

  useEffect(() => {
    if (restTimeRemaining === null || restTimeRemaining <= 0) return;
    
    const interval = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          toast.success('Descanso concluído!');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
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
    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
    }
  };

  const handleStartSeries = () => {
    if (!activeExercise) return;
    setSeriesStarted(true);
  };

  const handleCompleteSeries = () => {
    if (!activeExercise) return;
    const currentProgress = exerciseState[activeExercise.id] || { completedSets: 0, weight: activeExercise.weight, reps: activeExercise.reps, skipped: false };
    const newCompletedSets = currentProgress.completedSets + 1;
    
    setExerciseState(prev => ({
      ...prev,
      [activeExercise.id]: { ...currentProgress, completedSets: newCompletedSets },
    }));

    if (newCompletedSets < activeExercise.sets) {
      setRestTimeRemaining(activeExercise.restSeconds);
      setSeriesStarted(false);
      toast.success(`Série ${newCompletedSets}/${activeExercise.sets} concluída!`);
    } else {
      setSeriesStarted(false);
      toast.success(`Exercício concluído! ${activeExercise.sets}/${activeExercise.sets}`);
      setTimeout(() => goToNextPendingExercise(), 500);
    }
  };

  const handleSkipExercise = () => {
    if (!activeExercise) return;
    setExerciseState(prev => ({
      ...prev,
      [activeExercise.id]: { ...prev[activeExercise.id], skipped: true },
    }));
    goToNextPendingExercise();
    toast.info('Exercício pulado');
  };

  const handleUpdateWeight = (delta: number) => {
    if (!activeExercise) return;
    const current = exerciseState[activeExercise.id];
    setExerciseState(prev => ({
      ...prev,
      [activeExercise.id]: { ...current, weight: Math.max(0, current.weight + delta) },
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workout || !activeExercise) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0f]">
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Treino não encontrado</p>
      </div>
    );
  }

  const currentProgress = exerciseState[activeExercise.id];
  const progressBars = Array.from({ length: activeExercise.sets }, (_, i) => i < currentProgress.completedSets);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0d0f] via-[#0d0d0f] to-[#1a1a1f] pb-24">
      {/* CABEÇALHO PREMIUM */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          background: 'linear-gradient(180deg, rgba(13,13,15,0.95) 0%, rgba(13,13,15,0.85) 100%)',
          borderColor: 'rgba(74, 222, 128, 0.1)',
          boxShadow: '0 8px 32px rgba(74, 222, 128, 0.05)',
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/treinos')}
            className="p-2 rounded-lg transition-all"
            style={{
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.2)',
              color: '#4ade80',
            }}
          >
            <ArrowLeft size={18} />
          </motion.button>

          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {activeExercise.name}
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(74, 222, 128, 0.8)', fontFamily: 'Space Grotesk' }}>
              {currentExerciseIndex + 1} de {allExercises.length}
            </p>
          </div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1"
            style={{
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#4ade80',
              fontFamily: 'Space Grotesk',
            }}
          >
            <Clock size={12} /> {formatTime(totalTime)}
          </motion.div>
        </div>

        {/* BARRA DE PROGRESSO */}
        <div className="px-4 pb-3">
          <div className="flex gap-1">
            {Array.from({ length: allExercises.length }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex-1 h-1 rounded-full"
                style={{
                  background: i < completedExercises.length + skippedExercises.length
                    ? '#4ade80'
                    : i === currentExerciseIndex
                    ? 'rgba(74, 222, 128, 0.5)'
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="px-4 py-4 space-y-4">
        {/* VÍDEO COM ILUMINAÇÃO DINÂMICA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden aspect-video"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,25,0.6) 100%)',
            boxShadow: '0 20px 60px rgba(74, 222, 128, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
          }}
        >
          {/* SELO TÉCNICA */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="absolute top-3 left-3 z-10 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
            style={{
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              backdropFilter: 'blur(10px)',
              color: '#4ade80',
              fontFamily: 'Space Grotesk',
            }}
          >
            <Lightbulb size={12} /> Técnica
          </motion.div>

          {/* PLAY BUTTON ANIMADO */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(74, 222, 128, 0.2)',
                border: '2px solid rgba(74, 222, 128, 0.4)',
              }}
            >
              <motion.div
                animate={{ scale: [1, 0.9, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.3) 0%, rgba(74, 222, 128, 0.1) 100%)',
                  border: '1.5px solid rgba(74, 222, 128, 0.5)',
                }}
              >
                <Zap size={24} style={{ color: '#4ade80' }} />
              </motion.div>
            </motion.div>
          </div>

          {/* BOTÃO EXPANDIR */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-3 right-3 p-2 rounded-lg"
            style={{
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              color: '#4ade80',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </motion.button>
        </motion.div>

        {/* CAIXA DE DICAS COM GLASSMORPHISM */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-3.5 flex gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.08) 0%, rgba(74, 222, 128, 0.03) 100%)',
            border: '1px solid rgba(74, 222, 128, 0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Lightbulb size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
          </motion.div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Outfit' }}>
            Mantenha os pés firmes no chão, <span style={{ color: '#4ade80', fontWeight: 600 }}>escápulas encaixadas</span> e trajetória controlada.
          </p>
        </motion.div>

        {/* 4 CARDS DE MÉTRICAS COM GLASSMORPHISM AVANÇADO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-2"
        >
          {/* SÉRIE */}
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="rounded-lg p-2.5 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.04) 100%)',
              border: '1px solid rgba(74, 222, 128, 0.2)',
              backdropFilter: 'blur(15px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(74, 222, 128, 0.08)',
            }}
          >
            <p className="text-[9px] font-bold text-white/60 mb-1.5" style={{ fontFamily: 'Space Grotesk' }}>SÉRIE</p>
            <p className="text-sm font-bold text-white mb-1.5" style={{ fontFamily: 'Space Grotesk' }}>
              {currentProgress.completedSets}/{activeExercise.sets}
            </p>
            <div className="flex gap-0.5">
              {progressBars.map((completed, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-1 h-1 rounded-full"
                  style={{ background: completed ? '#4ade80' : 'rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
          </motion.div>

          {/* REPETIÇÕES */}
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="rounded-lg p-2.5 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.04) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              backdropFilter: 'blur(15px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(251, 191, 36, 0.08)',
            }}
          >
            <p className="text-[9px] font-bold text-white/60 mb-1.5" style={{ fontFamily: 'Space Grotesk' }}>REPS</p>
            <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{currentProgress.reps}</p>
          </motion.div>

          {/* CARGA COM BOTÕES */}
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="rounded-lg p-2 col-span-2"
            style={{
              background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.04) 100%)',
              border: '1px solid rgba(74, 222, 128, 0.2)',
              backdropFilter: 'blur(15px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 12px rgba(74, 222, 128, 0.08)',
            }}
          >
            <p className="text-[9px] font-bold text-white/60 mb-1.5 text-center" style={{ fontFamily: 'Space Grotesk' }}>CARGA</p>
            <div className="flex items-center justify-between gap-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleUpdateWeight(-2.5)}
                className="flex-1 py-1 rounded-md text-xs font-bold"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#4ade80',
                }}
              >
                −
              </motion.button>
              <span className="flex-1 text-center text-xs font-bold text-white">{currentProgress.weight.toFixed(0)}kg</span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleUpdateWeight(2.5)}
                className="flex-1 py-1 rounded-md text-xs font-bold"
                style={{
                  background: 'rgba(74, 222, 128, 0.15)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  color: '#4ade80',
                }}
              >
                +
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* BOTÃO INICIAR SÉRIE - PREMIUM */}
        {!seriesStarted ? (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartSeries}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#0d0d0f',
              boxShadow: '0 12px 32px rgba(74, 222, 128, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              fontFamily: 'Space Grotesk',
            }}
          >
            <Check size={18} /> Iniciar Série
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCompleteSeries}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#0d0d0f',
              boxShadow: '0 12px 32px rgba(74, 222, 128, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              fontFamily: 'Space Grotesk',
            }}
          >
            <Check size={18} /> Concluir Série
          </motion.button>
        )}

        {/* TIMER DE DESCANSO */}
        <AnimatePresence>
          {restTimeRemaining !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="rounded-xl p-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 24px rgba(74, 222, 128, 0.1)',
              }}
            >
              <div>
                <p className="text-xs font-bold text-white/60 mb-1" style={{ fontFamily: 'Space Grotesk' }}>DESCANSO</p>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk', color: '#4ade80' }}>
                  {String(Math.floor(restTimeRemaining / 60)).padStart(2, '0')}:{String(restTimeRemaining % 60).padStart(2, '0')}
                </p>
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: restTimeRemaining, repeat: 0, ease: 'linear' }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'conic-gradient(#4ade80 0deg, #4ade80 ' + (360 * (1 - restTimeRemaining / activeExercise.restSeconds)) + 'deg, rgba(255,255,255,0.1) ' + (360 * (1 - restTimeRemaining / activeExercise.restSeconds)) + 'deg)',
                  border: '2px solid rgba(74, 222, 128, 0.2)',
                }}
              />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRestTimeRemaining(null)}
                className="px-4 py-2 rounded-lg font-bold text-xs"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'Space Grotesk',
                }}
              >
                Pular
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTÃO PULAR EXERCÍCIO */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSkipExercise}
          className="w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Space Grotesk',
          }}
        >
          <SkipForward size={14} /> Pular Exercício
        </motion.button>
      </div>

      {/* RODAPÉ */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 text-center text-xs text-white/40" style={{ fontFamily: 'Outfit' }}>
        FOCO • EXECUÇÃO • EVOLUÇÃO
      </div>
    </div>
  );
}
