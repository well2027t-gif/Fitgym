/**
 * FitPro — Workouts Page (Redesigned with Weekly Calendar & Planning)
 * Design: Premium Dark Fitness / Performance Editorial
 * Novo fluxo: Calendário Semanal → Seleção de Modo → Planejamento → Execução
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Dumbbell,
  Flame,
  Layers3,
  PencilLine,
  Play,
  Plus,
  RefreshCcw,
  Sparkles,
  Trash2,
  UserRound,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from '@/lib/router';
import { type Exercise, type Goal, type Workout, useApp } from '@/contexts/AppContext';
import {
  buildExerciseFromTemplate,
  getExerciseLibrary,
  getRecommendedExercises,
  type WorkoutProfileInput,
} from '@/lib/workoutEngine';

const HERO_IMAGE = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-workout-bg-ZvMSyEQH7ULJ9PwivEHvMf.webp';

const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombro',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Posterior',
  'Abdômen',
  'Core',
  'Condicionamento',
] as const;

const GOAL_LABELS: Record<Goal, string> = {
  ganhar_massa: 'Hipertrofia',
  perder_gordura: 'Perda de gordura',
  manter_peso: 'Manutenção',
  definicao: 'Definição',
  resistencia: 'Resistência',
};

function buildProfileInput(stateProfile: ReturnType<typeof useApp>['state']['profile']): WorkoutProfileInput {
  return {
    goal: stateProfile.goal,
    age: stateProfile.age,
    weight: stateProfile.weight,
    height: stateProfile.height,
    sex: stateProfile.sex,
    level: stateProfile.level,
    trainingFrequency: stateProfile.trainingFrequency,
    trainingLocation: stateProfile.trainingLocation,
    availableEquipment: stateProfile.availableEquipment,
    limitations: stateProfile.limitations,
  };
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[28px] border p-4 shadow-[0_22px_60px_rgba(0,0,0,0.28)] ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(14,14,16,0.98) 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {children}
    </div>
  );
}

export default function Workouts() {
  const [, navigate] = useLocation();
  const { state, generateWorkout, deleteWorkout } = useApp();
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Segunda, 6 = Domingo
  const [mode, setMode] = useState<'select' | 'auto' | 'custom'>('select');
  const [isGenerating, setIsGenerating] = useState(false);

  const workoutForDay = useMemo(() => {
    return state.workouts[selectedDay] || null;
  }, [state.workouts, selectedDay]);

  const handleGenerateAutomatic = async () => {
    setIsGenerating(true);
    try {
      const profile = buildProfileInput(state.profile);
      await generateWorkout(profile, selectedDay);
      toast.success('Treino gerado com sucesso!');
      setMode('select');
    } catch (error) {
      toast.error('Erro ao gerar treino automático');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartWorkout = () => {
    if (!workoutForDay) {
      toast.error('Nenhum treino disponível para este dia');
      return;
    }
    navigate(`/treino-ativo/${workoutForDay.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] pb-24">
      {/* HERO SECTION */}
      <div
        className="relative h-48 overflow-hidden rounded-b-[32px]"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.05) 100%), url('${HERO_IMAGE}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0d0f]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-2 text-center">
          <Dumbbell size={40} style={{ color: '#4ade80' }} />
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Seus Treinos
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
            Planeje e execute sua semana de treinos
          </p>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="px-4 py-6">
        {/* CALENDÁRIO SEMANAL */}
        <Panel className="mb-6">
          <h2 className="mb-4 text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            <CalendarDays size={16} className="inline mr-2" />
            Selecione o Dia
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDay(index);
                  setMode('select');
                }}
                className="flex-shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all"
                style={{
                  background: selectedDay === index ? '#4ade80' : 'rgba(255,255,255,0.08)',
                  color: selectedDay === index ? '#0d0d0f' : 'rgba(255,255,255,0.6)',
                  border: selectedDay === index ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'Space Grotesk',
                }}
              >
                {day}
              </motion.button>
            ))}
          </div>
        </Panel>

        {/* MODO DE TREINO */}
        <AnimatePresence mode="wait">
          {mode === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Panel className="mb-6">
                <h2 className="mb-4 text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {DAYS_OF_WEEK[selectedDay]}
                </h2>

                {workoutForDay ? (
                  <div className="space-y-3">
                    <div className="rounded-lg border p-3" style={{ background: 'rgba(74, 222, 128, 0.1)', borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                      <p className="text-xs font-bold text-[#4ade80]" style={{ fontFamily: 'Space Grotesk' }}>
                        ✓ Treino Agendado
                      </p>
                      <p className="mt-1 text-sm text-white" style={{ fontFamily: 'Space Grotesk' }}>
                        {workoutForDay.exercises.length} exercícios
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                        {workoutForDay.exercises.map(e => e.name).join(', ')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStartWorkout}
                        className="flex-1 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                        style={{ background: '#4ade80', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                      >
                        <Play size={16} /> Iniciar Treino
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMode('custom')}
                        className="flex-1 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 border"
                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Space Grotesk' }}
                      >
                        <PencilLine size={16} /> Personalizar
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                      Nenhum treino agendado para este dia
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMode('auto')}
                      className="w-full rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                      style={{ background: '#4ade80', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                    >
                      <Sparkles size={16} /> Gerar Treino Automático
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setMode('custom')}
                      className="w-full rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 border"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Space Grotesk' }}
                    >
                      <PencilLine size={16} /> Criar Personalizado
                    </motion.button>
                  </div>
                )}
              </Panel>
            </motion.div>
          ) : mode === 'auto' ? (
            <motion.div
              key="auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Panel className="mb-6">
                <h2 className="mb-4 text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  <Bot size={16} className="inline mr-2" />
                  Gerar Treino Automático
                </h2>
                <p className="mb-4 text-sm" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                  O sistema vai analisar seu perfil e gerar um treino otimizado para {DAYS_OF_WEEK[selectedDay]}.
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateAutomatic}
                    disabled={isGenerating}
                    className="flex-1 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                    style={{ background: '#4ade80', color: '#0d0d0f', fontFamily: 'Space Grotesk', opacity: isGenerating ? 0.6 : 1 }}
                  >
                    {isGenerating ? <Clock3 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isGenerating ? 'Gerando...' : 'Gerar Agora'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode('select')}
                    className="flex-1 rounded-lg px-4 py-3 text-sm font-bold border"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Space Grotesk' }}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </Panel>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Panel className="mb-6">
                <h2 className="mb-4 text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  <PencilLine size={16} className="inline mr-2" />
                  Personalizar Treino
                </h2>
                <p className="mb-4 text-sm" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>
                  Crie um treino personalizado selecionando os exercícios desejados.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/treinos/criar')}
                  className="w-full rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: '#4ade80', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <Plus size={16} /> Criar Treino Personalizado
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('select')}
                  className="w-full mt-2 rounded-lg px-4 py-3 text-sm font-bold border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Space Grotesk' }}
                >
                  Voltar
                </motion.button>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LISTA DE TREINOS EXISTENTES */}
        <Panel>
          <h2 className="mb-4 text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            <ClipboardList size={16} className="inline mr-2" />
            Todos os Treinos
          </h2>
          {state.workouts.length === 0 ? (
            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
              Nenhum treino criado ainda. Gere um treino automático ou crie um personalizado.
            </p>
          ) : (
            <div className="space-y-2">
              {state.workouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg border p-3 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      {DAYS_OF_WEEK[index]} - {workout.exercises.length} exercícios
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                      {workout.exercises.map(e => e.name).join(', ')}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteWorkout(workout.id)}
                    className="ml-2 p-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <Trash2 size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
