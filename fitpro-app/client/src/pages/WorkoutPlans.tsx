/**
 * FitPro — Workout Plans Page
 * Design: Premium Dark Fitness
 * Planos de treino pré-prontos por objetivo
 */

import { useState } from 'react';
import { useApp, Goal } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Copy, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const PRESET_PLANS = [
  {
    name: 'Hipertrofia 4 Dias',
    objective: 'ganhar_massa' as Goal,
    difficulty: 'intermediario' as const,
    description: 'Programa focado em ganho de massa muscular com foco em volume',
    durationWeeks: 12,
    workouts: [
      {
        name: 'Dia 1 - Peito e Tríceps',
        muscleGroups: ['Peito', 'Tríceps'],
        exercises: [
          { name: 'Supino Reto', sets: 4, reps: 8, weight: 60, restSeconds: 120 },
          { name: 'Supino Inclinado', sets: 3, reps: 10, weight: 50, restSeconds: 90 },
          { name: 'Crucifixo', sets: 3, reps: 12, weight: 14, restSeconds: 75 },
          { name: 'Tríceps Pulley', sets: 4, reps: 12, weight: 30, restSeconds: 60 },
        ],
      },
      {
        name: 'Dia 2 - Costas e Bíceps',
        muscleGroups: ['Costas', 'Bíceps'],
        exercises: [
          { name: 'Puxada Frontal', sets: 4, reps: 8, weight: 70, restSeconds: 120 },
          { name: 'Remada Curvada', sets: 3, reps: 10, weight: 80, restSeconds: 90 },
          { name: 'Puxada Alta', sets: 3, reps: 12, weight: 50, restSeconds: 75 },
          { name: 'Rosca Direta', sets: 4, reps: 12, weight: 20, restSeconds: 60 },
        ],
      },
      {
        name: 'Dia 3 - Ombro e Perna',
        muscleGroups: ['Ombro', 'Perna'],
        exercises: [
          { name: 'Desenvolvimento Militar', sets: 4, reps: 8, weight: 40, restSeconds: 120 },
          { name: 'Elevação Lateral', sets: 3, reps: 12, weight: 12, restSeconds: 75 },
          { name: 'Agachamento', sets: 4, reps: 10, weight: 100, restSeconds: 120 },
          { name: 'Leg Press', sets: 3, reps: 12, weight: 150, restSeconds: 90 },
        ],
      },
    ],
  },
  {
    name: 'Cutting 5 Dias',
    objective: 'perder_gordura' as Goal,
    difficulty: 'avancado' as const,
    description: 'Programa de perda de gordura com alta frequência de treino',
    durationWeeks: 8,
    workouts: [
      {
        name: 'Dia 1 - Peito',
        muscleGroups: ['Peito'],
        exercises: [
          { name: 'Supino Reto', sets: 3, reps: 12, weight: 50, restSeconds: 60 },
          { name: 'Supino Inclinado', sets: 3, reps: 12, weight: 40, restSeconds: 60 },
          { name: 'Crucifixo', sets: 3, reps: 15, weight: 12, restSeconds: 45 },
        ],
      },
      {
        name: 'Dia 2 - Costas',
        muscleGroups: ['Costas'],
        exercises: [
          { name: 'Puxada Frontal', sets: 3, reps: 12, weight: 60, restSeconds: 60 },
          { name: 'Remada Curvada', sets: 3, reps: 12, weight: 70, restSeconds: 60 },
          { name: 'Puxada Alta', sets: 3, reps: 15, weight: 40, restSeconds: 45 },
        ],
      },
    ],
  },
  {
    name: 'Força 3 Dias',
    objective: 'ganhar_massa' as Goal,
    difficulty: 'avancado' as const,
    description: 'Programa focado em ganho de força com baixo volume',
    durationWeeks: 10,
    workouts: [
      {
        name: 'Dia 1 - Agachamento',
        muscleGroups: ['Perna'],
        exercises: [
          { name: 'Agachamento', sets: 5, reps: 5, weight: 120, restSeconds: 180 },
          { name: 'Leg Press', sets: 3, reps: 8, weight: 200, restSeconds: 120 },
        ],
      },
      {
        name: 'Dia 2 - Supino',
        muscleGroups: ['Peito'],
        exercises: [
          { name: 'Supino Reto', sets: 5, reps: 5, weight: 80, restSeconds: 180 },
          { name: 'Supino Inclinado', sets: 3, reps: 8, weight: 60, restSeconds: 120 },
        ],
      },
      {
        name: 'Dia 3 - Rosca',
        muscleGroups: ['Costas'],
        exercises: [
          { name: 'Puxada Frontal', sets: 5, reps: 5, weight: 90, restSeconds: 180 },
          { name: 'Remada Curvada', sets: 3, reps: 8, weight: 100, restSeconds: 120 },
        ],
      },
    ],
  },
];

