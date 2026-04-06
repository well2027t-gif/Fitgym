/**
 * FitPro — Profile Page
 * Design: Premium Dark Fitness / Performance Editorial
 * Perfil pessoal integrado ao novo sistema de treinos.
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Calendar,
  Check,
  ChevronRight,
  Dumbbell,
  Edit3,
  MapPin,
  Minus,
  Plus,
  Ruler,
  Scale,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import ThemeSelector from '@/components/ThemeSelector';
import { type Goal, useApp } from '@/contexts/AppContext';

const AVATAR_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-avatar-default-XyLKS9rGNvzKQXnsNnmMUd.webp';

const GOAL_OPTIONS: Array<{ value: Goal; label: string; desc: string }> = [
  { value: 'ganhar_massa', label: 'Hipertrofia', desc: 'Mais volume e progressão de carga.' },
  { value: 'perder_gordura', label: 'Perda de gordura', desc: 'Maior densidade e gasto energético.' },
  { value: 'manter_peso', label: 'Manutenção', desc: 'Equilíbrio entre recuperação e consistência.' },
  { value: 'definicao', label: 'Definição', desc: 'Ajuste fino entre volume e condicionamento.' },
  { value: 'resistencia', label: 'Resistência', desc: 'Mais capacidade cardiorrespiratória e repetição.' },
];

const EQUIPMENT_OPTIONS = [
  'halteres',
  'barra',
  'banco',
  'cabo',
  'polia',
  'leg press',
  'rack',
  'elastico',
  'esteira',
  'cadeira',
] as const;

function Panel({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-[28px] border"
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,27,0.96) 0%, rgba(13,13,15,0.98) 100%)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
      }}
    >
      <div className="flex items-start gap-3 border-b px-4 py-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(var(--theme-accent-rgb), 0.16)', color: 'var(--theme-accent)' }}>
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{title}</h2>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>{description}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EditableField({
  label,
  value,
  type = 'text',
  suffix,
  onSave,
}: {
  label: string;
  value: string | number;
  type?: string;
  suffix?: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(String(value));

  const handleSave = () => {
    onSave(input);
    setEditing(false);
  };

  return (
    <div className="rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>{label}</p>
      {editing ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            autoFocus
            type={type}
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') handleSave();
              if (event.key === 'Escape') setEditing(false);
            }}
            className="h-11 flex-1 rounded-2xl border px-3 text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
          />
          {suffix && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>{suffix}</span>}
          <button onClick={handleSave} className="flex size-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(var(--theme-accent-rgb), 0.18)', color: 'var(--theme-accent)' }}>
            <Check size={16} />
          </button>
        </div>
      ) : (
        <button onClick={() => { setInput(String(value)); setEditing(true); }} className="mt-2 flex w-full items-center justify-between gap-3 text-left">
          <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            {value}{suffix ? ` ${suffix}` : ''}
          </p>
          <Edit3 size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </button>
      )}
    </div>
  );
}

export default function Profile() {
  const { state, updateProfile, getTodaySteps, setTodaySteps } = useApp();
  const { profile, workoutSessions, workouts, weightEntries } = state;
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [stepsInput, setStepsInput] = useState(String(getTodaySteps()));

  const selectedGoal = GOAL_OPTIONS.find(goal => goal.value === profile.goal) ?? GOAL_OPTIONS[0];
  const bmi = useMemo(() => profile.weight / Math.pow(profile.height / 100, 2), [profile.weight, profile.height]);
  const lastWeight = weightEntries.at(-1)?.weight ?? profile.weight;
  const weeklyWeightDelta = weightEntries.length >= 2 ? lastWeight - weightEntries[Math.max(0, weightEntries.length - 2)].weight : 0;

  const handleSaveSteps = () => {
    setTodaySteps(Number(stepsInput) || 0);
    toast.success('Passos de hoje atualizados.');
  };

  const toggleEquipment = (equipment: string) => {
    const exists = profile.availableEquipment.includes(equipment);
    const next = exists
      ? profile.availableEquipment.filter(item => item !== equipment)
      : [...profile.availableEquipment, equipment];
    updateProfile({ availableEquipment: next });
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] pb-28">
      <div className="px-4 pb-8 pt-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[34px] border p-5"
          style={{
            background: 'linear-gradient(160deg, rgba(22,22,24,0.98) 0%, rgba(11,11,13,0.98) 100%)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 28px 80px rgba(0,0,0,0.34)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="size-20 overflow-hidden rounded-[26px] border-2" style={{ borderColor: 'rgba(var(--theme-accent-rgb), 0.35)' }}>
                <img src={AVATAR_IMG} alt="Avatar do usuário" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full" style={{ background: 'var(--theme-accent)', color: '#0d0d0f' }}>
                <Zap size={12} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Perfil FitGym</p>
              <h1 className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{profile.name}</h1>
              <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit' }}>{selectedGoal.label} • {profile.level} • {profile.trainingLocation}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { label: 'Treinos', value: String(workoutSessions.length), icon: <Dumbbell size={14} />, color: 'var(--theme-accent)' },
              { label: 'Peso', value: `${profile.weight}kg`, icon: <Scale size={14} />, color: '#f59e0b' },
              { label: 'Altura', value: `${profile.height}cm`, icon: <Ruler size={14} />, color: '#60a5fa' },
              { label: 'IMC', value: bmi.toFixed(1), icon: <Activity size={14} />, color: '#a855f7' },
            ].map(card => (
              <div key={card.label} className="rounded-[22px] border p-3 text-center" style={{ background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="mx-auto mb-1 flex size-7 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: card.color }}>
                  {card.icon}
                </div>
                <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{card.value}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Outfit' }}>{card.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="mt-4 space-y-4">
          <Panel
            title="Informações pessoais"
            description="Esses dados servem de base para dieta, cálculo de metas e personalização geral do aplicativo."
            icon={<User size={18} />}
          >
            <div className="grid grid-cols-2 gap-3">
              <EditableField label="Nome" value={profile.name} onSave={value => { updateProfile({ name: value }); toast.success('Nome atualizado.'); }} />
              <EditableField label="Idade" value={profile.age} type="number" suffix="anos" onSave={value => { updateProfile({ age: Number(value) || profile.age }); toast.success('Idade atualizada.'); }} />
              <EditableField label="Altura" value={profile.height} type="number" suffix="cm" onSave={value => { updateProfile({ height: Number(value) || profile.height }); toast.success('Altura atualizada.'); }} />
              <EditableField label="Peso" value={profile.weight} type="number" suffix="kg" onSave={value => { updateProfile({ weight: Number(value) || profile.weight }); toast.success('Peso atualizado.'); }} />
            </div>
          </Panel>

          <Panel
            title="Objetivo e metas nutricionais"
            description="O objetivo altera a lógica de treino automático e ajuda a orientar a meta calórica e de macros."
            icon={<Target size={18} />}
          >
            <button
              onClick={() => setShowGoalPicker(current => !current)}
              className="flex w-full items-center justify-between rounded-[24px] border px-4 py-3 text-left"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Objetivo atual</p>
                <p className="mt-1 text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{selectedGoal.label}</p>
                <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>{selectedGoal.desc}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
            </button>

            <AnimatePresence>
              {showGoalPicker && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                  <div className="space-y-2">
                    {GOAL_OPTIONS.map(option => {
                      const active = option.value === profile.goal;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            updateProfile({ goal: option.value });
                            setShowGoalPicker(false);
                            toast.success('Objetivo atualizado.');
                          }}
                          className="w-full rounded-[22px] border p-3 text-left"
                          style={{
                            background: active ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'rgba(255,255,255,0.03)',
                            borderColor: active ? 'rgba(var(--theme-accent-rgb), 0.28)' : 'rgba(255,255,255,0.06)',
                          }}
                        >
                          <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{option.label}</p>
                          <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>{option.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <EditableField label="Calorias" value={profile.calorieGoal} type="number" suffix="kcal" onSave={value => { updateProfile({ calorieGoal: Number(value) || profile.calorieGoal }); toast.success('Meta calórica atualizada.'); }} />
              <EditableField label="Proteína" value={profile.proteinGoal} type="number" suffix="g" onSave={value => { updateProfile({ proteinGoal: Number(value) || profile.proteinGoal }); toast.success('Meta de proteína atualizada.'); }} />
              <EditableField label="Carboidratos" value={profile.carbGoal} type="number" suffix="g" onSave={value => { updateProfile({ carbGoal: Number(value) || profile.carbGoal }); toast.success('Meta de carboidratos atualizada.'); }} />
              <EditableField label="Gorduras" value={profile.fatGoal} type="number" suffix="g" onSave={value => { updateProfile({ fatGoal: Number(value) || profile.fatGoal }); toast.success('Meta de gorduras atualizada.'); }} />
            </div>
          </Panel>

          <Panel
            title="Perfil de treino"
            description="Esses campos são usados diretamente pelo novo sistema automático e pela biblioteca inteligente de exercícios."
            icon={<Dumbbell size={18} />}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Sexo</p>
                <select
                  value={profile.sex}
                  onChange={event => { updateProfile({ sex: event.target.value as typeof profile.sex }); toast.success('Sexo atualizado.'); }}
                  className="mt-2 h-11 w-full rounded-2xl border px-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </label>

              <label className="rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Nível</p>
                <select
                  value={profile.level}
                  onChange={event => { updateProfile({ level: event.target.value as typeof profile.level }); toast.success('Nível atualizado.'); }}
                  className="mt-2 h-11 w-full rounded-2xl border px-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                >
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </label>

              <label className="rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Frequência semanal</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => updateProfile({ trainingFrequency: Math.max(1, profile.trainingFrequency - 1) })} className="flex size-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}>
                    <Minus size={16} />
                  </button>
                  <div className="flex-1 rounded-2xl border px-3 py-3 text-center text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk' }}>
                    {profile.trainingFrequency}x por semana
                  </div>
                  <button onClick={() => updateProfile({ trainingFrequency: Math.min(7, profile.trainingFrequency + 1) })} className="flex size-11 items-center justify-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', color: 'white' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </label>

              <label className="rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Local de treino</p>
                <select
                  value={profile.trainingLocation}
                  onChange={event => { updateProfile({ trainingLocation: event.target.value as typeof profile.trainingLocation }); toast.success('Local de treino atualizado.'); }}
                  className="mt-2 h-11 w-full rounded-2xl border px-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                >
                  <option value="academia">Academia</option>
                  <option value="casa">Casa</option>
                </select>
              </label>
            </div>

            <div className="mt-4 rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: 'var(--theme-accent)' }} />
                <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Equipamentos disponíveis</p>
              </div>
              <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                O sistema usa essa lista para filtrar exercícios viáveis no modo automático e na biblioteca manual.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map(item => {
                  const active = profile.availableEquipment.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleEquipment(item)}
                      className="rounded-full px-3 py-2 text-xs font-semibold"
                      style={{
                        background: active ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'rgba(255,255,255,0.05)',
                        color: active ? 'var(--theme-accent)' : 'rgba(255,255,255,0.65)',
                        fontFamily: 'Outfit',
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Limitações, dores ou observações</p>
              <textarea
                value={profile.limitations}
                onChange={event => updateProfile({ limitations: event.target.value })}
                onBlur={() => toast.success('Limitações atualizadas.')}
                placeholder="Ex.: dor no ombro direito, evitar impacto alto, pouco tempo por sessão."
                className="mt-2 min-h-24 w-full rounded-2xl border px-3 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
              />
            </div>
          </Panel>

          <Panel
            title="Indicadores rápidos"
            description="Resumo de comportamento recente para orientar decisões de treino e recuperação."
            icon={<Calendar size={18} />}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Passos hoje</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={stepsInput}
                    onChange={event => setStepsInput(event.target.value)}
                    inputMode="numeric"
                    className="h-11 flex-1 rounded-2xl border px-3 text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                  />
                  <button onClick={handleSaveSteps} className="rounded-2xl px-4 py-3 text-sm font-bold" style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}>
                    Salvar
                  </button>
                </div>
              </div>

              <div className="rounded-[22px] border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Space Grotesk' }}>Peso recente</p>
                <p className="mt-2 text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{lastWeight.toFixed(1)} kg</p>
                <p className="mt-1 text-xs" style={{ color: weeklyWeightDelta <= 0 ? '#86efac' : '#fca5a5', fontFamily: 'Outfit' }}>
                  {weeklyWeightDelta > 0 ? '+' : ''}{weeklyWeightDelta.toFixed(1)} kg versus registro anterior
                </p>
              </div>
            </div>
          </Panel>

          <Panel
            title="Aparência"
            description="O tema visual continua disponível aqui sem interferir na lógica do sistema de treinos."
            icon={<Zap size={18} />}
          >
            <ThemeSelector />
          </Panel>
        </div>
      </div>
    </div>
  );
}
