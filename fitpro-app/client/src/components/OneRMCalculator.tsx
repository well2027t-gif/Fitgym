/**
 * FitPro — OneRM Calculator Component
 * Design: Premium Dark Fitness
 * Calcula 1RM usando fórmulas de Epley e Brzycki
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp } from 'lucide-react';
import { calculateOneRMEpley, calculateOneRMBrzycki } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface OneRMCalculatorProps {
  onSave?: (exerciseName: string, weight: number, reps: number, oneRM: number) => void;
}

export default function OneRMCalculator({ onSave }: OneRMCalculatorProps) {
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
    if (result && onSave) {
      onSave(exerciseName, weight, reps, result);
      toast.success('1RM registrado!');
      setExerciseName('');
      setWeight(0);
      setReps(0);
      setResult(null);
    }
  };

  return (
    <div className="fitpro-card p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Calculator size={16} style={{ color: 'var(--theme-accent)' }} />
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Calculadora 1RM</h2>
      </div>

      {result === null ? (
        <>
          {/* Exercise Name */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>EXERCÍCIO</label>
            <input
              type="text"
              value={exerciseName}
              onChange={e => setExerciseName(e.target.value)}
              placeholder="Ex: Supino Reto"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
            />
          </div>

          {/* Weight & Reps */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>PESO (kg)</label>
              <input
                type="number"
                value={weight || ''}
                onChange={e => setWeight(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>REPS (1-30)</label>
              <input
                type="number"
                value={reps || ''}
                onChange={e => setReps(Number(e.target.value))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
              />
            </div>
          </div>

          {/* Formula Selection */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>FÓRMULA</label>
            <div className="flex gap-2">
              {[
                { value: 'epley' as const, label: 'Epley' },
                { value: 'brzycki' as const, label: 'Brzycki' },
              ].map(opt => (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormula(opt.value)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
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
          className="text-center space-y-4"
        >
          <div>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>{exerciseName.toUpperCase()}</p>
            <p className="text-4xl font-bold" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>{result}kg</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Peso máximo estimado (1RM)</p>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
            >
              <TrendingUp size={14} />
              Registrar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setResult(null)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Space Grotesk' }}
            >
              Recalcular
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
