/**
 * FitPro — OneRM Calculator Page
 * Design: Premium Dark Fitness
 * Página dedicada para calcular 1RM
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { calculateOneRMEpley, calculateOneRMBrzycki } from '@/contexts/AppContext';

export default function OneRM() {
  const { addOneRMRecord } = useApp();
  const [, navigate] = useLocation();
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [formula, setFormula] = useState<'epley' | 'brzycki'>('epley');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    if (!exerciseName.trim() || weight <= 0 || reps <= 0 || reps > 30) {
      toast.error('Preencha todos os campos corretamente (reps: 1-30)');
      return;
    }

    const oneRM = formula === 'epley' 
      ? calculateOneRMEpley(weight, reps)
      : calculateOneRMBrzycki(weight, reps);
    
    setResult(oneRM);
  };

  const handleSave = () => {
    if (result) {
      addOneRMRecord({
        exerciseName,
        weight,
        reps,
        estimatedOneRM: result,
        date: new Date().toISOString().split('T')[0],
      });
      toast.success('1RM registrado!');
      setExerciseName('');
      setWeight(0);
      setReps(0);
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6 flex items-center gap-3" style={{ background: 'linear-gradient(to bottom, #161618, #0d0d0f)' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} style={{ color: 'var(--theme-accent)' }} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Calculadora 1RM</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Estime seu peso máximo</p>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {result === null ? (
          <>
            {/* Exercise Name */}
            <div className="fitpro-card p-4 space-y-2">
              <label className="text-xs font-medium block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>EXERCÍCIO</label>
              <input
                type="text"
                value={exerciseName}
                onChange={e => setExerciseName(e.target.value)}
                placeholder="Ex: Supino Reto"
                className="w-full px-4 py-3 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
              />
            </div>

            {/* Weight & Reps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="fitpro-card p-4 space-y-2">
                <label className="text-xs font-medium block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>PESO (kg)</label>
                <input
                  type="number"
                  value={weight || ''}
                  onChange={e => setWeight(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                />
              </div>
              <div className="fitpro-card p-4 space-y-2">
                <label className="text-xs font-medium block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>REPS (1-30)</label>
                <input
                  type="number"
                  value={reps || ''}
                  onChange={e => setReps(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                />
              </div>
            </div>

            {/* Formula Selection */}
            <div className="fitpro-card p-4 space-y-3">
              <label className="text-xs font-medium block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>FÓRMULA</label>
              <div className="flex gap-2">
                {[
                  { value: 'epley' as const, label: 'Epley' },
                  { value: 'brzycki' as const, label: 'Brzycki' },
                ].map(opt => (
                  <motion.button
                    key={opt.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormula(opt.value)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: formula === opt.value ? 'rgba(var(--theme-accent-rgb), 0.2)' : 'rgba(255,255,255,0.06)',
                      border: formula === opt.value ? '1.5px solid rgba(var(--theme-accent-rgb), 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: formula === opt.value ? 'var(--theme-accent)' : 'rgba(255,255,255,0.4)',
                      fontFamily: 'Space Grotesk',
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCalculate}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
            >
              Calcular 1RM
            </motion.button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 mt-10"
          >
            <div>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>{exerciseName.toUpperCase()}</p>
              <p className="text-5xl font-bold mb-2" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>{result}kg</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Peso máximo estimado (1RM)</p>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className="flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
              >
                <TrendingUp size={16} />
                Registrar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setResult(null)}
                className="flex-1 py-3 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Space Grotesk' }}
              >
                Recalcular
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