export default function WorkoutPlans() {
  const { state, addWorkoutPlan, addWorkout, deleteWorkoutPlan } = useApp();
  const [selectedObjective, setSelectedObjective] = useState<Goal | 'all'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredPlans = PRESET_PLANS.filter(
    p => selectedObjective === 'all' || p.objective === selectedObjective
  );

  const handleImportPlan = (plan: typeof PRESET_PLANS[0]) => {
    try {
      // Add each workout from the plan
      plan.workouts.forEach(workout => {
        addWorkout({
          name: workout.name,
          muscleGroups: workout.muscleGroups,
          exercises: workout.exercises.map(e => ({ id: nanoid(), ...e })),
        });
      });
      
      // Add the plan itself
      addWorkoutPlan({
        name: plan.name,
        description: plan.description,
        objective: plan.objective,
        difficulty: plan.difficulty,
        durationWeeks: plan.durationWeeks,
        workouts: plan.workouts.map(w => ({
          id: nanoid(),
          name: w.name,
          muscleGroups: w.muscleGroups,
          exercises: w.exercises.map(e => ({ id: nanoid(), ...e })),
          createdAt: new Date().toISOString(),
        })),
      });
      
      toast.success(`Plano "${plan.name}" importado!`);
    } catch (e) {
      toast.error('Erro ao importar plano');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6" style={{ background: 'linear-gradient(to bottom, #161618, #0d0d0f)' }}>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Planos de Treino</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Programas pré-prontos por objetivo</p>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all' as const, label: 'Todos' },
            { value: 'ganhar_massa' as const, label: 'Ganhar Massa' },
            { value: 'perder_gordura' as const, label: 'Perder Gordura' },
            { value: 'manter_peso' as const, label: 'Manter Peso' },
          ].map(opt => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedObjective(opt.value)}
              className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: selectedObjective === opt.value ? 'var(--theme-accent)' : 'rgba(255,255,255,0.06)',
                color: selectedObjective === opt.value ? '#0d0d0f' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Space Grotesk',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="space-y-3">
          {filteredPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="fitpro-card p-4"
              style={{
                background: `linear-gradient(135deg, rgba(${plan.objective === 'ganhar_massa' ? '34,197,94' : '96,165,250'},0.1) 0%, rgba(${plan.objective === 'ganhar_massa' ? '34,197,94' : '96,165,250'},0.05) 100%)`,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{plan.name}</h3>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>{plan.description}</p>
                </div>
                <div
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap ml-2"
                  style={{
                    background: plan.difficulty === 'intermediario' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: plan.difficulty === 'intermediario' ? '#f59e0b' : '#ef4444',
                    fontFamily: 'Space Grotesk',
                  }}
                >
                  {plan.difficulty}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
                <BookOpen size={12} />
                <span>{plan.workouts.length} treinos</span>
                <span>•</span>
                <span>{plan.durationWeeks} semanas</span>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetails(showDetails === plan.name ? null : plan.name)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Space Grotesk' }}
                >
                  Ver Detalhes
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleImportPlan(plan)}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                  style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  <Copy size={12} />
                  Importar
                </motion.button>
              </div>

              {/* Details */}
              <AnimatePresence>
                {showDetails === plan.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 space-y-2"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {plan.workouts.map(workout => (
                      <div key={workout.name} className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                        <p className="font-semibold text-white mb-1">{workout.name}</p>
                        <ul className="ml-3 space-y-0.5">
                          {workout.exercises.map(ex => (
                            <li key={ex.name}>
                              • {ex.name} — {ex.sets}x{ex.reps} @ {ex.weight}kg
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Imported Plans */}
        {state.workoutPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 mt-8 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Meus Planos Importados</h2>
            {state.workoutPlans.map(plan => (
              <div key={plan.id} className="fitpro-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{plan.name}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>{plan.workouts.length} treinos</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteWorkoutPlan(plan.id)}
                >
                  <Trash2 size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                </motion.button>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
