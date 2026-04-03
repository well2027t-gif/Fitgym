/**
 * FitPro — Diet Page
 * Design: Premium Dark Fitness
 * Refeições do dia, adição de alimentos, soma de macros, meta calórica.
 */

import { useState, useMemo } from 'react';
import { useApp, MealType, Food } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, X, ChevronDown, ChevronUp,
  Apple, Coffee, Sun, Moon, Sunset, Edit3, Target
} from 'lucide-react';
import { toast } from 'sonner';

const DIET_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-diet-bg-SdFdVhoX5k9TfDKkuwvv7T.webp';

const MEAL_CONFIG: Record<MealType, { label: string; icon: React.ElementType; color: string; bg: string; emoji: string }> = {
  breakfast: { label: 'Café da Manhã', icon: Coffee, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '☕' },
  lunch: { label: 'Almoço', icon: Sun, color: 'var(--theme-accent)', bg: 'rgba(var(--theme-accent-rgb), 0.12)', emoji: '🍽️' },
  snack: { label: 'Lanche', icon: Apple, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', emoji: '🥜' },
  dinner: { label: 'Janta', icon: Moon, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', emoji: '🌙' },
};

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

interface FoodFormData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

const defaultFood: FoodFormData = {
  name: '', calories: 0, protein: 0, carbs: 0, fat: 0, quantity: 100, unit: 'g'
};

// Quick food presets
const QUICK_FOODS: Array<Omit<FoodFormData, 'quantity' | 'unit'> & { quantity: number; unit: string }> = [
  { name: 'Frango grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, quantity: 100, unit: 'g' },
  { name: 'Arroz branco cozido', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, quantity: 100, unit: 'g' },
  { name: 'Ovo cozido', calories: 78, protein: 6, carbs: 0.6, fat: 5, quantity: 1, unit: 'unid' },
  { name: 'Whey Protein', calories: 120, protein: 25, carbs: 3, fat: 2, quantity: 1, unit: 'scoop' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, quantity: 1, unit: 'unid' },
  { name: 'Batata doce', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, quantity: 100, unit: 'g' },
  { name: 'Aveia', calories: 389, protein: 17, carbs: 66, fat: 7, quantity: 100, unit: 'g' },
  { name: 'Pasta de amendoim', calories: 588, protein: 25, carbs: 20, fat: 50, quantity: 100, unit: 'g' },
];

function MacroCircle({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.min(value / max, 1);
  const r = 22;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-14 h-14">
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <motion.circle
            cx="28" cy="28" r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 0.8, ease: 'easeOut' as const }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{Math.round(value)}g</span>
        </div>
      </div>
      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>{label}</span>
    </div>
  );
}

function MealSection({
  mealType,
  foods,
  onAddFood,
  onDeleteFood,
}: {
  mealType: MealType;
  foods: Food[];
  onAddFood: (mealType: MealType) => void;
  onDeleteFood: (mealType: MealType, foodId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const config = MEAL_CONFIG[mealType];
  const Icon = config.icon;
  const totalCal = foods.reduce((a, f) => a + f.calories, 0);
  const totalProt = foods.reduce((a, f) => a + f.protein, 0);
  const totalCarb = foods.reduce((a, f) => a + f.carbs, 0);
  const totalFat = foods.reduce((a, f) => a + f.fat, 0);

  return (
    <div className="fitpro-card overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: config.bg }}>
          <Icon size={16} style={{ color: config.color }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>{config.label}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
            {foods.length} alimentos • {Math.round(totalCal)} kcal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onAddFood(mealType); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: config.bg }}
          >
            <Plus size={14} style={{ color: config.color }} />
          </button>
          {expanded ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.3)' }} /> : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {foods.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit' }}>Nenhum alimento adicionado</p>
                  <button onClick={() => onAddFood(mealType)} className="text-xs font-medium mt-1" style={{ color: config.color, fontFamily: 'Outfit' }}>
                    + Adicionar alimento
                  </button>
                </div>
              ) : (
                <>
                  {foods.map(food => (
                    <motion.div
                      key={food.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center gap-2 p-2.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate" style={{ fontFamily: 'Outfit' }}>{food.name}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
                          {food.quantity}{food.unit} • P:{Math.round(food.protein)}g C:{Math.round(food.carbs)}g G:{Math.round(food.fat)}g
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold" style={{ color: config.color, fontFamily: 'Space Grotesk' }}>{Math.round(food.calories)}</p>
                        <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>kcal</p>
                      </div>
                      <button
                        onClick={() => onDeleteFood(mealType, food.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(239,68,68,0.1)' }}
                      >
                        <Trash2 size={11} style={{ color: '#ef4444' }} />
                      </button>
                    </motion.div>
                  ))}

                  {/* Meal totals */}
                  <div className="flex items-center justify-between pt-1 px-1">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Total da refeição</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>P:{Math.round(totalProt)}g</span>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>C:{Math.round(totalCarb)}g</span>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>G:{Math.round(totalFat)}g</span>
                      <span className="text-xs font-bold" style={{ color: config.color, fontFamily: 'Space Grotesk' }}>{Math.round(totalCal)} kcal</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Diet() {
  const { state, getTodayDiet, addFoodToMeal, deleteFood, updateProfile } = useApp();
  const { profile } = state;
  const todayDiet = getTodayDiet();

  const [addingTo, setAddingTo] = useState<MealType | null>(null);
  const [foodForm, setFoodForm] = useState<FoodFormData>({ ...defaultFood });
  const [showQuick, setShowQuick] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(profile.calorieGoal.toString());

  const totals = useMemo(() => {
    return todayDiet.meals.reduce(
      (acc, meal) => {
        meal.foods.forEach(f => {
          acc.calories += f.calories;
          acc.protein += f.protein;
          acc.carbs += f.carbs;
          acc.fat += f.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayDiet]);

  const saveFood = () => {
    if (!foodForm.name.trim()) { toast.error('Informe o nome do alimento'); return; }
    if (!addingTo) return;
    addFoodToMeal(addingTo, foodForm);
    toast.success('Alimento adicionado!');
    setAddingTo(null);
    setFoodForm({ ...defaultFood });
    setShowQuick(false);
  };

  const saveGoal = () => {
    const val = parseInt(goalInput);
    if (isNaN(val) || val < 500) { toast.error('Meta inválida'); return; }
    updateProfile({ calorieGoal: val });
    setEditingGoal(false);
    toast.success('Meta calórica atualizada!');
  };

  const caloriesPct = Math.min((totals.calories / profile.calorieGoal) * 100, 100);

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img src={DIET_BG} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.25 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,13,15,0.4) 0%, rgba(13,13,15,0.98) 100%)' }} />
        <div className="relative z-10 px-5 pt-12 pb-4 h-full flex flex-col justify-end">
          <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>Dieta de Hoje</h1>

          {/* Calorie progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                  {Math.round(totals.calories)} / {profile.calorieGoal} kcal
                </span>
                <button
                  onClick={() => { setEditingGoal(true); setGoalInput(profile.calorieGoal.toString()); }}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}
                >
                  <Target size={10} /> Meta
                </button>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: caloriesPct > 100 ? '#ef4444' : 'linear-gradient(90deg, var(--theme-accent), var(--theme-accent))' }}
                  animate={{ width: `${caloriesPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Macros Summary */}
      <div className="px-4 -mt-2">
        <div className="fitpro-card p-4">
          <div className="flex items-center justify-around">
            <MacroCircle value={totals.protein} max={profile.proteinGoal} color="var(--theme-accent)" label="Proteína" />
            <MacroCircle value={totals.carbs} max={profile.carbGoal} color="#f59e0b" label="Carboidrato" />
            <MacroCircle value={totals.fat} max={profile.fatGoal} color="#ef4444" label="Gordura" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.08)' }}>
                <div className="text-center">
                  <p className="text-sm font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>{Math.round(profile.calorieGoal - totals.calories)}</p>
                </div>
              </div>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Restante</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="px-4 pb-6 space-y-3 mt-4">
        {MEAL_ORDER.map(mealType => {
          const meal = todayDiet.meals.find(m => m.type === mealType);
          return (
            <MealSection
              key={mealType}
              mealType={mealType}
              foods={meal?.foods ?? []}
              onAddFood={mt => { setAddingTo(mt); setFoodForm({ ...defaultFood }); setShowQuick(false); }}
              onDeleteFood={deleteFood}
            />
          );
        })}
      </div>

      {/* Add Food Modal */}
      <AnimatePresence>
        {addingTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setAddingTo(null); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
              style={{ background: '#161618', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <div className="px-5 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Adicionar Alimento</h2>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                      {MEAL_CONFIG[addingTo].label}
                    </p>
                  </div>
                  <button onClick={() => setAddingTo(null)}>
                    <X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </button>
                </div>

                {/* Quick foods toggle */}
                <button
                  onClick={() => setShowQuick(s => !s)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-4"
                  style={{ background: 'rgba(var(--theme-accent-rgb), 0.08)', border: '1px solid rgba(var(--theme-accent-rgb), 0.15)' }}
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>⚡ Alimentos rápidos</span>
                  {showQuick ? <ChevronUp size={14} style={{ color: 'var(--theme-accent)' }} /> : <ChevronDown size={14} style={{ color: 'var(--theme-accent)' }} />}
                </button>

                <AnimatePresence>
                  {showQuick && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_FOODS.map(qf => (
                          <button
                            key={qf.name}
                            onClick={() => {
                              setFoodForm({ ...qf });
                              setShowQuick(false);
                            }}
                            className="text-left p-2.5 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <p className="text-xs font-medium text-white truncate" style={{ fontFamily: 'Outfit' }}>{qf.name}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
                              {qf.calories} kcal • P:{qf.protein}g
                            </p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Food form */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>NOME DO ALIMENTO</label>
                    <input
                      value={foodForm.name}
                      onChange={e => setFoodForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: Frango grelhado"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>QUANTIDADE</label>
                      <input
                        type="number"
                        value={foodForm.quantity}
                        onChange={e => setFoodForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>UNIDADE</label>
                      <input
                        value={foodForm.unit}
                        onChange={e => setFoodForm(f => ({ ...f, unit: e.target.value }))}
                        placeholder="g, ml, unid..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'CALORIAS (kcal)', field: 'calories' as const, color: '#ef4444' },
                      { label: 'PROTEÍNAS (g)', field: 'protein' as const, color: 'var(--theme-accent)' },
                      { label: 'CARBOIDRATOS (g)', field: 'carbs' as const, color: '#f59e0b' },
                      { label: 'GORDURAS (g)', field: 'fat' as const, color: '#60a5fa' },
                    ].map(({ label, field, color }) => (
                      <div key={field}>
                        <label className="text-[10px] font-medium mb-1.5 block" style={{ color, fontFamily: 'Outfit' }}>{label}</label>
                        <input
                          type="number"
                          step="0.1"
                          value={foodForm[field]}
                          onChange={e => setFoodForm(f => ({ ...f, [field]: Number(e.target.value) }))}
                          className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
                          style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={saveFood}
                  className="w-full py-3.5 rounded-xl text-sm font-bold mt-5 btn-glow"
                  style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  Adicionar Alimento
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Goal Modal */}
      <AnimatePresence>
        {editingGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setEditingGoal(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: '#1c1c20', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>Meta Calórica</h3>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Defina sua meta diária de calorias</p>
              <input
                type="number"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-2xl font-bold text-white text-center outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setEditingGoal(false)} className="flex-1 py-3 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                  Cancelar
                </button>
                <button onClick={saveGoal} className="flex-1 py-3 rounded-xl text-sm font-bold btn-glow" style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}>
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
