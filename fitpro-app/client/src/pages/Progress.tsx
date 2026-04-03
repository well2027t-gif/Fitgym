/**
 * FitPro — Progress Page
 * Design: Premium Dark Fitness
 * Gráfico de peso, registro manual, fotos de evolução, medidas corporais.
 */

import { useState, useRef } from 'react';
import { useApp, BodyMeasurement } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Plus, Trash2, X, Camera, Scale,
  Ruler, ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  Tooltip, CartesianGrid
} from 'recharts';
import { toast } from 'sonner';

export default function Progress() {
  const { state, addWeightEntry, deleteWeightEntry, addMeasurement, addProgressPhoto, deleteProgressPhoto } = useApp();
  const { weightEntries, measurements, progressPhotos, profile } = state;

  const [showAddWeight, setShowAddWeight] = useState(false);
  const [weightInput, setWeightInput] = useState(profile.weight.toString());
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightNotes, setWeightNotes] = useState('');

  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measureForm, setMeasureForm] = useState<Omit<BodyMeasurement, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    chest: undefined, waist: undefined, hips: undefined,
    thigh: undefined, arm: undefined, calf: undefined,
  });

  const [activeTab, setActiveTab] = useState<'weight' | 'photos' | 'measures'>('weight');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chart data
  const chartData = weightEntries.slice(-30).map(e => ({
    date: new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    peso: e.weight,
  }));

  const latestWeight = weightEntries[weightEntries.length - 1]?.weight ?? profile.weight;
  const firstWeight = weightEntries[0]?.weight ?? profile.weight;
  const weightDiff = latestWeight - firstWeight;
  const minWeight = Math.min(...weightEntries.map(e => e.weight), profile.weight) - 1;
  const maxWeight = Math.max(...weightEntries.map(e => e.weight), profile.weight) + 1;

  const saveWeight = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 20 || val > 500) { toast.error('Peso inválido'); return; }
    addWeightEntry({ date: weightDate, weight: val, notes: weightNotes });
    toast.success('Peso registrado!');
    setShowAddWeight(false);
    setWeightInput(profile.weight.toString());
    setWeightNotes('');
  };

  const saveMeasurement = () => {
    addMeasurement(measureForm);
    toast.success('Medidas salvas!');
    setShowMeasurements(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      addProgressPhoto({
        date: new Date().toISOString().split('T')[0],
        dataUrl,
        notes: '',
      });
      toast.success('Foto adicionada!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-4" style={{ background: 'rgba(13,13,15,0.98)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>ACOMPANHAMENTO</p>
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Progresso</h1>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>{latestWeight} kg</p>
            <p className="text-xs" style={{ color: weightDiff <= 0 ? 'var(--theme-accent)' : '#ef4444', fontFamily: 'Outfit' }}>
              {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg total
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {[
            { key: 'weight', label: 'Peso', icon: Scale },
            { key: 'photos', label: 'Fotos', icon: Camera },
            { key: 'measures', label: 'Medidas', icon: Ruler },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === key ? 'var(--theme-accent)' : 'transparent',
                color: activeTab === key ? '#0d0d0f' : 'rgba(255,255,255,0.4)',
                fontFamily: 'Outfit',
              }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        {/* Weight Tab */}
        {activeTab === 'weight' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Atual', value: `${latestWeight}`, unit: 'kg', color: 'var(--theme-accent)' },
                { label: 'Objetivo', value: `${profile.weight}`, unit: 'kg', color: '#f59e0b' },
                { label: 'Registros', value: `${weightEntries.length}`, unit: 'dias', color: '#60a5fa' },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="fitpro-card p-3 text-center">
                  <p className="text-lg font-bold" style={{ color, fontFamily: 'Space Grotesk' }}>{value}</p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>{unit}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="fitpro-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Evolução do Peso</h3>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowAddWeight(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', color: 'var(--theme-accent)', fontFamily: 'Outfit' }}
                >
                  <Plus size={12} /> Registrar
                </motion.button>
              </div>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--theme-accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--theme-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[minWeight, maxWeight]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1c1c20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontFamily: 'Outfit', fontSize: 11 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                      itemStyle={{ color: 'var(--theme-accent)' }}
                      formatter={(v: number) => [`${v} kg`, 'Peso']}
                    />
                    <Area type="monotone" dataKey="peso" stroke="var(--theme-accent)" strokeWidth={2.5} fill="url(#weightGrad2)" dot={{ fill: 'var(--theme-accent)', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: 'var(--theme-accent)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="py-8 text-center">
                  <TrendingUp size={32} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.1)' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Registre pelo menos 2 pesos para ver o gráfico</p>
                </div>
              )}
            </div>

            {/* Weight history */}
            <div className="fitpro-card overflow-hidden">
              <div className="p-4 pb-2">
                <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Histórico</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {[...weightEntries].reverse().slice(0, 10).map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>{entry.weight} kg</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <button onClick={() => { deleteWeightEntry(entry.id); toast.success('Registro removido'); }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                      <Trash2 size={11} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                ))}
                {weightEntries.length === 0 && (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit' }}>Nenhum registro ainda</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>{progressPhotos.length} fotos</p>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold btn-glow"
                style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
              >
                <Camera size={14} /> Adicionar Foto
              </motion.button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            {progressPhotos.length === 0 ? (
              <div className="fitpro-card p-10 text-center">
                <ImageIcon size={40} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p className="text-sm font-medium text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>Nenhuma foto ainda</p>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Adicione fotos para acompanhar sua evolução visual</p>
                <button onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>
                  + Adicionar primeira foto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[...progressPhotos].reverse().map(photo => (
                  <div key={photo.id} className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
                    <img src={photo.dataUrl} alt="progresso" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-xs text-white" style={{ fontFamily: 'Outfit' }}>
                        {new Date(photo.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <button
                      onClick={() => { deleteProgressPhoto(photo.id); toast.success('Foto removida'); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.6)' }}
                    >
                      <Trash2 size={12} style={{ color: 'white' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Measures Tab */}
        {activeTab === 'measures' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowMeasurements(true)}
              className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 btn-glow"
              style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
            >
              <Plus size={16} /> Registrar Medidas
            </motion.button>

            {measurements.length === 0 ? (
              <div className="fitpro-card p-10 text-center">
                <Ruler size={40} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.1)' }} />
                <p className="text-sm font-medium text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>Nenhuma medida registrada</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Registre suas medidas corporais para acompanhar mudanças</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...measurements].reverse().map(m => (
                  <div key={m.id} className="fitpro-card p-4">
                    <p className="text-xs font-medium mb-3" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                      {new Date(m.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Peito', value: m.chest },
                        { label: 'Cintura', value: m.waist },
                        { label: 'Quadril', value: m.hips },
                        { label: 'Coxa', value: m.thigh },
                        { label: 'Braço', value: m.arm },
                        { label: 'Panturrilha', value: m.calf },
                      ].filter(x => x.value).map(({ label, value }) => (
                        <div key={label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{value}cm</p>
                          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add Weight Modal */}
      <AnimatePresence>
        {showAddWeight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddWeight(false); }}
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
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Registrar Peso</h2>
                <button onClick={() => setShowAddWeight(false)}><X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>PESO (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weightInput}
                    onChange={e => setWeightInput(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl text-3xl font-bold text-white text-center outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>DATA</label>
                  <input
                    type="date"
                    value={weightDate}
                    onChange={e => setWeightDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit', colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>NOTAS (opcional)</label>
                  <input
                    value={weightNotes}
                    onChange={e => setWeightNotes(e.target.value)}
                    placeholder="Ex: Após acordar, em jejum..."
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={saveWeight}
                  className="w-full py-3.5 rounded-xl text-sm font-bold btn-glow"
                  style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  Salvar Peso
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Measurements Modal */}
      <AnimatePresence>
        {showMeasurements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowMeasurements(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl p-6 overflow-y-auto"
              style={{ background: '#161618', maxHeight: '85vh' }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Medidas Corporais</h2>
                <button onClick={() => setShowMeasurements(false)}><X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Peito (cm)', field: 'chest' as const },
                  { label: 'Cintura (cm)', field: 'waist' as const },
                  { label: 'Quadril (cm)', field: 'hips' as const },
                  { label: 'Coxa (cm)', field: 'thigh' as const },
                  { label: 'Braço (cm)', field: 'arm' as const },
                  { label: 'Panturrilha (cm)', field: 'calf' as const },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>{label.toUpperCase()}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={measureForm[field] ?? ''}
                      onChange={e => setMeasureForm(f => ({ ...f, [field]: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="—"
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white text-center outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk' }}
                    />
                  </div>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={saveMeasurement}
                className="w-full py-3.5 rounded-xl text-sm font-bold btn-glow"
                style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
              >
                Salvar Medidas
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
