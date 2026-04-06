/**
 * FitPro — Home (Dashboard)
 * Design: Premium Dark Fitness / Luxury Sports
 * Layout atualizado: novo cabeçalho + banner hero + todas as seções originais (Hidratação, Dieta, Passos, Gamificação)
 */

import { useApp } from '@/contexts/AppContext';
import { useLocation } from '@/lib/router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import GamificationCard from '@/components/GamificationCard';
import {
  Flame, Dumbbell, Apple, ChevronRight,
  Zap, Play, Activity, Droplets, Settings, 
  Bell, Calendar, Clock, Users, Award, Target
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

// Imagens de referência
const HERO_ATHLETE = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop';
const WORKOUT_THUMB = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';
const AVATAR_IMG = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop';

function FitgymLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
        <Dumbbell size={18} className="text-black fill-black" />
      </div>
      <span className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>
        Fitgym
      </span>
    </div>
  );
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

  const waterCups = getTodayWaterCups();
  const cupSizeMl = state.preferences.waterCupSizeMl || 250;
  const waterGoalLiters = state.preferences.waterGoalLiters || 2.5;
  const WATER_GOAL = Math.max(1, Math.round((waterGoalLiters * 1000) / cupSizeMl));
  const waterLitersConsumed = parseFloat(((waterCups * cupSizeMl) / 1000).toFixed(2));

  const [showWaterConfig, setShowWaterConfig] = useState(false);
  const [configGoalLiters, setConfigGoalLiters] = useState(waterGoalLiters);
  const [configCupSizeMl, setConfigCupSizeMl] = useState(cupSizeMl);

  const todayMacros = getTodayCalories();
  const todaySteps = getTodaySteps();
  const stepGoal = state.preferences.dailyStepGoal;
  const stepPct = Math.min((todaySteps / stepGoal) * 100, 100);
  const todayWorkout = workouts.find(w => w.id === todayWorkoutId);
  const recentPhotos = progressPhotos.slice(-3).reverse();
  
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
  const caloriesPct = Math.min((todayMacros.consumed / profile.calorieGoal) * 100, 100);
  const remaining = Math.max(profile.calorieGoal - todayMacros.consumed, 0);
  const weekData = weightEntries.slice(-7).map(e => ({
    day: new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }),
    peso: e.weight,
  }));

  return (
    <div className="min-h-screen pb-24" style={{ background: '#000000' }}>
      {/* ── TOP BAR ── */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <FitgymLogo />
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell size={24} className="text-white opacity-90" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-black" />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#22c55e] overflow-hidden shadow-[0_0_10px_rgba(34,197,94,0.3)]">
            <img src={AVATAR_IMG} alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="px-4 mb-8">
        <div className="relative rounded-[2rem] overflow-hidden bg-[#111111] border border-white/5 min-h-[240px] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src={HERO_ATHLETE} 
              alt="Athlete" 
              className="w-full h-full object-cover object-right opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/4" />
          </div>

          <div className="relative z-10 px-6 py-8 max-w-[65%]">
            <div className="inline-block px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 mb-4">
              <span className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">BEM-VINDO(A)</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-[1.1] mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              SEU MELHOR <br />
              <span className="text-[#22c55e]">COMEÇA AQUI</span>
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-6 font-medium">
              Treinos personalizados, evolução real. Tudo o que você precisa para chegar lá.
            </p>
            <button 
              onClick={() => navigate('/treinos')}
              className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-[#c5ff22] hover:bg-[#b0e61e] transition-colors shadow-[0_8px_20px_rgba(197,255,34,0.25)]"
            >
              <span className="text-black font-bold text-sm">Iniciar treino</span>
              <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                <Play size={12} className="text-[#c5ff22] fill-[#c5ff22] ml-0.5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── TREINO DE HOJE ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-[#c5ff22]" />
            <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treino de hoje</h3>
          </div>
          <button onClick={() => navigate('/treinos')} className="flex items-center gap-1 text-white/40 hover:text-white/60 transition-colors">
            <span className="text-xs font-medium">Ver todos</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {todayWorkout ? (
          <div 
            className="group relative rounded-[1.5rem] bg-[#111111] border border-white/5 p-4 flex gap-4 items-center cursor-pointer hover:border-white/10 transition-all"
            onClick={() => navigate(`/treino-ativo/${todayWorkout.id}`)}
          >
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
              <img src={WORKOUT_THUMB} alt="Workout" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-block px-2 py-0.5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 mb-1.5">
                <span className="text-[9px] font-bold text-[#22c55e] uppercase tracking-wider">FOCO</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-2 truncate" style={{ fontFamily: 'Space Grotesk' }}>
                {todayWorkout.name}
              </h4>
              
              <div className="flex flex-wrap gap-1.5 mb-3">
                {todayWorkout.muscleGroups.slice(0, 5).map(mg => (
                  <span key={mg} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-white/50 font-medium">
                    {mg}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-white/40">
                  <Users size={14} />
                  <span className="text-[11px] font-medium">{todayWorkout.exercises.length} exercícios</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/40">
                  <Clock size={14} />
                  <span className="text-[11px] font-medium">45 min</span>
                </div>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#c5ff22] group-hover:border-[#c5ff22] transition-all">
              <ChevronRight size={20} className="text-white group-hover:text-black" />
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-[#111111] border border-dashed border-white/10 p-8 text-center">
            <p className="text-white/40 text-sm mb-4">Nenhum treino para hoje</p>
            <button 
              onClick={() => navigate('/treinos')}
              className="text-[#c5ff22] text-sm font-bold underline underline-offset-4"
            >
              Selecionar um treino
            </button>
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 pb-6 space-y-4">

        {/* ── Widget de Água ── */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
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

          <div className="w-full h-2 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((waterCups / WATER_GOAL) * 100, 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: Math.min(WATER_GOAL, 24) }).map((_, i) => (
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
          custom={1} variants={cardVariants} initial="hidden" animate="visible"
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
            custom={2}
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

        {/* ── Gamificação ── */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <GamificationCard
            totalPoints={totalPoints}
            currentStreak={currentStreak}
            longestStreak={currentStreak}
            badges={badges}
          />
        </motion.div>

        {/* ── Fotos de Evolução ── */}
        {recentPhotos.length > 0 && (
          <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
            <div className="fitpro-card overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                    <span className="text-base">📸</span>
                  </div>
                  <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Evolução</span>
                </div>
                <button onClick={() => navigate('/evolucao')} className="flex items-center gap-0.5">
                  <span className="text-xs" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>Ver tudo</span>
                  <ChevronRight size={12} style={{ color: 'var(--theme-accent)' }} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                {recentPhotos.map((photo, idx) => (
                  <motion.div
                    key={photo.id}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => navigate('/evolucao')}
                  >
                    <img src={photo.url} alt="Progress" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Dieta de Hoje ── */}
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
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
      </div>

      {/* Rodapé com Logo FitPro */}
      <div className="mt-12 mb-8 flex flex-col items-center justify-center opacity-20">
        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] text-white uppercase mb-4">
          <span>FOCO</span>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <span>EXECUÇÃO</span>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <span>EVOLUÇÃO</span>
        </div>
        <FitgymLogo />
      </div>
    </div>
  );
}
