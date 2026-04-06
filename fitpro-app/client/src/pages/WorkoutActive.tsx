/**
 * FitPro — WorkoutActive Page
 * Layout compacto: tudo visível em uma única tela de celular
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Lightbulb,
  Minus,
  Plus,
  SkipForward,
  Clock,
  RefreshCw,
  Dumbbell,
  Timer,
  Weight,
  Maximize2,
  Play,
  CheckCircle2,
  Info,
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

/* SVG do logo FitPro para o rodapé */
function FitProLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 16h4M20 16h4M12 16v-4a4 4 0 0 1 8 0v8a4 4 0 0 1-8 0v-4z" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* Componente do gráfico circular de descanso */
function RestCircle({ progress, size = 48 }: { progress: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(74, 222, 128, 0.12)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="#4ade80" strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
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
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTotalTime(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    if (!workout) return;
    setExerciseState(previous => {
      const next: Record<string, ExerciseProgressState> = {};
      workout.exercises.forEach(exercise => {
        next[exercise.id] = previous[exercise.id] ?? { completedSets: 0, weight: exercise.weight, reps: exercise.reps, skipped: false };
      });
      return next;
    });
  }, [workout]);

  useEffect(() => {
    if (restTimeRemaining === null || restTimeRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev === null || prev <= 1) { clearInterval(interval); toast.success('Descanso concluído!'); return null; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimeRemaining]);

  const allExercises = workout?.exercises ?? [];
  const activeExercise = allExercises[currentExerciseIndex];

  const completedExercises = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.filter(ex => { const p = exerciseState[ex.id]; return p && !p.skipped && p.completedSets >= ex.sets; });
  }, [workout, exerciseState]);

  const skippedExercises = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.filter(ex => exerciseState[ex.id]?.skipped).map(ex => ex.id);
  }, [workout, exerciseState]);

  const goToNextPendingExercise = useCallback(() => {
    if (!workout) return;
    const nextIndex = workout.exercises.findIndex((ex, i) => {
      if (i <= currentExerciseIndex) return false;
      const p = exerciseState[ex.id];
      return !p?.skipped && (p?.completedSets ?? 0) < ex.sets;
    });
    if (nextIndex !== -1) setCurrentExerciseIndex(nextIndex);
  }, [workout, currentExerciseIndex, exerciseState]);

  const handleCompleteSeries = () => {
    if (!activeExercise) return;
    const cp = exerciseState[activeExercise.id] || { completedSets: 0, weight: activeExercise.weight, reps: activeExercise.reps, skipped: false };
    const newSets = cp.completedSets + 1;
    setExerciseState(prev => ({ ...prev, [activeExercise.id]: { ...cp, completedSets: newSets } }));
    if (newSets < activeExercise.sets) {
      setRestTimeTotal(activeExercise.restSeconds);
      setRestTimeRemaining(activeExercise.restSeconds);
      toast.success(`Série ${newSets}/${activeExercise.sets} concluída!`);
    } else {
      toast.success(`Exercício concluído! ${activeExercise.sets}/${activeExercise.sets}`);
      setTimeout(() => goToNextPendingExercise(), 500);
    }
  };

  const handleSkipRest = () => setRestTimeRemaining(null);

  const handleUpdateWeight = (delta: number) => {
    if (!activeExercise) return;
    const c = exerciseState[activeExercise.id];
    if (!c) return;
    setExerciseState(prev => ({ ...prev, [activeExercise.id]: { ...c, weight: Math.max(0, c.weight + delta) } }));
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (!workout || !activeExercise) {
    return (<div className="flex h-screen items-center justify-center bg-[#0d0d0f]"><p style={{ color: 'rgba(255,255,255,0.5)' }}>Treino não encontrado</p></div>);
  }

  const currentProgress = exerciseState[activeExercise.id] || { completedSets: 0, weight: activeExercise.weight, reps: activeExercise.reps, skipped: false };
  const progressBars = Array.from({ length: activeExercise.sets }, (_, i) => i < currentProgress.completedSets);
  const restProgress = restTimeTotal > 0 && restTimeRemaining !== null ? restTimeRemaining / restTimeTotal : 0;
  const instructionText = activeExercise.instructions || 'Mantenha a postura correta e controle o movimento.';

  const renderInstruction = (text: string) => {
    const keywords = ['peito aberto', 'escápulas encaixadas', 'trajetória controlada', 'abdômen firme', 'coluna neutra', 'controle', 'o tronco', 'ombros encaixados', 'pés firmes', 'linha reta'];
    const parts: Array<{ text: string; highlight: boolean }> = [];
    let remaining = text;
    while (remaining.length > 0) {
      let ei = remaining.length; let mk = '';
      for (const kw of keywords) { const idx = remaining.toLowerCase().indexOf(kw.toLowerCase()); if (idx !== -1 && idx < ei) { ei = idx; mk = kw; } }
      if (mk && ei < remaining.length) {
        if (ei > 0) parts.push({ text: remaining.substring(0, ei), highlight: false });
        parts.push({ text: remaining.substring(ei, ei + mk.length), highlight: true });
        remaining = remaining.substring(ei + mk.length);
      } else { parts.push({ text: remaining, highlight: false }); remaining = ''; }
    }
    return parts.map((p, i) => p.highlight ? <span key={i} style={{ color: '#fbbf24', fontWeight: 600 }}>{p.text}</span> : <span key={i}>{p.text}</span>);
  };

  const isResting = restTimeRemaining !== null;
  const font = 'Space Grotesk, sans-serif';

  return (
    <div className="h-[100dvh] bg-[#0d0d0f] flex flex-col overflow-hidden">

      {/* ── CABEÇALHO ── */}
      <div className="flex-shrink-0 px-3 pt-3 pb-1.5" style={{ background: '#0d0d0f' }}>
        <div className="flex items-center justify-between mb-1.5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/treinos')}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <ArrowLeft size={16} style={{ color: 'rgba(255,255,255,0.8)' }} />
          </motion.button>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold text-white" style={{ fontFamily: font }}>{activeExercise.name}</h1>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: font }}>{currentExerciseIndex + 1} de {allExercises.length} exercícios</p>
          </div>
          <div className="px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', color: '#4ade80', fontFamily: font }}>
            <Clock size={10} /> {formatTime(totalTime)}
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: allExercises.length }).map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full" style={{
              background: i < completedExercises.length + skippedExercises.length ? '#4ade80' : i === currentExerciseIndex ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>
      </div>

      {/* ── CONTEÚDO SCROLLÁVEL ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5" style={{ paddingBottom: '48px' }}>

        {/* VÍDEO */}
        <div className="relative rounded-xl overflow-hidden" style={{
          aspectRatio: '16/9',
          background: 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(30,30,35,0.7) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontFamily: font }}>
            <Lightbulb size={10} /> Técnica
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}>
              <Play size={22} style={{ color: 'rgba(255,255,255,0.9)', marginLeft: '2px' }} fill="rgba(255,255,255,0.9)" />
            </div>
          </div>
          <button className="absolute bottom-2 right-2 w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
            <Maximize2 size={13} />
          </button>
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
        </div>

        {/* DICA DE TÉCNICA — ícone Info ao invés do boneco */}
        <div className="rounded-lg px-3 py-2.5 flex items-start gap-2.5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <Info size={14} style={{ color: '#4ade80' }} />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit, sans-serif' }}>
            {renderInstruction(instructionText)}
          </p>
        </div>

        {/* 4 CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* SÉRIE */}
          <div className="rounded-lg p-2 text-center flex flex-col items-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <RefreshCw size={11} style={{ color: 'rgba(255,255,255,0.45)' }} />
            </div>
            <p className="text-[8px] font-bold tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: font }}>SÉRIE</p>
            <p className="text-sm font-bold text-white" style={{ fontFamily: font }}>{currentProgress.completedSets + 1}/{activeExercise.sets}</p>
            <div className="flex gap-px mt-1 w-full">
              {progressBars.map((done, i) => (
                <div key={i} className="flex-1 h-[3px] rounded-full" style={{ background: done ? '#4ade80' : 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>
          </div>

          {/* REPETIÇÕES */}
          <div className="rounded-lg p-2 text-center flex flex-col items-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <Dumbbell size={11} style={{ color: 'rgba(255,255,255,0.45)' }} />
            </div>
            <p className="text-[8px] font-bold tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: font }}>REPETIÇÕES</p>
            <p className="text-sm font-bold text-white" style={{ fontFamily: font }}>{currentProgress.reps} reps</p>
          </div>

          {/* CARGA */}
          <div className="rounded-lg p-2 text-center flex flex-col items-center"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1.5px solid rgba(74,222,128,0.3)', boxShadow: '0 2px 8px rgba(74,222,128,0.08)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(74,222,128,0.15)' }}>
              <Weight size={11} style={{ color: '#4ade80' }} />
            </div>
            <p className="text-[8px] font-bold tracking-wider mb-0.5" style={{ color: '#4ade80', fontFamily: font }}>CARGA</p>
            <p className="text-sm font-bold text-white" style={{ fontFamily: font }}>{currentProgress.weight.toFixed(0)} <span className="text-[10px]">kg</span></p>
            <div className="flex gap-1 mt-1 w-full">
              <button onClick={() => handleUpdateWeight(-2.5)} className="flex-1 py-0.5 rounded text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                <Minus size={10} />
              </button>
              <button onClick={() => handleUpdateWeight(2.5)} className="flex-1 py-0.5 rounded text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                <Plus size={10} />
              </button>
            </div>
          </div>

          {/* DESCANSO */}
          <div className="rounded-lg p-2 text-center flex flex-col items-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(168,85,247,0.1)' }}>
              <Timer size={11} style={{ color: '#a855f7' }} />
            </div>
            <p className="text-[8px] font-bold tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: font }}>DESCANSO</p>
            <p className="text-sm font-bold text-white" style={{ fontFamily: font }}>{activeExercise.restSeconds}s</p>
          </div>
        </div>

        {/* BOTÃO CONCLUIR SÉRIE */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleCompleteSeries}
          className="w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: '#0d0d0f',
            boxShadow: '0 8px 24px rgba(74,222,128,0.25)',
            fontFamily: font,
          }}>
          <CheckCircle2 size={18} /> Concluir série
        </motion.button>

        {/* Texto informativo */}
        <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
          Ao concluir, o descanso será iniciado.
        </p>

        {/* TIMER DE DESCANSO — layout compacto horizontal */}
        <AnimatePresence>
          {isResting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-3 py-3 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(74,222,128,0.15)',
              }}
            >
              {/* Gráfico circular pequeno */}
              <div className="flex-shrink-0 relative">
                <RestCircle progress={restProgress} size={44} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Timer size={14} style={{ color: '#4ade80' }} />
                </div>
              </div>

              {/* Timer + label */}
              <div className="flex-1">
                <p className="text-[9px] font-bold tracking-wider" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: font }}>DESCANSO</p>
                <p className="text-xl font-bold" style={{ fontFamily: font }}>
                  <span style={{ color: '#4ade80' }}>{String(Math.floor((restTimeRemaining || 0) / 60)).padStart(2, '0')}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)' }}>:</span>
                  <span style={{ color: '#4ade80' }}>{String((restTimeRemaining || 0) % 60).padStart(2, '0')}</span>
                </p>
              </div>

              {/* Botão pular */}
              <button onClick={handleSkipRest}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.55)', fontFamily: font }}>
                <SkipForward size={12} /> Pular
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RODAPÉ FIXO ── */}
      <div className="flex-shrink-0 py-2 flex flex-col items-center gap-0.5" style={{ background: '#0d0d0f' }}>
        <p className="text-[8px] font-semibold tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: font }}>
          FOCO &nbsp;•&nbsp; EXECUÇÃO &nbsp;•&nbsp; EVOLUÇÃO
        </p>
        <FitProLogo />
      </div>
    </div>
  );
}
