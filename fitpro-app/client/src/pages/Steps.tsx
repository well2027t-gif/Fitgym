/**
 * FitPro — Steps Page
 * Design: Premium Dark Fitness
 * Rastreamento de passos via acelerômetro nativo do celular.
 */
import { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ChevronLeft, Play, Square, RotateCcw,
  Settings, X, Check, Plus, Minus, Zap, TrendingUp, Info
} from 'lucide-react';
import { useLocation } from '@/lib/router';
import { toast } from 'sonner';
import { useStepCounter } from '@/hooks/useStepCounter';
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
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
}

export default function Steps() {
  const { state, getTodaySteps, setTodaySteps, incrementTodaySteps, updatePreferences } = useApp();
  const [, navigate] = useLocation();

  const todaySteps = getTodaySteps();
  const stepGoal = state.preferences.dailyStepGoal;
  const stepPct = Math.min((todaySteps / stepGoal) * 100, 100);

  // Histórico dos últimos 7 dias
  const today = new Date().toISOString().split('T')[0];
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toISOString().split('T')[0];
  });
  const chartData = last7Days.map(date => {
    const entry = state.stepEntries.find(e => e.date === date);
    return {
      day: formatDate(date),
      passos: entry?.steps ?? 0,
      meta: stepGoal,
      isToday: date === today,
    };
  });

  // Sensor de passos via acelerômetro
  const handleNewStep = useCallback((sessionSteps: number) => {
    // Sincroniza com o AppContext a cada 10 passos
    if (sessionSteps % 10 === 0) {
      incrementTodaySteps(10);
    }
  }, [incrementTodaySteps]);

  const { isTracking, sessionSteps, permissionGranted, error, startTracking, stopTracking, resetSession } = useStepCounter(handleNewStep);

  const handleStop = useCallback(() => {
    const remainder = sessionSteps % 10;
    if (remainder > 0) {
      incrementTodaySteps(remainder);
    }
    stopTracking();
    toast.success(`Sessão encerrada: +${sessionSteps} passos registrados!`);
  }, [sessionSteps, incrementTodaySteps, stopTracking]);

  const handleStart = useCallback(async () => {
    resetSession();
    await startTracking();
  }, [startTracking, resetSession]);

  // Modal de configuração
  const [showConfig, setShowConfig] = useState(false);
  const [configGoal, setConfigGoal] = useState(stepGoal);

  // Ajuste manual
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState(String(todaySteps));

  // Calorias estimadas (0.04 kcal por passo em média)
  const estimatedCalories = Math.round(todaySteps * 0.04);
  // Distância estimada (0.75m por passo em média)
  const estimatedKm = parseFloat((todaySteps * 0.00075).toFixed(2));

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
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Passos</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
              Meta: {stepGoal.toLocaleString('pt-BR')} passos/dia
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setConfigGoal(stepGoal); setShowConfig(true); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <Settings size={16} style={{ color: '#60a5fa' }} />
        </motion.button>
      </div>

      <div className="px-4 space-y-4">
        {/* Card principal */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="fitpro-card p-5"
          style={{ boxShadow: '0 0 30px rgba(96,165,250,0.12), 0 4px 20px rgba(0,0,0,0.4)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>HOJE</p>
              <p className="text-4xl font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>
                {todaySteps.toLocaleString('pt-BR')}
              </p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                de {stepGoal.toLocaleString('pt-BR')} passos
              </p>
            </div>
            <div className="relative w-20 h-20">
              <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <motion.circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - stepPct / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: '#60a5fa', fontFamily: 'Space Grotesk' }}>
                  {Math.round(stepPct)}%
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="w-full h-2.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #60a5fa 0%, var(--theme-accent) 100%)' }}
              initial={{ width: 0 }}
              animate={{ width: `${stepPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Calorias', value: `${estimatedCalories}`, unit: 'kcal', color: '#f59e0b' },
              { label: 'Distância', value: `${estimatedKm}`, unit: 'km', color: '#60a5fa' },
              { label: 'Faltam', value: `${Math.max(0, stepGoal - todaySteps).toLocaleString('pt-BR')}`, unit: 'passos', color: 'var(--theme-accent)' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <p className="text-base font-bold" style={{ color, fontFamily: 'Space Grotesk' }}>{value}</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>{unit}</p>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sensor de passos */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="fitpro-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: isTracking ? 'rgba(34,197,94,0.15)' : 'rgba(96,165,250,0.15)' }}>
              <Zap size={14} style={{ color: isTracking ? '#22c55e' : '#60a5fa' }} />
            </div>
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              Sensor de Movimento
            </span>
            {isTracking && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                Ativo
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-xl p-3 mb-3 flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Info size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
              <p className="text-xs leading-relaxed" style={{ color: '#ef4444', fontFamily: 'Outfit' }}>{error}</p>
            </div>
          )}

          {isTracking && (
            <div className="rounded-xl p-3 mb-3 text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-2xl font-bold" style={{ color: '#22c55e', fontFamily: 'Space Grotesk' }}>
                +{sessionSteps}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>passos nesta sessão</p>
            </div>
          )}

          <div className="flex gap-2">
            {!isTracking ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #60a5fa, var(--theme-accent))', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
              >
                <Play size={16} />
                Iniciar Rastreamento
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontFamily: 'Space Grotesk' }}
              >
                <Square size={16} />
                Parar e Salvar
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { setManualInput(String(todaySteps)); setShowManual(true); }}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <RotateCcw size={16} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </motion.button>
          </div>

          <p className="text-[11px] mt-3 text-center" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
            {permissionGranted === false
              ? 'Permissão negada. Ative o sensor de movimento nas configurações do dispositivo.'
              : 'O sensor usa o acelerômetro do celular para detectar passos automaticamente.'}
          </p>
        </motion.div>

        {/* Histórico dos últimos 7 dias */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="fitpro-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
              <TrendingUp size={14} style={{ color: '#60a5fa' }} />
            </div>
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Histórico (7 dias)</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} barSize={26}>
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
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                contentStyle={{ background: '#1c1c20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontFamily: 'Outfit', fontSize: 12 }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                itemStyle={{ color: '#60a5fa' }}
                formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Passos']}
              />
              <ReferenceLine y={stepGoal} stroke="rgba(96,165,250,0.4)" strokeDasharray="4 4" />
              <Bar dataKey="passos" radius={[4, 4, 0, 0]} fill="#60a5fa" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-center mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit' }}>
            Linha tracejada = meta de {stepGoal.toLocaleString('pt-BR')} passos
          </p>
        </motion.div>

        {/* Dicas */}
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible" className="fitpro-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
              <Info size={14} style={{ color: '#60a5fa' }} />
            </div>
            <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>Como funciona</span>
          </div>
          <div className="space-y-2">
            {[
              { tip: 'Segure o celular na mão ou coloque no bolso ao caminhar.', icon: '📱' },
              { tip: 'O sensor usa o acelerômetro para detectar o movimento dos passos.', icon: '⚡' },
              { tip: 'Toque em "Iniciar" antes de começar a caminhar ou correr.', icon: '▶️' },
              { tip: 'Toque em "Parar e Salvar" para registrar os passos da sessão.', icon: '💾' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 py-2 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit' }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal de configuração da meta */}
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
              className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
              style={{ background: '#161618' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div className="px-5 pb-8 pt-2">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
                      <Activity size={16} style={{ color: '#60a5fa' }} />
                    </div>
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Meta de Passos</h2>
                  </div>
                  <button onClick={() => setShowConfig(false)}>
                    <X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </button>
                </div>

                <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: '#60a5fa', fontFamily: 'Space Grotesk' }}>
                        {configGoal.toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>passos por dia</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfigGoal(v => Math.max(1000, v - 1000))}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                      >
                        <Minus size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfigGoal(v => v + 1000)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(96,165,250,0.2)' }}
                      >
                        <Plus size={16} style={{ color: '#60a5fa' }} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[5000, 7500, 8000, 10000, 12000, 15000].map(v => (
                      <motion.button
                        key={v}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfigGoal(v)}
                        className="flex-1 min-w-[60px] py-1.5 rounded-lg text-xs font-semibold"
                        style={{
                          background: configGoal === v ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.06)',
                          color: configGoal === v ? '#60a5fa' : 'rgba(255,255,255,0.5)',
                          border: configGoal === v ? '1px solid rgba(96,165,250,0.4)' : '1px solid transparent',
                          fontFamily: 'Space Grotesk',
                        }}
                      >
                        {(v / 1000).toFixed(0)}k
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    updatePreferences({ dailyStepGoal: configGoal, stepTrackingEnabled: true });
                    setShowConfig(false);
                    toast.success('Meta de passos atualizada!');
                  }}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #60a5fa, var(--theme-accent))', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <Check size={16} />
                  Salvar Meta
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de ajuste manual */}
      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowManual(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
              style={{ background: '#161618' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div className="px-5 pb-8 pt-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Ajuste Manual</h2>
                  <button onClick={() => setShowManual(false)}>
                    <X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 mb-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setManualInput(String(Math.max(0, parseInt(manualInput || '0') - 500)))}
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <Minus size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </motion.button>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    className="flex-1 text-center text-2xl font-bold text-white outline-none py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk' }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setManualInput(String(parseInt(manualInput || '0') + 500))}
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(96,165,250,0.15)' }}
                  >
                    <Plus size={18} style={{ color: '#60a5fa' }} />
                  </motion.button>
                </div>
                <p className="text-xs text-center mb-4" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
                  Ajuste manualmente os passos de hoje
                </p>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const steps = parseInt(manualInput || '0');
                    if (!isNaN(steps) && steps >= 0) {
                      setTodaySteps(steps);
                      setShowManual(false);
                      toast.success('Passos atualizados!');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #60a5fa, var(--theme-accent))', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <Check size={16} />
                  Salvar Passos
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
