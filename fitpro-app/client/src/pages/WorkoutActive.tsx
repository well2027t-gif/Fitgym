/**
 * FitPro — WorkoutActive Page (Premium Redesign)
 * Design: Premium Dark Fitness
 * Modo de treino ativo com animações elaboradas e timer premium.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, Clock, Dumbbell, Play, Pause,
  RotateCcw, ChevronRight, Trophy, X, Flame, Target
} from 'lucide-react';
import { toast } from 'sonner';

function RestTimer({ seconds, onComplete }: { seconds: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) { onComplete(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, running, onComplete]);

  const pct = remaining / seconds;
  const r = 50;
  const circ = 2 * Math.PI * r;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <p className="text-sm font-medium mb-8" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
          DESCANSO
        </p>
        
        {/* Animated Circle Timer */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
            <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <motion.circle
              cx="80" cy="80" r={r}
              fill="none"
              stroke="var(--theme-accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              style={{ filter: 'drop-shadow(0 0 12px rgba(var(--theme-accent-rgb), 0.8))' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-6xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {remaining}
              </span>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>segundos</p>
            </motion.div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1.5 rounded-full mx-auto mb-8" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--theme-accent) 0%, #84cc16 100%)',
              width: `${pct * 100}%`,
              boxShadow: '0 0 12px rgba(var(--theme-accent-rgb), 0.8)',
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setRunning(r => !r)}
            className="w-14 h-14 rounded-full flex items-center justify-center btn-glow"
            style={{ background: running ? 'rgba(255,255,255,0.1)' : 'rgba(var(--theme-accent-rgb), 0.2)', border: '2px solid rgba(255,255,255,0.15)' }}
          >
            {running ? <Pause size={24} style={{ color: 'white' }} /> : <Play size={24} style={{ color: 'var(--theme-accent)' }} />}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="px-8 py-3.5 rounded-xl text-sm font-bold btn-glow"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
          >
            Próximo
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setRemaining(seconds)}
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)' }}
          >
            <RotateCcw size={20} style={{ color: 'white' }} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WorkoutActive() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { state, saveWorkoutSession } = useApp();

  const workout = state.workouts.find(w => w.id === id);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [startTime] = useState(Date.now());

  if (!workout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0d0d0f' }}>
        <Dumbbell size={48} style={{ color: 'rgba(255,255,255,0.15)' }} />
        <p className="text-base font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treino não encontrado</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Este treino pode ter sido removido.</p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/treinos')}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
        >
          Voltar aos Treinos
        </motion.button>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const completedCount = completed.size;
  const totalCount = workout.exercises.length;
  const progress = (completedCount / totalCount) * 100;

  const toggleExercise = (exId: string) => {
    const newSet = new Set(completed);
    if (newSet.has(exId)) {
      newSet.delete(exId);
    } else {
      newSet.add(exId);
    }
    setCompleted(newSet);
  };

  const handleExerciseClick = (exId: string, idx: number) => {
    const wasCompleted = completed.has(exId);
    toggleExercise(exId);
    
    // Avançar para o próximo exercício não concluído
    if (!wasCompleted) {
      const nextIncomplete = workout.exercises.findIndex((ex, i) => i > idx && !completed.has(ex.id) && ex.id !== exId);
      if (nextIncomplete !== -1) {
        setCurrentExerciseIndex(nextIncomplete);
      } else {
        // Se todos após estão concluídos, manter no atual ou ir ao último
        const anyIncomplete = workout.exercises.findIndex((ex) => !completed.has(ex.id) && ex.id !== exId);
        if (anyIncomplete !== -1) {
          setCurrentExerciseIndex(anyIncomplete);
        }
      }
    }
  };

  const startRest = (seconds: number) => {
    setTimerSeconds(seconds);
    setShowTimer(true);
  };

  const finishWorkout = () => {
    if (completed.size === 0) {
      toast.error('Complete pelo menos 1 exercício antes de finalizar!');
      return;
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    saveWorkoutSession({
      workoutId: workout.id,
      date: new Date().toISOString().split('T')[0],
      completedExercises: Array.from(completed),
      durationSeconds,
    });
    toast.success(`Treino concluído! ${completedCount}/${totalCount} exercícios`);
    navigate('/treinos');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3" style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-between mb-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/treinos')}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ArrowLeft size={20} style={{ color: 'white' }} />
          </motion.button>
          <h1 className="text-lg font-bold text-white flex-1 ml-3" style={{ fontFamily: 'Space Grotesk' }}>
            {workout.name}
          </h1>
          <div className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)', color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>
            {completedCount}/{totalCount}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--theme-accent) 0%, #84cc16 100%)',
              boxShadow: '0 0 12px rgba(var(--theme-accent-rgb), 0.6)',
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Current Exercise Highlight */}
      {currentExercise && !completed.has(currentExercise.id) && (
        <motion.div
          key={currentExerciseIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.15) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)',
            border: '2px solid rgba(var(--theme-accent-rgb), 0.3)',
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>EXERCÍCIO ATUAL</p>
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {currentExercise.name}
              </h2>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)' }}
            >
              <Dumbbell size={18} style={{ color: 'var(--theme-accent)' }} />
            </motion.div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Séries</p>
              <p className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{currentExercise.sets}</p>
            </div>
            <div className="px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Reps</p>
              <p className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{currentExercise.reps}</p>
            </div>
            <div className="px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Carga</p>
              <p className="text-lg font-bold" style={{ color: '#f59e0b', fontFamily: 'Space Grotesk' }}>{currentExercise.weight}kg</p>
            </div>
            <div className="px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Descanso</p>
              <p className="text-lg font-bold" style={{ color: '#ef4444', fontFamily: 'Space Grotesk' }}>{currentExercise.restSeconds}s</p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => startRest(currentExercise.restSeconds)}
            className="w-full mt-3 py-3 rounded-xl text-sm font-bold btn-glow flex items-center justify-center gap-2"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
          >
            <Play size={16} fill="#0d0d0f" /> Começar Descanso
          </motion.button>
        </motion.div>
      )}

      {/* All completed message */}
      {completed.size === totalCount && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-4 mt-4 p-5 rounded-2xl text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.2) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)',
            border: '2px solid rgba(var(--theme-accent-rgb), 0.4)',
          }}
        >
          <Trophy size={32} style={{ color: 'var(--theme-accent)', margin: '0 auto 8px' }} />
          <p className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Todos os exercícios concluídos!
          </p>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
            Clique em "Finalizar Treino" para salvar sua sessão
          </p>
        </motion.div>
      )}

      {/* Exercises List */}
      <div className="px-4 py-4 space-y-2">
        {workout.exercises.map((ex, idx) => {
          const isCompleted = completed.has(ex.id);
          const isCurrent = idx === currentExerciseIndex && !isCompleted;

          return (
            <motion.div
              key={ex.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 4 }}
              onClick={() => handleExerciseClick(ex.id, idx)}
              className="p-4 rounded-xl cursor-pointer group transition-all"
              style={{
                background: isCompleted ? 'rgba(var(--theme-accent-rgb), 0.1)' : isCurrent ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'rgba(255,255,255,0.04)',
                border: isCompleted ? '1.5px solid rgba(var(--theme-accent-rgb), 0.4)' : isCurrent ? '2px solid rgba(var(--theme-accent-rgb), 0.5)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={false}
                  animate={{ scale: isCompleted ? 1.1 : 1 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isCompleted ? 'var(--theme-accent)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {isCompleted ? (
                    <Check size={16} style={{ color: '#0d0d0f' }} />
                  ) : (
                    <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk' }}>
                      {idx + 1}
                    </span>
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCompleted ? 'line-through' : ''}`} style={{ color: isCompleted ? 'rgba(255,255,255,0.4)' : 'white', fontFamily: 'Space Grotesk' }}>
                    {ex.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(var(--theme-accent-rgb), 0.1)', color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>
                      {ex.sets}×{ex.reps}
                    </span>
                    <span className="text-xs font-bold" style={{ color: '#f59e0b', fontFamily: 'Space Grotesk' }}>{ex.weight}kg</span>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isCurrent ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                >
                  <ChevronRight size={18} style={{ color: isCurrent ? 'var(--theme-accent)' : 'rgba(255,255,255,0.2)' }} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Finish Button */}
      <div className="px-4 pb-6 pt-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={finishWorkout}
          className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2"
          style={{
            background: completed.size > 0 ? 'var(--theme-accent)' : 'rgba(255,255,255,0.08)',
            color: completed.size > 0 ? '#0d0d0f' : 'rgba(255,255,255,0.3)',
            fontFamily: 'Space Grotesk',
            boxShadow: completed.size > 0 ? '0 0 20px rgba(var(--theme-accent-rgb), 0.3)' : 'none',
          }}
        >
          <Trophy size={20} fill={completed.size > 0 ? '#0d0d0f' : 'rgba(255,255,255,0.3)'} /> Finalizar Treino
        </motion.button>
        {completed.size === 0 && (
          <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
            Complete pelo menos 1 exercício para finalizar
          </p>
        )}
      </div>

      {/* Rest Timer Modal */}
      <AnimatePresence>
        {showTimer && (
          <RestTimer
            seconds={timerSeconds}
            onComplete={() => setShowTimer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
