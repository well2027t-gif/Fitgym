/**
 * FitPro — Hydration Page
 * Design: Premium Dark Fitness
 * Página dedicada de hidratação com registro, configuração e histórico.
 */
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Settings, X, Check, Plus, Minus, ChevronLeft, TrendingUp, Calendar
} from 'lucide-react';
import { useLocation } from '@/lib/router';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine
} from 'recharts';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' as const },
  }),
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export default function Hydration() {
  const { state, getTodayWaterCups, setTodayWaterCups, getWaterHistory, updatePreferences } = useApp();
  const [, navigate] = useLocation();

  const cupSizeMl = state.preferences.cupSizeMl || 250;
  const waterGoalLiters = state.preferences.waterGoalLiters || 2.5;
  const waterCups = getTodayWaterCups();
  const WATER_GOAL = Math.max(1, Math.round((waterGoalLiters * 1000) / cupSizeMl));
  const waterLitersConsumed = parseFloat(((waterCups * cupSizeMl) / 1000).toFixed(2));
  const waterPct = Math.min((waterCups / WATER_GOAL) * 100, 100);

  // Histórico dos últimos 7 dias
  const history = getWaterHistory(7);
  const chartData = history.map(h => ({
    day: formatDate(h.date),
    litros: h.liters,
    meta: waterGoalLiters,
    copos: h.cups,
  }));

  // Modal de configuração
  const [showConfig, setShowConfig] = useState(false);
  const [configGoalLiters, setConfigGoalLiters] = useState(waterGoalLiters);
  const [configCupSizeMl, setConfigCupSizeMl] = useState(cupSizeMl);

  const handleSaveConfig = () => {
    updatePreferences({ waterGoalLiters: configGoalLiters, cupSizeMl: configCupSizeMl });
    setShowConfig(false);
    toast.success('Configurações de hidratação salvas!');
  };

  // Opções de quanto beber de uma vez
  const drinkOptions = [
    { label: `+${cupSizeMl}ml`, cups: 1, ml: cupSizeMl },
    { label: `+${cupSizeMl * 2}ml`, cups: 2, ml: cupSizeMl * 2 },
    { label: '+500ml', cups: Math.round(500 / cupSizeMl), ml: 500 },
    { label: '+1L', cups: Math.round(1000 / cupSizeMl), ml: 1000 },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-12 pb-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(to bottom, #0d0d0f 70%, transparent)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Hidratação</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
              Meta: {waterGoalLiters}L • Copo: {cupSizeMl}ml
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setConfigGoalLiters(waterGoalLiters); setConfigCupSizeMl(cupSizeMl); setShowConfig(true); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}
        >
          <Settings size={16} style={{ color: '#38bdf8' }} />
        </motion.button>
      </div>

      <div className="px-4 space-y-4">
        {/* Card principal de progresso */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="fitpro-card p-5"
          style={{ boxShadow: '0 0 30px rgba(56,189,248,0.12), 0 4px 20px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>HOJE</p>
              <p className="text-3xl font-bold" style={{ color: '#38bdf8', fontFamily: 'Space Grotesk' }}>
                {waterLitersConsumed}L
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                de {waterGoalLiters}L • {waterCups} de {WATER_GOAL} copos
              </p>
            </div>
            <div className="relative w-20 h-20">
              <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <motion.circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - waterPct / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(56,189,248,0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: '#38bdf8', fontFamily: 'Space Grotesk' }}>
                  {Math.round(waterPct)}%
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-2.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${waterPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          {/* Copos interativos */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {Array.from({ length: Math.min(WATER_GOAL, 16) }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setTodayWaterCups(i < waterCups ? i : i + 1)}
                className="flex-1 min-w-[28px] h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: i < waterCups ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.04)',
                  border: i < waterCups ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.06)',
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.88 }}
              >
                <Droplets size={14} style={{ color: i < waterCups ? '#38bdf8' : 'rgba(255,255,255,0.2)' }} />
              </motion.button>
            ))}
          </div>

          {waterCups >= WATER_GOAL ? (
            <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <p className="text-sm font-semibold" style={{ color: '#38bdf8', fontFamily: 'Space Grotesk' }}>
                🎉 Meta atingida! Ótimo trabalho!
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
              Faltam {WATER_GOAL - waterCups} copos ({parseFloat(((WATER_GOAL - waterCups) * cupSizeMl / 1000).toFixed(2))}L) para atingir a meta
            </p>
          )}
        </motion.div>

        {/* Opções rápidas de registro */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="fitpro-card p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit', letterSpacing: '0.1em' }}>ADICIONAR RAPIDAMENTE</p>
          <div className="grid grid-cols-4 gap-2">
            {drinkOptions.map((opt, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  const newCups = waterCups + opt.cups;
                  setTodayWaterCups(newCups);
                  toast.success(`${opt.label} adicionados!`, { duration: 1500 });
                }}
                className="rounded-xl py-3 flex flex-col items-center gap-1"
                style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}
              >
                <Droplets size={18} style={{ color: '#38bdf8' }} />
                <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Space Grotesk' }}>
                  {opt.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Ajuste manual */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Ajuste manual de copos</span>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setTodayWaterCups(Math.max(0, waterCups - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <Minus size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </motion.button>
              <span className="text-sm font-bold w-8 text-center text-white" style={{ fontFamily: 'Space Grotesk' }}>{waterCups}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setTodayWaterCups(waterCups + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(56,189,248,0.15)' }}
              >
                <Plus size={14} style={{ color: '#38bdf8' }} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Histórico dos últimos 7 dias */}
        {chartData.length > 0 && (
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="fitpro-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.15)' }}>
                <TrendingUp size={14} style={{ color: '#38bdf8' }} />
              </div>
              <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Histórico (7 dias)</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barSize={22}>
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'Outfit' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'Outfit' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, Math.max(waterGoalLiters * 1.3, 3)]}
                />
                <Tooltip
                  contentStyle={{ background: '#1c1c20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontFamily: 'Outfit', fontSize: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  itemStyle={{ color: '#38bdf8' }}
                  formatter={(value: number) => [`${value}L`, 'Consumido']}
                />
                <ReferenceLine y={waterGoalLiters} stroke="rgba(56,189,248,0.4)" strokeDasharray="4 4" />
                <Bar dataKey="litros" fill="#38bdf8" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-center mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit' }}>
              Linha tracejada = meta de {waterGoalLiters}L
            </p>
          </motion.div>
        )}

        {/* Dicas de hidratação */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="fitpro-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56,189,248,0.15)' }}>
              <Calendar size={14} style={{ color: '#38bdf8' }} />
            </div>
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Dicas de Hidratação</span>
          </div>
          <div className="space-y-2">
            {[
              { tip: 'Beba 1 copo ao acordar para ativar o metabolismo.', icon: '🌅' },
              { tip: 'Beba antes das refeições para auxiliar a digestão.', icon: '🍽️' },
              { tip: 'Durante o treino, beba 150-250ml a cada 15-20 min.', icon: '🏋️' },
              { tip: 'Urina amarela escura = sinal de desidratação.', icon: '⚠️' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit' }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal de Configuração */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowConfig(false); }}
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
                  <button onClick={() => setShowConfig(false)}>
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
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfigGoalLiters(v => Math.max(0.5, parseFloat((v - 0.25).toFixed(2))))}
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <Minus size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfigGoalLiters(v => parseFloat((v + 0.25).toFixed(2)))}
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(56,189,248,0.2)' }}
                        >
                          <Plus size={16} style={{ color: '#38bdf8' }} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[1.5, 2.0, 2.5, 3.0, 3.5].map(v => (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfigGoalLiters(v)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                          style={{
                            background: configGoalLiters === v ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)',
                            color: configGoalLiters === v ? '#38bdf8' : 'rgba(255,255,255,0.5)',
                            border: configGoalLiters === v ? '1px solid rgba(56,189,248,0.4)' : '1px solid transparent',
                            fontFamily: 'Space Grotesk',
                          }}
                        >
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
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfigCupSizeMl(v => Math.max(100, v - 50))}
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <Minus size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfigCupSizeMl(v => Math.min(1000, v + 50))}
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(var(--theme-accent-rgb), 0.18)' }}
                        >
                          <Plus size={16} style={{ color: 'var(--theme-accent)' }} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[150, 200, 250, 300, 500].map(v => (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfigCupSizeMl(v)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                          style={{
                            background: configCupSizeMl === v ? 'rgba(var(--theme-accent-rgb), 0.2)' : 'rgba(255,255,255,0.06)',
                            color: configCupSizeMl === v ? 'var(--theme-accent)' : 'rgba(255,255,255,0.5)',
                            border: configCupSizeMl === v ? '1px solid rgba(var(--theme-accent-rgb), 0.4)' : '1px solid transparent',
                            fontFamily: 'Space Grotesk',
                          }}
                        >
                          {v}ml
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resumo */}
                <div className="rounded-2xl p-3 mb-4" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)' }}>
                  <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                    Você precisará beber{' '}
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {Math.round((configGoalLiters * 1000) / configCupSizeMl)} copos de {configCupSizeMl}ml
                    </span>{' '}
                    por dia para atingir sua meta de{' '}
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{configGoalLiters.toFixed(1)}L</span>.
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveConfig}
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
