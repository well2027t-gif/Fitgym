/**
 * FitPro — Profile Page
 * Design: Premium Dark Fitness
 * Dados pessoais editáveis, metas de macros, calculador de gordura corporal.
 */

import { useState } from 'react';
import { useApp, Goal } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Edit3, Check, X, Scale, Ruler, Calendar,
  Target, Dumbbell, Award, Info, ChevronRight, Zap, Percent
} from 'lucide-react';
import { toast } from 'sonner';
import ThemeSelector from '@/components/ThemeSelector';

const AVATAR_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-avatar-default-XyLKS9rGNvzKQXnsNnmMUd.webp';

const GOAL_OPTIONS: Array<{ value: Goal; label: string; emoji: string; desc: string }> = [
  { value: 'ganhar_massa', label: 'Ganhar Massa', emoji: '💪', desc: 'Hipertrofia muscular' },
  { value: 'perder_gordura', label: 'Perder Gordura', emoji: '🔥', desc: 'Déficit calórico' },
  { value: 'manter_peso', label: 'Manter Peso', emoji: '⚖️', desc: 'Manutenção' },
  { value: 'definicao', label: 'Definição', emoji: '✂️', desc: 'Cutting' },
  { value: 'resistencia', label: 'Resistência', emoji: '🏃', desc: 'Cardio e endurance' },
];

function EditableField({
  label,
  value,
  type = 'text',
  unit,
  onSave,
}: {
  label: string;
  value: string | number;
  type?: string;
  unit?: string;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value.toString());

  const handleSave = () => {
    onSave(input);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex-1">
        <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>{label.toUpperCase()}</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type={type}
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
              className="flex-1 px-3 py-1.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            />
            {unit && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>{unit}</span>}
            <button onClick={handleSave} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)' }}>
              <Check size={13} style={{ color: 'var(--theme-accent)' }} />
            </button>
            <button onClick={() => setEditing(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
            </button>
          </div>
        ) : (
          <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            {value}{unit ? ` ${unit}` : ''}
          </p>
        )}
      </div>
      {!editing && (
        <button onClick={() => { setInput(value.toString()); setEditing(true); }}>
          <Edit3 size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </button>
      )}
    </div>
  );
}

