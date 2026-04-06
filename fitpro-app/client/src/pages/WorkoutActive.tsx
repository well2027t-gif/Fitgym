/**
 * FitPro — WorkoutActive Page (Layout Idêntico ao Design de Referência)
 * Iluminação dinâmica, glassmorphism avançado e micro-interações de elite
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
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
  RefreshCw,
  Dumbbell,
  Timer,
  Weight,
  Maximize2,
  Play,
  CheckCircle2,
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

/* SVG do corpo humano (silhueta com destaque na coluna) */
function BodyIcon({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="56"
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Cabeça */}
      <circle cx="24" cy="8" r="6" stroke="#4ade80" strokeWidth="1.5" fill="rgba(74, 222, 128, 0.1)" />
      {/* Pescoço */}
      <line x1="24" y1="14" x2="24" y2="18" stroke="#4ade80" strokeWidth="1.5" />
      {/* Ombros */}
      <line x1="12" y1="22" x2="36" y2="22" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      {/* Braço esquerdo */}
      <line x1="12" y1="22" x2="8" y2="36" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      {/* Braço direito */}
      <line x1="36" y1="22" x2="40" y2="36" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tronco */}
      <line x1="24" y1="18" x2="24" y2="38" stroke="#4ade80" strokeWidth="1.5" />
      {/* Coluna vertebral (destaque) */}
      <line x1="24" y1="20" x2="24" y2="36" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      {/* Perna esquerda */}
      <line x1="24" y1="38" x2="18" y2="54" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      {/* Perna direita */}
      <line x1="24" y1="38" x2="30" y2="54" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
      {/* Glow na coluna */}
      <line x1="24" y1="22" x2="24" y2="34" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" opacity="0.15" />
    </svg>
  );
}

