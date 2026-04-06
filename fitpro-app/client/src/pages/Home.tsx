/**
 * FitPro — Home (Dashboard)
 * Design: Premium Dark Fitness / Luxury Sports
 * Layout atualizado conforme referência: Logo, Notificações, Avatar, Banner Hero e Treino de Hoje.
 */

import { useApp } from '@/contexts/AppContext';
import { useLocation } from '@/lib/router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import GamificationCard from '@/components/GamificationCard';
import {
  Flame, Dumbbell, Apple, ChevronRight,
  Zap, Play, Activity, Droplets, Settings, 
  Bell, Calendar, Clock, Users
} from 'lucide-react';

const GOAL_LABELS: Record<string, string> = {
  ganhar_massa: 'Ganhar Massa',
  perder_gordura: 'Perder Gordura',
  manter_peso: 'Manter Peso',
  definicao: 'Definição',
  resistencia: 'Resistência',
};

// Imagens de referência (podem ser substituídas por assets locais se disponíveis)
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function Home() {
  const { state, getTodayCalories, getTodaySteps, getTodayWaterCups, setTodayWaterCups } = useApp();
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
  
  const totalPoints = (workoutSessions.length * 100) + (progressPhotos.length * 50);
  const currentStreak = Math.min(workoutSessions.length, 30);
  const badges = [
    { id: '1', name: 'Primeiro Treino', icon: '🏋️', unlocked: workoutSessions.length > 0, description: 'Complete seu primeiro treino' },
    { id: '2', name: 'Semana de Fogo', icon: '🔥', unlocked: false, description: '7 dias de sequência' },
  ];

  const remaining = Math.max(profile.calorieGoal - todayMacros.consumed, 0);

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
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src={HERO_ATHLETE} 
              alt="Athlete" 
              className="w-full h-full object-cover object-right opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent" />
            {/* Green Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/4" />
          </div>

          {/* Content */}
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
            {/* Thumbnail */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0">
              <img src={WORKOUT_THUMB} alt="Workout" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Info */}
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

            {/* Action Button */}
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

      {/* ── OUTRAS MÉTRICAS (Compactas) ── */}
      <div className="px-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-[#ef4444]" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Calorias</span>
          </div>
          <p className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            {remaining.toLocaleString('pt-BR')} <span className="text-xs font-medium text-white/40">kcal</span>
          </p>
        </div>

        <div className="rounded-2xl bg-[#111111] border border-white/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-[#3b82f6]" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Passos</span>
          </div>
          <p className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            {todaySteps.toLocaleString('pt-BR')}
          </p>
        </div>
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