export default function Profile() {
  const { state, updateProfile } = useApp();
  const { profile, workouts, workoutSessions, weightEntries } = state;
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showBodyFatModal, setShowBodyFatModal] = useState(false);
  const [bodyFatGender, setBodyFatGender] = useState<'male' | 'female'>('male');
  const [bodyFatMeasures, setBodyFatMeasures] = useState({ chest: 0, abdomen: 0, triceps: 0, supraIliac: 0 });
  const [bodyFatResult, setBodyFatResult] = useState<number | null>(null);

  const selectedGoal = GOAL_OPTIONS.find(g => g.value === profile.goal);

  // BMI calculation
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  const bmiLabel = bmi < 18.5 ? 'Abaixo do peso' : bmi < 25 ? 'Peso normal' : bmi < 30 ? 'Sobrepeso' : 'Obesidade';
  const bmiColor = bmi < 18.5 ? '#60a5fa' : bmi < 25 ? 'var(--theme-accent)' : bmi < 30 ? '#f59e0b' : '#ef4444';

  // Body Fat Calculation (Pollock Method)
  const calculateBodyFat = () => {
    let bodyFat = 0;
    if (bodyFatGender === 'male') {
      // Men: 3-site (chest, abdomen, triceps)
      const sum = bodyFatMeasures.chest + bodyFatMeasures.abdomen + bodyFatMeasures.triceps;
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(sum) + 0.15456 * Math.log10(profile.weight)) - 450;
    } else {
      // Women: 3-site (triceps, supraIliac, abdomen)
      const sum = bodyFatMeasures.triceps + bodyFatMeasures.supraIliac + bodyFatMeasures.abdomen;
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(sum) + 0.22100 * Math.log10(profile.weight)) - 450;
    }
    return Math.max(0, Math.min(100, bodyFat)); // Clamp between 0-100
  };

  const getBodyFatClassification = (bf: number) => {
    if (bodyFatGender === 'male') {
      if (bf < 6) return { label: 'Essencial', color: '#60a5fa' };
      if (bf < 13) return { label: 'Atlético', color: 'var(--theme-accent)' };
      if (bf < 17) return { label: 'Fitness', color: '#84cc16' };
      if (bf < 25) return { label: 'Aceitável', color: '#f59e0b' };
      return { label: 'Elevado', color: '#ef4444' };
    } else {
      if (bf < 13) return { label: 'Essencial', color: '#60a5fa' };
      if (bf < 20) return { label: 'Atlético', color: 'var(--theme-accent)' };
      if (bf < 24) return { label: 'Fitness', color: '#84cc16' };
      if (bf < 32) return { label: 'Aceitável', color: '#f59e0b' };
      return { label: 'Elevado', color: '#ef4444' };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header / Avatar */}
      <div className="px-5 pt-14 pb-6" style={{ background: 'linear-gradient(to bottom, #161618, #0d0d0f)' }}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden"
              style={{ border: '2px solid rgba(var(--theme-accent-rgb), 0.4)', boxShadow: '0 0 20px rgba(var(--theme-accent-rgb), 0.2)' }}
            >
              <img src={AVATAR_IMG} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'var(--theme-accent)', border: '2px solid #0d0d0f' }}
            >
              <Zap size={10} fill="#0d0d0f" style={{ color: '#0d0d0f' }} />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{profile.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
              {selectedGoal?.emoji} {selectedGoal?.label}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { label: 'Treinos', value: workoutSessions.length.toString(), icon: Dumbbell, color: 'var(--theme-accent)' },
            { label: 'Peso', value: `${profile.weight}kg`, icon: Scale, color: '#f59e0b' },
            { label: 'Altura', value: `${profile.height}cm`, icon: Ruler, color: '#60a5fa' },
            { label: 'IMC', value: bmi.toFixed(1), icon: Target, color: bmiColor },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="fitpro-card p-2.5 text-center">
              <Icon size={14} className="mx-auto mb-1" style={{ color }} />
              <p className="text-xs font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>{value}</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Personal Info */}
        <div className="fitpro-card overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <User size={14} style={{ color: 'var(--theme-accent)' }} />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Informações Pessoais</span>
          </div>
          <EditableField label="Nome" value={profile.name} onSave={v => { updateProfile({ name: v }); toast.success('Nome atualizado!'); }} />
          <EditableField label="Idade" value={profile.age} type="number" unit="anos" onSave={v => { updateProfile({ age: Number(v) }); toast.success('Atualizado!'); }} />
          <EditableField label="Altura" value={profile.height} type="number" unit="cm" onSave={v => { updateProfile({ height: Number(v) }); toast.success('Atualizado!'); }} />
          <EditableField label="Peso" value={profile.weight} type="number" unit="kg" onSave={v => { updateProfile({ weight: Number(v) }); toast.success('Atualizado!'); }} />
        </div>

        {/* Goal */}
        <div className="fitpro-card overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Target size={14} style={{ color: 'var(--theme-accent)' }} />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Objetivo</span>
          </div>
          <button
            onClick={() => setShowGoalPicker(true)}
            className="w-full flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>OBJETIVO ATUAL</p>
              <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {selectedGoal?.emoji} {selectedGoal?.label}
              </p>
            </div>
            <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </button>
        </div>

        {/* Nutrition Goals */}
        <div className="fitpro-card overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Zap size={14} style={{ color: 'var(--theme-accent)' }} />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Metas Nutricionais</span>
          </div>
          <EditableField label="Meta Calórica" value={profile.calorieGoal} type="number" unit="kcal" onSave={v => { updateProfile({ calorieGoal: Number(v) }); toast.success('Meta atualizada!'); }} />
          <EditableField label="Meta de Proteína" value={profile.proteinGoal} type="number" unit="g" onSave={v => { updateProfile({ proteinGoal: Number(v) }); toast.success('Meta atualizada!'); }} />
          <EditableField label="Meta de Carboidratos" value={profile.carbGoal} type="number" unit="g" onSave={v => { updateProfile({ carbGoal: Number(v) }); toast.success('Meta atualizada!'); }} />
          <EditableField label="Meta de Gorduras" value={profile.fatGoal} type="number" unit="g" onSave={v => { updateProfile({ fatGoal: Number(v) }); toast.success('Meta atualizada!'); }} />
        </div>

        {/* Body Fat Calculator */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowBodyFatModal(true)}
          className="fitpro-card p-4 w-full text-left"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)', border: '1px solid rgba(168,85,247,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Percent size={14} style={{ color: '#a855f7' }} />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Calculadora de Gordura Corporal</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Clique para calcular sua % de gordura corporal usando o método de Pollock</p>
        </motion.button>

        {/* IMC Card */}
        <div className="fitpro-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} style={{ color: '#60a5fa' }} />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Índice de Massa Corporal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold" style={{ color: bmiColor, fontFamily: 'Space Grotesk' }}>{bmi.toFixed(1)}</p>
              <p className="text-xs mt-0.5" style={{ color: bmiColor, fontFamily: 'Outfit' }}>{bmiLabel}</p>
            </div>
            <div className="flex-1">
              <div className="space-y-1.5">
                {[
                  { label: 'Abaixo do peso', range: '< 18.5', color: '#60a5fa', active: bmi < 18.5 },
                  { label: 'Normal', range: '18.5 – 24.9', color: 'var(--theme-accent)', active: bmi >= 18.5 && bmi < 25 },
                  { label: 'Sobrepeso', range: '25 – 29.9', color: '#f59e0b', active: bmi >= 25 && bmi < 30 },
                  { label: 'Obesidade', range: '≥ 30', color: '#ef4444', active: bmi >= 30 },
                ].map(({ label, range, color, active }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: active ? color : 'rgba(255,255,255,0.1)' }} />
                    <span className="text-xs flex-1" style={{ color: active ? color : 'rgba(255,255,255,0.3)', fontFamily: 'Outfit', fontWeight: active ? 600 : 400 }}>{label}</span>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit' }}>{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>



        {/* Tema */}
        <ThemeSelector />

        {/* App Info */}
        <div className="fitpro-card p-4 text-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}>
            <Dumbbell size={20} style={{ color: 'var(--theme-accent)' }} />
          </div>
          <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>FitPro</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Academia & Dieta • v1.0</p>
          <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Outfit' }}>Todos os dados salvos localmente no seu dispositivo</p>
        </div>
      </div>

      {/* Body Fat Modal */}
      <AnimatePresence>
        {showBodyFatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowBodyFatModal(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl overflow-y-auto flex flex-col"
              style={{ background: '#161618', maxHeight: '90vh' }}
            >
              <div className="flex-1 overflow-y-auto">
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                </div>
                <div className="px-5 pb-8 pt-0">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Gordura Corporal</h2>
                    <button onClick={() => { setShowBodyFatModal(false); setBodyFatResult(null); }}><X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
                  </div>

                  {bodyFatResult === null ? (
                    <>
                      {/* Gender Selection */}
                      <div className="mb-5">
                        <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>SEXO</label>
                        <div className="flex gap-2">
                          {[
                            { value: 'male' as const, label: 'Homem' },
                            { value: 'female' as const, label: 'Mulher' },
                          ].map(opt => (
                            <motion.button
                              key={opt.value}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setBodyFatGender(opt.value)}
                              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                              style={{
                                background: bodyFatGender === opt.value ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
                                border: bodyFatGender === opt.value ? '1.5px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                color: bodyFatGender === opt.value ? '#a855f7' : 'rgba(255,255,255,0.4)',
                                fontFamily: 'Space Grotesk',
                              }}
                            >
                              {opt.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Measurements */}
                      <div className="mb-5">
                        <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>MEDIDAS (em cm)</label>
                        <div className="space-y-2">
                          {bodyFatGender === 'male' ? (
                            <>
                              <div>
                                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Peito</label>
                                <input
                                  type="number"
                                  value={bodyFatMeasures.chest || ''}
                                  onChange={e => setBodyFatMeasures({ ...bodyFatMeasures, chest: Number(e.target.value) })}
                                  placeholder="0"
                                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                                />
                              </div>
                              <div>
                                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Abdômen</label>
                                <input
                                  type="number"
                                  value={bodyFatMeasures.abdomen || ''}
                                  onChange={e => setBodyFatMeasures({ ...bodyFatMeasures, abdomen: Number(e.target.value) })}
                                  placeholder="0"
                                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                                />
                              </div>
                              <div>
                                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Tríceps</label>
                                <input
                                  type="number"
                                  value={bodyFatMeasures.triceps || ''}
                                  onChange={e => setBodyFatMeasures({ ...bodyFatMeasures, triceps: Number(e.target.value) })}
                                  placeholder="0"
                                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Tríceps</label>
                                <input
                                  type="number"
                                  value={bodyFatMeasures.triceps || ''}
                                  onChange={e => setBodyFatMeasures({ ...bodyFatMeasures, triceps: Number(e.target.value) })}
                                  placeholder="0"
                                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                                />
                              </div>
                              <div>
                                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Supra-ilíaca</label>
                                <input
                                  type="number"
                                  value={bodyFatMeasures.supraIliac || ''}
                                  onChange={e => setBodyFatMeasures({ ...bodyFatMeasures, supraIliac: Number(e.target.value) })}
                                  placeholder="0"
                                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                                />
                              </div>
                              <div>
                                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Abdômen</label>
                                <input
                                  type="number"
                                  value={bodyFatMeasures.abdomen || ''}
                                  onChange={e => setBodyFatMeasures({ ...bodyFatMeasures, abdomen: Number(e.target.value) })}
                                  placeholder="0"
                                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none"
                                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setBodyFatResult(calculateBodyFat())}
                        className="w-full py-3.5 rounded-xl text-sm font-bold"
                        style={{ background: '#a855f7', color: 'white', fontFamily: 'Space Grotesk' }}
                      >
                        Calcular Gordura Corporal
                      </motion.button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <div className="mb-4">
                        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>SUA GORDURA CORPORAL</p>
                        <p className="text-5xl font-bold" style={{ color: '#a855f7', fontFamily: 'Space Grotesk' }}>{bodyFatResult.toFixed(1)}%</p>
                      </div>

                      {(() => {
                        const classification = getBodyFatClassification(bodyFatResult);
                        return (
                          <div className="p-4 rounded-xl mb-4" style={{ background: `${classification.color}15`, border: `1.5px solid ${classification.color}40` }}>
                            <p className="text-sm font-semibold" style={{ color: classification.color, fontFamily: 'Space Grotesk' }}>{classification.label}</p>
                            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                              {bodyFatGender === 'male' ? 'Referência para homens' : 'Referência para mulheres'}
                            </p>
                          </div>
                        );
                      })()}

                      <div className="space-y-2 mb-4">
                        <div className="text-left p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs font-semibold text-white mb-1" style={{ fontFamily: 'Outfit' }}>Peso de Gordura</p>
                          <p className="text-sm" style={{ color: '#a855f7', fontFamily: 'Space Grotesk' }}>{(profile.weight * bodyFatResult / 100).toFixed(1)} kg</p>
                        </div>
                        <div className="text-left p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs font-semibold text-white mb-1" style={{ fontFamily: 'Outfit' }}>Massa Magra</p>
                          <p className="text-sm" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>{(profile.weight * (1 - bodyFatResult / 100)).toFixed(1)} kg</p>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setBodyFatResult(null)}
                        className="w-full py-3 rounded-xl text-sm font-bold"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Space Grotesk' }}
                      >
                        Recalcular
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Picker Modal */}
      <AnimatePresence>
        {showGoalPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowGoalPicker(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl p-6"
              style={{ background: '#161618' }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Seu Objetivo</h2>
                <button onClick={() => setShowGoalPicker(false)}><X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
              </div>
              <div className="space-y-2">
                {GOAL_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      updateProfile({ goal: opt.value });
                      toast.success(`Objetivo: ${opt.label}`);
                      setShowGoalPicker(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left"
                    style={{
                      background: profile.goal === opt.value ? 'rgba(var(--theme-accent-rgb), 0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${profile.goal === opt.value ? 'rgba(var(--theme-accent-rgb), 0.25)' : 'transparent'}`,
                    }}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>{opt.desc}</p>
                    </div>
                    {profile.goal === opt.value && (
                      <Check size={16} style={{ color: 'var(--theme-accent)' }} />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