/* SVG do logo FitPro para o rodapé */
function FitProLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16h4M20 16h4M12 16v-4a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0v-4z" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* Componente do gráfico circular de descanso */
function RestCircle({ progress, size = 64 }: { progress: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(74, 222, 128, 0.15)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#4ade80"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  );
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
  const [restTimeTotal, setRestTimeTotal] = useState<number>(0);
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

  const goToNextPendingExercise = useCallback(() => {
    if (!workout) return;
    const nextIndex = workout.exercises.findIndex((exercise, index) => {
      if (index <= currentExerciseIndex) return false;
      const progress = exerciseState[exercise.id];
      return !progress?.skipped && (progress?.completedSets ?? 0) < exercise.sets;
    });
    if (nextIndex !== -1) {
      setCurrentExerciseIndex(nextIndex);
    }
  }, [workout, currentExerciseIndex, exerciseState]);

  const handleCompleteSeries = () => {
    if (!activeExercise) return;
    const currentProgress = exerciseState[activeExercise.id] || { completedSets: 0, weight: activeExercise.weight, reps: activeExercise.reps, skipped: false };
    const newCompletedSets = currentProgress.completedSets + 1;
    
    setExerciseState(prev => ({
      ...prev,
      [activeExercise.id]: { ...currentProgress, completedSets: newCompletedSets },
    }));

    if (newCompletedSets < activeExercise.sets) {
      setRestTimeTotal(activeExercise.restSeconds);
      setRestTimeRemaining(activeExercise.restSeconds);
      toast.success(`Série ${newCompletedSets}/${activeExercise.sets} concluída!`);
    } else {
      toast.success(`Exercício concluído! ${activeExercise.sets}/${activeExercise.sets}`);
      setTimeout(() => goToNextPendingExercise(), 500);
    }
  };

  const handleSkipRest = () => {
    setRestTimeRemaining(null);
  };

  const handleUpdateWeight = (delta: number) => {
    if (!activeExercise) return;
    const current = exerciseState[activeExercise.id];
    if (!current) return;
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

  const currentProgress = exerciseState[activeExercise.id] || {
    completedSets: 0,
    weight: activeExercise.weight,
    reps: activeExercise.reps,
    skipped: false
  };
  
  const progressBars = Array.from({ length: activeExercise.sets }, (_, i) => i < currentProgress.completedSets);
  const restProgress = restTimeTotal > 0 && restTimeRemaining !== null ? restTimeRemaining / restTimeTotal : 0;

  // Texto de instrução dinâmico baseado no exercício
  const instructionText = activeExercise.instructions || 'Mantenha a postura correta e controle o movimento durante toda a execução.';

  // Função para destacar palavras-chave nas instruções
  const renderInstruction = (text: string) => {
    // Palavras-chave para destacar em verde/amarelo
    const keywords = [
      'peito aberto', 'escápulas encaixadas', 'trajetória controlada',
      'abdômen firme', 'coluna neutra', 'controle', 'o tronco',
      'ombros encaixados', 'pés firmes', 'linha reta',
    ];
    
    let result = text;
    const parts: Array<{ text: string; highlight: boolean }> = [];
    let remaining = text;
    
    while (remaining.length > 0) {
      let earliestIndex = remaining.length;
      let matchedKeyword = '';
      
      for (const keyword of keywords) {
        const idx = remaining.toLowerCase().indexOf(keyword.toLowerCase());
        if (idx !== -1 && idx < earliestIndex) {
          earliestIndex = idx;
          matchedKeyword = keyword;
        }
      }
      
      if (matchedKeyword && earliestIndex < remaining.length) {
        if (earliestIndex > 0) {
          parts.push({ text: remaining.substring(0, earliestIndex), highlight: false });
        }
        parts.push({ text: remaining.substring(earliestIndex, earliestIndex + matchedKeyword.length), highlight: true });
        remaining = remaining.substring(earliestIndex + matchedKeyword.length);
      } else {
        parts.push({ text: remaining, highlight: false });
        remaining = '';
      }
    }
    
    return parts.map((part, i) => 
      part.highlight ? (
        <span key={i} style={{ color: '#fbbf24', fontWeight: 600 }}>{part.text}</span>
      ) : (
        <span key={i}>{part.text}</span>
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] pb-20">
      {/* ═══════════════════════════════════════════════ */}
      {/* CABEÇALHO */}
      {/* ═══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 px-4 pt-4 pb-2"
        style={{ background: '#0d0d0f' }}
      >
        <div className="flex items-center justify-between mb-2">
          {/* Botão Voltar */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/treinos')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <ArrowLeft size={18} style={{ color: 'rgba(255,255,255,0.8)' }} />
          </motion.button>

          {/* Título Central */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {activeExercise.name}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk, sans-serif' }}>
              {currentExerciseIndex + 1} de {allExercises.length} exercícios
            </p>
          </div>

          {/* Timer */}
          <motion.div
            className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{
              background: 'rgba(74, 222, 128, 0.1)',
              border: '1px solid rgba(74, 222, 128, 0.25)',
              color: '#4ade80',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            <Clock size={12} /> {formatTime(totalTime)}
          </motion.div>
        </div>

        {/* Barra de Progresso (segmentos) */}
        <div className="flex gap-1.5 mt-2">
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
                  : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════ */}
      {/* CONTEÚDO PRINCIPAL */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="px-4 py-3 space-y-4">

        {/* ─── VÍDEO ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            aspectRatio: '16/10',
            background: 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(30,30,35,0.7) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Badge Técnica */}
          <motion.div
            className="absolute top-3 left-3 z-10 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              backdropFilter: 'blur(10px)',
              color: '#4ade80',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            <Lightbulb size={12} /> Técnica
          </motion.div>

          {/* Play Button Central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Play size={28} style={{ color: 'rgba(255,255,255,0.9)', marginLeft: '3px' }} fill="rgba(255,255,255,0.9)" />
            </motion.div>
          </div>

          {/* Botão Expandir */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <Maximize2 size={16} />
          </motion.button>

          {/* Placeholder de imagem de fundo */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
        </motion.div>

        {/* ─── DICA DE TÉCNICA (com ícone de corpo humano) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Ícone de corpo humano */}
          <div className="flex-shrink-0">
            <BodyIcon />
          </div>
          {/* Texto da dica */}
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'Outfit, sans-serif' }}>
            {renderInstruction(instructionText)}
          </p>
        </motion.div>

        {/* ─── 4 CARDS DE MÉTRICAS ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-2"
        >
          {/* SÉRIE */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-3 text-center flex flex-col items-center"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <RefreshCw size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </div>
            <p className="text-[9px] font-bold tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk, sans-serif' }}>
              SÉRIE
            </p>
            <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {currentProgress.completedSets + 1} / {activeExercise.sets}
            </p>
            {/* Mini barra de progresso */}
            <div className="flex gap-0.5 mt-2 w-full">
              {progressBars.map((completed, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full"
                  style={{ background: completed ? '#4ade80' : 'rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
          </motion.div>

          {/* REPETIÇÕES */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-3 text-center flex flex-col items-center"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Dumbbell size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </div>
            <p className="text-[9px] font-bold tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk, sans-serif' }}>
              REPETIÇÕES
            </p>
            <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {currentProgress.reps} reps
            </p>
          </motion.div>

          {/* CARGA (destacado com borda verde) */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-3 text-center flex flex-col items-center"
            style={{
              background: 'linear-gradient(180deg, rgba(74, 222, 128, 0.12) 0%, rgba(74, 222, 128, 0.04) 100%)',
              border: '1.5px solid rgba(74, 222, 128, 0.35)',
              boxShadow: '0 4px 16px rgba(74, 222, 128, 0.1)',
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(74, 222, 128, 0.15)' }}>
              <Weight size={14} style={{ color: '#4ade80' }} />
            </div>
            <p className="text-[9px] font-bold tracking-wider mb-1" style={{ color: '#4ade80', fontFamily: 'Space Grotesk, sans-serif' }}>
              CARGA
            </p>
            <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {currentProgress.weight.toFixed(0)} <span className="text-xs font-semibold">kg</span>
            </p>
            {/* Botões - e + */}
            <div className="flex gap-1.5 mt-2 w-full">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleUpdateWeight(-2.5)}
                className="flex-1 py-1 rounded-md text-xs font-bold flex items-center justify-center"
                style={{
                  background: 'rgba(74, 222, 128, 0.2)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  color: '#4ade80',
                }}
              >
                <Minus size={12} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleUpdateWeight(2.5)}
                className="flex-1 py-1 rounded-md text-xs font-bold flex items-center justify-center"
                style={{
                  background: 'rgba(74, 222, 128, 0.2)',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  color: '#4ade80',
                }}
              >
                <Plus size={12} />
              </motion.button>
            </div>
          </motion.div>

          {/* DESCANSO */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-3 text-center flex flex-col items-center"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(168, 85, 247, 0.12)' }}>
              <Timer size={14} style={{ color: '#a855f7' }} />
            </div>
            <p className="text-[9px] font-bold tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk, sans-serif' }}>
              DESCANSO
            </p>
            <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {activeExercise.restSeconds}s
            </p>
          </motion.div>
        </motion.div>

        {/* ─── BOTÃO CONCLUIR SÉRIE ─── */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCompleteSeries}
          className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
          style={{
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: '#0d0d0f',
            boxShadow: '0 12px 40px rgba(74, 222, 128, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          <CheckCircle2 size={22} /> Concluir série
        </motion.button>

        {/* Texto informativo abaixo do botão */}
        <div className="text-center flex items-center justify-center gap-1">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit, sans-serif' }}>
            Ao concluir, o descanso será iniciado.
          </p>
          {/* Seta curva */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#4ade80' }}>
            <path d="M12 5v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          </svg>
        </div>

        {/* ─── TIMER DE DESCANSO ─── */}
        <AnimatePresence>
          {restTimeRemaining !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="rounded-2xl p-5 flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(74, 222, 128, 0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {/* Lado esquerdo: label + timer + texto */}
              <div className="flex flex-col">
                <p className="text-[10px] font-bold tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk, sans-serif' }}>
                  DESCANSO
                </p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <span style={{ color: '#4ade80' }}>
                    {String(Math.floor((restTimeRemaining || 0) / 60)).padStart(2, '0')}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>:</span>
                  <span style={{ color: '#4ade80' }}>
                    {String((restTimeRemaining || 0) % 60).padStart(2, '0')}
                  </span>
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                  Tempo restante
                </p>
              </div>

              {/* Centro: gráfico circular */}
              <div className="flex items-center justify-center">
                <RestCircle progress={restProgress} size={64} />
              </div>

              {/* Direita: botão pular descanso */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSkipRest}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                <SkipForward size={14} /> Pular descanso
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* RODAPÉ */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 py-3 flex flex-col items-center gap-1.5" style={{ background: 'linear-gradient(180deg, transparent 0%, #0d0d0f 40%)' }}>
        <p className="text-[10px] font-semibold tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk, sans-serif' }}>
          FOCO &nbsp;•&nbsp; EXECUÇÃO &nbsp;•&nbsp; EVOLUÇÃO
        </p>
        <FitProLogo />
      </div>
    </div>
  );
}
