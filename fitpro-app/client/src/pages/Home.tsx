/**
 * FitPro — Home (Dashboard)
 * Design: Premium Dark Fitness
 * Hero section + cards de métricas + progresso semanal.
 * Colors: #0d0d0f bg, var(--theme-accent) primary, glassmorphism cards
 */

import { useApp } from '@/contexts/AppContext';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import GamificationCard from '@/components/GamificationCard';
import ThemeMenu from '@/components/ThemeMenu';
import {
  Flame, Dumbbell, Apple, TrendingUp, ChevronRight,
  Zap, Target, Award, Play, Camera
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
  const { state, getTodayCalories } = useApp();
  const [, navigate] = useLocation();
  const { profile, workouts, todayWorkoutId, weightEntries, progressPhotos, workoutSessions } = state;
  const todayMacros = getTodayCalories();
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
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img
          src={HERO_BG}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.35 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(13,13,15,0.2) 0%, rgba(13,13,15,0.95) 100%)' }}
        />
        <div className="relative z-10 px-5 pt-8 pb-4 flex items-start justify-between h-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
              {getGreeting()},
            </p>
            <h1
              className="text-2xl font-bold text-white leading-tight"
              style={{ fontFamily: 'Space Grotesk' }}
            >
              {profile.name} 👋
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)', color: 'var(--theme-accent)', fontFamily: 'Outfit' }}
              >
                <Zap size={10} className="inline mr-1" />
                {GOAL_LABELS[profile.goal]}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                {profile.weight} kg
              </span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex gap-2 items-start"
          >
            <ThemeMenu />
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden"
              style={{
                border: '2px solid rgba(var(--theme-accent-rgb), 0.5)',
                boxShadow: '0 0 20px rgba(var(--theme-accent-rgb), 0.3)',
              }}
            >
              <img src={AVATAR_IMG} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-6 space-y-4 -mt-2">

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
    </div>
  );
}
