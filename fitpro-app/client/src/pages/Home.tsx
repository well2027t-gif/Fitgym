/**
 * FitPro — Home (Dashboard)
 * Design: Premium Dark Fitness
 * Hero section + cards de métricas + progresso semanal.
 * Colors: #0d0d0f bg, var(--theme-accent) primary, glassmorphism cards
 */

import { useApp } from '@/contexts/AppContext';
import { useLocation } from '@/lib/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import GamificationCard from '@/components/GamificationCard';
import {
  Flame, Dumbbell, Apple, TrendingUp, ChevronRight,
  Zap, Target, Award, Play, Camera, Activity,
  Droplets, Heart, Dna, Settings, Plus, Minus, Check, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip
} from 'recharts';

const GOAL_LABELS: Record<string, string> = {
  ganhar_massa: 'Ganhar Massa',
  perder_gordura: 'Perder Gordura',
  manter_peso: 'Manter Peso',
  definicao: 'Definição',
  resistencia: 'Resistência',
};

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-hero-bg-CYWtBBWnia2uHvf6Wqn5hU.webp';
const AVATAR_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-avatar-default-XyLKS9rGNvzKQXnsNnmMUd.webp';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getMotivationalMessage(goal: string) {
  switch (goal) {
    case 'ganhar_massa':
      return 'Hoje é dia de construir força, volume e consistência em cada série.';
    case 'perder_gordura':
      return 'Cada escolha de hoje te aproxima de um físico mais leve, forte e definido.';
    case 'manter_peso':
      return 'Seu foco agora é equilíbrio, constância e performance inteligente ao longo do dia.';
    case 'definicao':
      return 'Mantenha intensidade, controle e disciplina para lapidar seus resultados.';
    case 'resistencia':
      return 'Respiração, ritmo e regularidade: o seu progresso nasce da repetição bem feita.';
    default:
      return 'Seu plano está pronto para mais um dia forte, consistente e focado.';
  }
}

function getUserLevel(totalPoints: number) {
  return Math.max(1, Math.floor(totalPoints / 250) + 1);
}

function CircularProgress({ value, max, size = 96 }: { value: number; max: number; size?: number }) {
  const pct = Math.min(value / max, 1);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--theme-accent)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        style={{ filter: 'drop-shadow(0 0 6px rgba(var(--theme-accent-rgb), 0.6))' }}
      />
    </svg>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function Home() {
  const { state, getTodayCalories, getTodaySteps, getTodayWaterCups, setTodayWaterCups, updatePreferences } = useApp();
  const [, navigate] = useLocation();
  const { profile, workouts, todayWorkoutId, weightEntries, progressPhotos, workoutSessions } = state;

  // Widget de água — usa AppContext para persistência e configuração
  const waterCups = getTodayWaterCups();
  const cupSizeMl = state.preferences.cupSizeMl || 250;
  const waterGoalLiters = state.preferences.waterGoalLiters || 2.5;
  const WATER_GOAL = Math.max(1, Math.round((waterGoalLiters * 1000) / cupSizeMl));
  const waterLitersConsumed = parseFloat(((waterCups * cupSizeMl) / 1000).toFixed(2));

  // Modal de configuração de hidratação
  const [showWaterConfig, setShowWaterConfig] = useState(false);
  const [configGoalLiters, setConfigGoalLiters] = useState(waterGoalLiters);
  const [configCupSizeMl, setConfigCupSizeMl] = useState(cupSizeMl);

  // Ciclo menstrual — fase atual
  const cycleProfile = state.cycleProfile;
  const lastCycleStart = cycleProfile?.lastPeriodStart ? new Date(cycleProfile.lastPeriodStart + 'T12:00:00') : null;
  const cycleLength = cycleProfile?.cycleLength || 28;
  const periodLength = cycleProfile?.periodLength || 5;
  let currentCycleDay = 0;
  if (lastCycleStart) {
    const today = new Date();
    const diff = Math.floor((today.getTime() - lastCycleStart.getTime()) / (1000 * 60 * 60 * 24));
    currentCycleDay = (diff % cycleLength) + 1;
  }
  function getCyclePhaseForHome(day: number) {
    if (!day) return null;
    if (day <= periodLength) return {
      name: 'Menstruação',
      emoji: '🩸',
      color: '#f87171',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.3)',
      workout: 'Treino leve ou descanso ativo. Priorize yoga, caminhada e alongamento.',
      tip: 'Seu corpo precisa de recuperação. Hidratação e calor ajudam nas cólicas.'
    };
    if (day <= 13) return {
      name: 'Fase Folicular',
      emoji: '🌱',
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)',
      border: 'rgba(96,165,250,0.3)',
      workout: 'Fase ideal para treinos de força e alta intensidade (HIIT). Seu corpo está no pico!',
      tip: 'Estrogênio em alta = mais energia e recuperação rápida. Aproveite!'
    };
    if (day <= 16) return {
      name: 'Ovulação',
      emoji: '✨',
      color: '#f472b6',
      bg: 'rgba(244,114,182,0.12)',
      border: 'rgba(244,114,182,0.3)',
      workout: 'Pico de desempenho! Treine pesado com foco em PR (recordes pessoais).',
      tip: 'Você está no seu momento mais forte do ciclo. Empurre seus limites!'
    };
    return {
      name: 'Fase Lútea',
      emoji: '🌙',
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.12)',
      border: 'rgba(251,191,36,0.3)',
      workout: 'Prefira cardio moderado, pilates e treinos funcionais. Evite excesso de volume.',
      tip: 'Progesterona em alta pode causar fadiga. Respeite seu corpo e durma bem.'
    };
  }
  const currentPhase = getCyclePhaseForHome(currentCycleDay);
  const todayMacros = getTodayCalories();
  const todaySteps = getTodaySteps();
  const stepGoal = state.preferences.dailyStepGoal;
  const stepPct = Math.min((todaySteps / stepGoal) * 100, 100);
  const todayWorkout = workouts.find(w => w.id === todayWorkoutId);
  const recentPhotos = progressPhotos.slice(-3).reverse();

  // Gamification data
  const badges = [
    { id: '1', name: 'Primeiro Treino', icon: '🏋️', unlocked: workoutSessions.length > 0, description: 'Complete seu primeiro treino' },
    { id: '2', name: 'Semana de Fogo', icon: '🔥', unlocked: false, description: '7 dias de sequência' },
    { id: '3', name: 'Mês Implacável', icon: '⚡', unlocked: false, description: '30 dias de sequência' },
    { id: '4', name: 'Meta Atingida', icon: '🎯', unlocked: weightEntries.length > 0 && weightEntries[weightEntries.length - 1].weight <= profile.weight, description: 'Atinja sua meta de peso' },
    { id: '5', name: 'Fotógrafo', icon: '📸', unlocked: progressPhotos.length >= 3, description: '3 fotos de evolução' },
    { id: '6', name: 'Nutricionista', icon: '🥗', unlocked: false, description: 'Dia perfeito de dieta' },
    { id: '7', name: 'Recorde Pessoal', icon: '🏆', unlocked: false, description: 'Bata seu recorde' },
    { id: '8', name: 'Consistência', icon: '⭐', unlocked: workoutSessions.length >= 10, description: '10 treinos completos' },
  ];

  const currentStreak = Math.min(workoutSessions.length, 30);
  const totalPoints = (workoutSessions.length * 100) + (progressPhotos.length * 50) + (badges.filter(b => b.unlocked).length * 200);
  const unlockedBadges = badges.filter(b => b.unlocked).length;
  const userLevel = getUserLevel(totalPoints);
  const motivationalMessage = getMotivationalMessage(profile.goal);

  // Weekly weight data for chart
  const weekData = weightEntries.slice(-7).map(e => ({
    day: new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
    peso: e.weight,
  }));

  const caloriesPct = Math.min((todayMacros.consumed / profile.calorieGoal) * 100, 100);
  const remaining = Math.max(profile.calorieGoal - todayMacros.consumed, 0);

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 278 }}>
        <img
          src={HERO_BG}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.24 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,12,0.18) 0%, rgba(13,13,15,0.78) 52%, rgba(13,13,15,0.98) 100%)',
          }}
        />
        <div
          className="absolute -top-10 -right-10 w-44 h-44 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(var(--theme-accent-rgb),0.22) 0%, rgba(var(--theme-accent-rgb),0) 72%)' }}
        />
        <div
          className="absolute top-16 -left-10 w-36 h-36 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)' }}
        />

        <div className="relative z-10 px-5 pt-7 pb-5">
          <div className="flex items-start justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 pt-1"
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Activity size={12} style={{ color: 'var(--theme-accent)' }} />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.62)', fontFamily: 'Outfit' }}>
                  Painel de hoje
                </span>
              </div>

              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>
                {getGreeting()},
              </p>
              <h1
                className="text-[28px] font-bold text-white leading-tight tracking-[-0.03em]"
                style={{ fontFamily: 'Space Grotesk' }}
              >
                {profile.name} <span style={{ color: 'var(--theme-accent)' }}>👋</span>
              </h1>
              <p className="text-sm leading-relaxed mt-2 max-w-[240px]" style={{ color: 'rgba(255,255,255,0.62)', fontFamily: 'Outfit' }}>
                {motivationalMessage}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5"
                  style={{
                    background: 'rgba(var(--theme-accent-rgb), 0.18)',
                    color: 'var(--theme-accent)',
                    border: '1px solid rgba(var(--theme-accent-rgb), 0.25)',
                    fontFamily: 'Outfit',
                  }}
                >
                  <Zap size={11} />
                  {GOAL_LABELS[profile.goal]}
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.78)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontFamily: 'Outfit',
                  }}
                >
                  <Award size={11} />
                  {profile.weight} kg atuais
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full font-medium inline-flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255,215,64,0.10)',
                    color: '#ffd84d',
                    border: '1px solid rgba(255,215,64,0.18)',
                    fontFamily: 'Outfit',
                  }}
                >
                  <Award size={11} />
                  Nível {userLevel}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="relative shrink-0"
            >
              <div
                className="absolute inset-0 rounded-[28px] blur-2xl"
                style={{ background: 'rgba(var(--theme-accent-rgb), 0.20)' }}
              />
              <div
                className="relative w-[74px] h-[74px] rounded-[26px] overflow-hidden"
                style={{
                  border: '1.5px solid rgba(var(--theme-accent-rgb), 0.42)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.35), 0 0 22px rgba(var(--theme-accent-rgb), 0.16)',
                }}
              >
                <img src={AVATAR_IMG} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                style={{
                  background: 'rgba(10,10,12,0.86)',
                  border: '1px solid rgba(var(--theme-accent-rgb), 0.35)',
                  color: 'var(--theme-accent)',
                  fontFamily: 'Outfit',
                  backdropFilter: 'blur(10px)',
                }}
              >
                online
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="grid grid-cols-3 gap-2 mt-5"
          >
            <div
              className="rounded-2xl px-3 py-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                Nível
              </p>
              <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {userLevel}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>
                {totalPoints} pts
              </p>
            </div>

            <div
              className="rounded-2xl px-3 py-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                Badges
              </p>
              <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {unlockedBadges}/{badges.length}
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>
                liberadas
              </p>
            </div>

            <div
              className="rounded-2xl px-3 py-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                Hoje
              </p>
              <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {todayWorkout ? 'Treino' : 'Livre'}
              </p>
              <p className="text-[11px] mt-1 truncate" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>
                {todaySteps.toLocaleString('pt-BR')} passos
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-2 gap-3 mt-3"
          >
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.16)' }}>
                  <Target size={15} style={{ color: 'var(--theme-accent)' }} />
                </div>
                <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.46)', fontFamily: 'Outfit' }}>
                  Meta atual
                </span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug" style={{ fontFamily: 'Space Grotesk' }}>
                {GOAL_LABELS[profile.goal]}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>
                foco principal do seu plano
              </p>
            </div>

            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.16) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(var(--theme-accent-rgb), 0.20)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(10,10,12,0.24)' }}>
                  <Flame size={15} style={{ color: 'var(--theme-accent)' }} />
                </div>
                <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.46)', fontFamily: 'Outfit' }}>
                  Restante hoje
                </span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug" style={{ fontFamily: 'Space Grotesk' }}>
                {remaining.toLocaleString('pt-BR')} kcal
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                para chegar na sua meta diária
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-6 space-y-4 -mt-2">

        {/* ── Banner de Fase do Ciclo ── */}
        {currentPhase && (
          <motion.div
            custom={-1} variants={cardVariants} initial="hidden" animate="visible"
            className="rounded-2xl p-4 cursor-pointer"
            style={{ background: currentPhase.bg, border: `1px solid ${currentPhase.border}` }}
            onClick={() => navigate('/ciclo')}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.2)' }}>
                {currentPhase.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: currentPhase.color, fontFamily: 'Outfit' }}>
                    Saúde Feminina • Dia {currentCycleDay}
                  </span>
                  <ChevronRight size={14} style={{ color: currentPhase.color }} />
                </div>
                <p className="text-sm font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                  {currentPhase.name}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit' }}>
                  <span className="font-semibold" style={{ color: currentPhase.color }}>Treino de hoje: </span>
                  {currentPhase.workout}
                </p>
                <p className="text-xs mt-1.5 italic" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                  {currentPhase.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Widget de Água ── */}
        <motion.div
          custom={-0.5} variants={cardVariants} initial="hidden" animate="visible"
          className="fitpro-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.15)' }}>
                <Droplets size={16} style={{ color: '#38bdf8' }} />
              </div>
              <div>
                <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Hidratação</span>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
                  Meta: {waterGoalLiters}L • Copo: {cupSizeMl}ml
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs font-bold" style={{ color: '#38bdf8', fontFamily: 'Space Grotesk' }}>
                  {waterLitersConsumed}L / {waterGoalLiters}L
                </span>
                {waterCups >= WATER_GOAL && (
                  <div><span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8' }}>Meta!</span></div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => navigate('/hidratacao')} className="flex items-center gap-0.5">
                  <span className="text-xs" style={{ color: '#38bdf8', fontFamily: 'Outfit' }}>Detalhes</span>
                  <ChevronRight size={12} style={{ color: '#38bdf8' }} />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setConfigGoalLiters(waterGoalLiters); setConfigCupSizeMl(cupSizeMl); setShowWaterConfig(true); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}
                >
                  <Settings size={14} style={{ color: '#38bdf8' }} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-2 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((waterCups / WATER_GOAL) * 100, 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Copos interativos */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: Math.min(WATER_GOAL, 12) }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setTodayWaterCups(i < waterCups ? i : i + 1)}
                className="flex-1 min-w-[32px] h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: i < waterCups ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.04)',
                  border: i < waterCups ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.06)',
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <Droplets size={14} style={{ color: i < waterCups ? '#38bdf8' : 'rgba(255,255,255,0.2)' }} />
              </motion.button>
            ))}
          </div>
          <p className="text-[11px] mt-2 text-center" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
            Toque nos copos para registrar sua hidratação diária
          </p>
        </motion.div>

        {/* ── Calories Card ── */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="fitpro-card p-4"
          style={{ boxShadow: '0 0 30px rgba(var(--theme-accent-rgb), 0.08), 0 4px 20px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Flame size={16} style={{ color: '#ef4444' }} />
              </div>
              <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Calorias Hoje</span>
            </div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
              {remaining} kcal restantes
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <CircularProgress value={todayMacros.consumed} max={profile.calorieGoal} size={88} />
              <div className="absolute text-center">
                <p className="text-lg font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>
                  {Math.round(caloriesPct)}%
                </p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-end mb-1">
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {todayMacros.consumed}
                </span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                  / {profile.calorieGoal} kcal
                </span>
              </div>
              {/* Macro bars */}
              <div className="space-y-1.5 mt-2">
                {[
                  { label: 'Prot', value: todayMacros.protein, max: profile.proteinGoal, color: 'var(--theme-accent)' },
                  { label: 'Carb', value: todayMacros.carbs, max: profile.carbGoal, color: '#f59e0b' },
                  { label: 'Gord', value: todayMacros.fat, max: profile.fatGoal, color: '#ef4444' },
                ].map(({ label, value, max, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] w-7" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>{label}</span>
                    <div className="flex-1 macro-bar">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      />
                    </div>
                    <span className="text-[10px] w-10 text-right" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                      {Math.round(value)}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Passos do Dia ── */}
        {state.preferences.stepTrackingEnabled && (
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="fitpro-card p-4"
            style={{ boxShadow: '0 0 25px rgba(var(--theme-accent-rgb), 0.1), 0 4px 20px rgba(0,0,0,0.35)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <Activity size={16} style={{ color: '#60a5fa' }} />
                </div>
                <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Passos de Hoje</span>
              </div>
              <button onClick={() => navigate('/perfil')} className="flex items-center gap-0.5">
                <span className="text-xs" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>Configurar</span>
                <ChevronRight size={12} style={{ color: 'var(--theme-accent)' }} />
              </button>
            </div>

            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="text-2xl font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>
                  {todaySteps.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                  Meta diária de {stepGoal.toLocaleString('pt-BR')} passos
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>
                  {Math.round(stepPct)}%
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
                  da meta
                </p>
              </div>
            </div>

            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #60a5fa 0%, var(--theme-accent) 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${stepPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}

        {/* ── Treino do Dia ── */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          {todayWorkout ? (
            <div
              className="fitpro-card p-4 relative overflow-hidden"
              style={{ boxShadow: '0 0 25px rgba(var(--theme-accent-rgb), 0.12)' }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(var(--theme-accent-rgb), 0.08) 0%, transparent 70%)',
                  transform: 'translate(30%, -30%)',
                }}
              />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}>
                    <Dumbbell size={16} style={{ color: 'var(--theme-accent)' }} />
                  </div>
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treino de Hoje</span>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                {todayWorkout.name}
              </h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {todayWorkout.muscleGroups.map(mg => (
                  <span key={mg} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                    {mg}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                  {todayWorkout.exercises.length} exercícios
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/treino-ativo/${todayWorkout.id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold btn-glow"
                  style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <Play size={14} fill="#0d0d0f" />
                  Iniciar Treino
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="fitpro-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}>
                  <Dumbbell size={16} style={{ color: 'var(--theme-accent)' }} />
                </div>
                <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treino de Hoje</span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                Nenhum treino selecionado para hoje.
              </p>
              <button
                onClick={() => navigate('/treinos')}
                className="text-sm font-medium"
                style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}
              >
                Selecionar treino →
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Resumo da Dieta ── */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <div className="fitpro-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <Apple size={16} style={{ color: '#f59e0b' }} />
                </div>
                <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Dieta de Hoje</span>
              </div>
              <button onClick={() => navigate('/dieta')} className="flex items-center gap-0.5">
                <span className="text-xs" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>Ver tudo</span>
                <ChevronRight size={12} style={{ color: 'var(--theme-accent)' }} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Café', icon: '☕', calories: (() => { const d = state.dietDays.find(d => d.date === new Date().toISOString().split('T')[0]); return d?.meals.find(m => m.type === 'breakfast')?.foods.reduce((a, f) => a + f.calories, 0) ?? 0; })() },
                { label: 'Almoço', icon: '🍽️', calories: (() => { const d = state.dietDays.find(d => d.date === new Date().toISOString().split('T')[0]); return d?.meals.find(m => m.type === 'lunch')?.foods.reduce((a, f) => a + f.calories, 0) ?? 0; })() },
                { label: 'Lanche', icon: '🥜', calories: (() => { const d = state.dietDays.find(d => d.date === new Date().toISOString().split('T')[0]); return d?.meals.find(m => m.type === 'snack')?.foods.reduce((a, f) => a + f.calories, 0) ?? 0; })() },
                { label: 'Janta', icon: '🌙', calories: (() => { const d = state.dietDays.find(d => d.date === new Date().toISOString().split('T')[0]); return d?.meals.find(m => m.type === 'dinner')?.foods.reduce((a, f) => a + f.calories, 0) ?? 0; })() },
              ].map(({ label, icon, calories }) => (
                <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-lg mb-0.5">{icon}</div>
                  <p className="text-xs font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>{calories}</p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Gamificação ── */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <GamificationCard
            totalPoints={totalPoints}
            currentStreak={currentStreak}
            longestStreak={currentStreak}
            badges={badges}
          />
        </motion.div>

        {/* ── Fotos de Evolução ── */}
        {recentPhotos.length > 0 && (
          <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
            <div className="fitpro-card overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                    <Camera size={16} style={{ color: '#a855f7' }} />
                  </div>
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Evolução</span>
                </div>
                <button onClick={() => navigate('/progresso')} className="flex items-center gap-0.5">
                  <span className="text-xs" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>Ver todas</span>
                  <ChevronRight size={12} style={{ color: 'var(--theme-accent)' }} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4 pt-2">
                {recentPhotos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative rounded-xl overflow-hidden cursor-pointer group"
                    style={{ aspectRatio: '3/4' }}
                    onClick={() => navigate('/progresso')}
                  >
                    <img src={photo.dataUrl} alt="evolução" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                      <p className="text-[10px] text-white font-medium" style={{ fontFamily: 'Outfit' }}>
                        {new Date(photo.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Progresso Semanal ── */}
        <motion.div custom={recentPhotos.length > 0 ? 4 : 3} variants={cardVariants} initial="hidden" animate="visible">
          <div className="fitpro-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}>
                  <TrendingUp size={16} style={{ color: 'var(--theme-accent)' }} />
                </div>
                <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Peso Semanal</span>
              </div>
              <button onClick={() => navigate('/progresso')} className="flex items-center gap-0.5">
                <span className="text-xs" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>Detalhes</span>
                <ChevronRight size={12} style={{ color: 'var(--theme-accent)' }} />
              </button>
            </div>
            {weekData.length > 1 ? (
              <div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {weekData[weekData.length - 1]?.peso ?? profile.weight} kg
                  </span>
                  {weekData.length >= 2 && (
                    <span
                      className="text-xs font-medium mb-1"
                      style={{
                        color: (weekData[weekData.length - 1]?.peso ?? 0) <= (weekData[weekData.length - 2]?.peso ?? 0) ? 'var(--theme-accent)' : '#ef4444',
                        fontFamily: 'Outfit',
                      }}
                    >
                      {((weekData[weekData.length - 1]?.peso ?? 0) - (weekData[weekData.length - 2]?.peso ?? 0)).toFixed(1)} kg
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={weekData} margin={{ top: 5, right: 0, left: -30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--theme-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1c20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontFamily: 'Outfit', fontSize: 12 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                      itemStyle={{ color: 'var(--theme-accent)' }}
                    />
                    <Area type="monotone" dataKey="peso" stroke="var(--theme-accent)" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: 'var(--theme-accent)', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
                Registre seu peso para ver o progresso
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div custom={recentPhotos.length > 0 ? 5 : 4} variants={cardVariants} initial="hidden" animate="visible">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Target, label: 'Meta', value: `${profile.calorieGoal}`, unit: 'kcal', color: 'var(--theme-accent)', bg: 'rgba(var(--theme-accent-rgb), 0.1)' },
              { icon: Award, label: 'Treinos', value: `${state.workoutSessions.length}`, unit: 'total', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { icon: TrendingUp, label: 'Peso', value: `${profile.weight}`, unit: 'kg', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
            ].map(({ icon: Icon, label, value, unit, color, bg }) => (
              <div key={label} className="fitpro-card p-3 text-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: bg }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-base font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>{value}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>{unit}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal de Configuração de Hidratação */}
      <AnimatePresence>
        {showWaterConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowWaterConfig(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl overflow-y-auto"
              style={{ background: '#161618', maxHeight: '90vh' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div className="px-5 pb-8 pt-2">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.15)' }}>
                      <Droplets size={16} style={{ color: '#38bdf8' }} />
                    </div>
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Configurar Hidratação</h2>
                  </div>
                  <button onClick={() => setShowWaterConfig(false)}>
                    <X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </button>
                </div>

                {/* Meta diária */}
                <div className="mb-5">
                  <label className="text-xs font-semibold mb-3 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit', letterSpacing: '0.1em' }}>META DIÁRIA DE ÁGUA</label>
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.15)' }}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-2xl font-bold" style={{ color: '#38bdf8', fontFamily: 'Space Grotesk' }}>{configGoalLiters.toFixed(1)} L</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                          = {Math.round((configGoalLiters * 1000) / configCupSizeMl)} copos de {configCupSizeMl}ml
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfigGoalLiters(v => Math.max(0.5, parseFloat((v - 0.25).toFixed(2))))} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <Minus size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfigGoalLiters(v => parseFloat((v + 0.25).toFixed(2)))} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.2)' }}>
                          <Plus size={16} style={{ color: '#38bdf8' }} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[1.5, 2.0, 2.5, 3.0, 3.5].map(v => (
                        <motion.button key={v} whileTap={{ scale: 0.9 }} onClick={() => setConfigGoalLiters(v)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: configGoalLiters === v ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)', color: configGoalLiters === v ? '#38bdf8' : 'rgba(255,255,255,0.5)', border: configGoalLiters === v ? '1px solid rgba(56,189,248,0.4)' : '1px solid transparent', fontFamily: 'Space Grotesk' }}>
                          {v}L
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tamanho do copo */}
                <div className="mb-6">
                  <label className="text-xs font-semibold mb-3 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit', letterSpacing: '0.1em' }}>TAMANHO DO COPO</label>
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div>
                        <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{configCupSizeMl} ml</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>por copo</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfigCupSizeMl(v => Math.max(100, v - 50))} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <Minus size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setConfigCupSizeMl(v => Math.min(1000, v + 50))} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.18)' }}>
                          <Plus size={16} style={{ color: 'var(--theme-accent)' }} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[150, 200, 250, 300, 500].map(v => (
                        <motion.button key={v} whileTap={{ scale: 0.9 }} onClick={() => setConfigCupSizeMl(v)} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: configCupSizeMl === v ? 'rgba(var(--theme-accent-rgb), 0.2)' : 'rgba(255,255,255,0.06)', color: configCupSizeMl === v ? 'var(--theme-accent)' : 'rgba(255,255,255,0.5)', border: configCupSizeMl === v ? '1px solid rgba(var(--theme-accent-rgb), 0.4)' : '1px solid transparent', fontFamily: 'Space Grotesk' }}>
                          {v}ml
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-3 mb-4" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)' }}>
                  <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                    Você precisará beber{' '}
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{Math.round((configGoalLiters * 1000) / configCupSizeMl)} copos de {configCupSizeMl}ml</span>{' '}
                    por dia para atingir sua meta de{' '}
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{configGoalLiters.toFixed(1)}L</span>.
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    updatePreferences({ waterGoalLiters: configGoalLiters, cupSizeMl: configCupSizeMl });
                    setShowWaterConfig(false);
                  }}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <Check size={16} />
                  Salvar Configurações
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
