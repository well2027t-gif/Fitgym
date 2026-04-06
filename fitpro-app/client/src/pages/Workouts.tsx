/**
 * FitPro — Workouts Page (Premium Redesign)
 * Design: Premium Dark Fitness
 * Visual upgrade: gradients, muscle group icons, smooth animations
 */

import { useState, useRef } from 'react';
import { useApp, Workout, Exercise } from '@/contexts/AppContext';
import { useLocation } from '@/lib/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Dumbbell, ChevronRight, Trash2, Edit3, Play,
  Check, X, Clock, RotateCcw, Star, ChevronDown, ChevronUp, Flame, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';

const WORKOUT_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663504064608/7iSBZeqBuCLymJT9LA3WkR/fitpro-workout-bg-ZvMSyEQH7ULJ9PwivEHvMf.webp';

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps',
  'Pernas', 'Glúteos', 'Abdômen', 'Panturrilha', 'Antebraço'
];

const MUSCLE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  'Peito': { bg: 'rgba(239,68,68,0.1)', border: '#ef4444', text: '#ef4444', icon: '🫀' },
  'Costas': { bg: 'rgba(var(--theme-accent-rgb), 0.1)', border: 'var(--theme-accent)', text: 'var(--theme-accent)', icon: '🔙' },
  'Ombro': { bg: 'rgba(168,85,247,0.1)', border: '#a855f7', text: '#a855f7', icon: '💪' },
  'Bíceps': { bg: 'rgba(59,130,246,0.1)', border: '#3b82f6', text: '#3b82f6', icon: '💯' },
  'Tríceps': { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', text: '#f59e0b', icon: '🎯' },
  'Pernas': { bg: 'rgba(236,72,153,0.1)', border: '#ec4899', text: '#ec4899', icon: '🦵' },
  'Glúteos': { bg: 'rgba(14,165,233,0.1)', border: '#0ea5e9', text: '#0ea5e9', icon: '🍑' },
  'Abdômen': { bg: 'rgba(139,92,246,0.1)', border: '#8b5cf6', text: '#8b5cf6', icon: '⬜' },
  'Panturrilha': { bg: 'rgba(249,115,22,0.1)', border: '#f97316', text: '#f97316', icon: '🦶' },
  'Antebraço': { bg: 'rgba(6,182,212,0.1)', border: '#06b6d4', text: '#06b6d4', icon: '🤜' },
};

interface ExerciseFormData {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
  notes: string;
}

const defaultExercise: ExerciseFormData = {
  name: '', sets: 3, reps: 10, weight: 0, restSeconds: 60, notes: ''
};

function MuscleGroupBadge({ muscle }: { muscle: string }) {
  const color = MUSCLE_COLORS[muscle] || MUSCLE_COLORS['Peito'];
  return (
    <motion.span
      whileHover={{ scale: 1.03 }}
      className="inline-flex items-center gap-2 rounded-2xl px-2.5 py-2 text-[11px] font-semibold"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'Space Grotesk',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[12px]"
        style={{
          background: `linear-gradient(135deg, ${color.bg} 0%, rgba(255,255,255,0.03) 100%)`,
          border: `1px solid ${color.border}55`,
          color: color.text,
          boxShadow: `0 0 18px ${color.border}22`,
        }}
      >
        {color.icon}
      </span>
      <span>{muscle}</span>
    </motion.span>
  );
}

function ExerciseCard({
  exercise,
  onEdit,
  onDelete,
}: {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3.5 rounded-xl group"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}>
        <Dumbbell size={16} style={{ color: 'var(--theme-accent)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'Space Grotesk' }}>{exercise.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(var(--theme-accent-rgb), 0.1)', color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>
            {exercise.sets}×{exercise.reps}
          </span>
          <span className="text-xs font-bold" style={{ color: '#f59e0b', fontFamily: 'Space Grotesk' }}>{exercise.weight}kg</span>
          <span className="text-xs flex items-center gap-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
            <Clock size={10} /> {exercise.restSeconds}s
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onEdit} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <Edit3 size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <Trash2 size={14} style={{ color: '#ef4444' }} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function WorkoutCard({
  workout,
  isToday,
  onSetToday,
  onEdit,
  onDelete,
  onStart,
  onEditExercise,
  onDeleteExercise,
}: {
  workout: Workout;
  isToday: boolean;
  onSetToday: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStart: () => void;
  onEditExercise: (exercise: Exercise) => void;
  onDeleteExercise: (workoutId: string, exerciseId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalVolume = workout.exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * ex.weight), 0);
  const totalDuration = workout.exercises.reduce((sum, ex) => sum + (ex.sets * (ex.reps / 10 + ex.restSeconds / 60)), 0);

  // Gradient based on first muscle group
  const firstMuscle = workout.muscleGroups[0] || 'Peito';
  const muscleColor = MUSCLE_COLORS[firstMuscle] || MUSCLE_COLORS['Peito'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fitpro-card relative overflow-hidden group"
      style={{
        background: 'linear-gradient(180deg, rgba(24,24,27,0.98) 0%, rgba(15,15,17,0.96) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 22px 55px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background: `radial-gradient(circle at top right, ${muscleColor.border}22 0%, rgba(0,0,0,0) 58%)`,
        }}
      />
      <div
        className="absolute left-4 right-4 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${muscleColor.border}66 48%, transparent 100%)` }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'Space Grotesk' }}>
              Plano premium
            </p>
            <h3 className="text-base font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk' }}>
              {workout.name}
            </h3>
            <div
              className="rounded-[22px] p-3"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>
                  Foco muscular
                </p>
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.52)', fontFamily: 'Outfit' }}>
                  {workout.muscleGroups.length} área{workout.muscleGroups.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {workout.muscleGroups.map(mg => (
                  <MuscleGroupBadge key={mg} muscle={mg} />
                ))}
              </div>
            </div>
          </div>
          {isToday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.22) 0%, rgba(var(--theme-accent-rgb), 0.1) 100%)',
                color: 'var(--theme-accent)',
                fontFamily: 'Space Grotesk',
                border: '1px solid rgba(var(--theme-accent-rgb), 0.2)',
              }}
            >
              <Star size={12} fill="var(--theme-accent)" /> Hoje
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>Exercícios</p>
            <p className="text-sm font-bold text-white mt-1" style={{ fontFamily: 'Space Grotesk' }}>{workout.exercises.length}</p>
          </div>
          <div className="px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>Volume</p>
            <p className="text-sm font-bold text-white mt-1" style={{ fontFamily: 'Space Grotesk' }}>{Math.round(totalVolume)}</p>
          </div>
          <div className="px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>Duração</p>
            <p className="text-sm font-bold text-white mt-1" style={{ fontFamily: 'Space Grotesk' }}>{Math.round(totalDuration)}min</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 rounded-[20px] p-2" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.76)', fontFamily: 'Space Grotesk', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Ocultar' : 'Detalhes'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 btn-glow"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk', boxShadow: '0 14px 30px rgba(var(--theme-accent-rgb), 0.22)' }}
          >
            <Play size={14} fill="#0d0d0f" /> Iniciar
          </motion.button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            style={{ borderTop: `1px solid ${muscleColor.border}33` }}
          >
            <div className="px-4 py-3 space-y-2">
              {workout.exercises.map(ex => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onEdit={() => onEditExercise(ex)}
                  onDelete={() => onDeleteExercise(workout.id, ex.id)}
                />
              ))}
            </div>
            <div className="px-4 pb-3 flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onSetToday}
                className="flex-1 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: isToday ? 'rgba(var(--theme-accent-rgb), 0.2)' : 'rgba(255,255,255,0.06)',
                  color: isToday ? 'var(--theme-accent)' : 'rgba(255,255,255,0.5)',
                  border: isToday ? '1px solid rgba(var(--theme-accent-rgb), 0.3)' : 'none',
                  fontFamily: 'Space Grotesk',
                }}
              >
                {isToday ? '✓ Treino do Dia' : 'Definir para Hoje'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onEdit} className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Edit3 size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={onDelete} className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                <Trash2 size={14} style={{ color: '#ef4444' }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Workouts() {
  const { state, addWorkout, updateWorkout, deleteWorkout, setTodayWorkout, updateExercise, deleteExercise } = useApp();
  const [, navigate] = useLocation();
  const { workouts, todayWorkoutId } = state;
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  const totalVolume = workouts.reduce(
    (sum, workout) => sum + workout.exercises.reduce((exerciseSum, ex) => exerciseSum + ex.sets * ex.reps * ex.weight, 0),
    0
  );
  const todayWorkout = workouts.find(workout => workout.id === todayWorkoutId) ?? null;

  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [checkInLocation, setCheckInLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [gymName, setGymName] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [exercises, setExercises] = useState<ExerciseFormData[]>([{ ...defaultExercise }]);
  const [dragStart, setDragStart] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Estado para edição de exercício individual
  const [editingExercise, setEditingExercise] = useState<{ workoutId: string; exercise: Exercise } | null>(null);
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>({ ...defaultExercise });

  const openNewWorkout = () => {
    setEditingWorkout(null);
    setWorkoutName('');
    setSelectedMuscles([]);
    setExercises([{ ...defaultExercise }]);
    setShowWorkoutForm(true);
  };

  const openEditWorkout = (w: Workout) => {
    setEditingWorkout(w);
    setWorkoutName(w.name);
    setSelectedMuscles([...w.muscleGroups]);
    setExercises(w.exercises.map(e => ({ name: e.name, sets: e.sets, reps: e.reps, weight: e.weight, restSeconds: e.restSeconds, notes: e.notes ?? '' })));
    setShowWorkoutForm(true);
  };

  const openEditExercise = (workoutId: string, exercise: Exercise) => {
    setEditingExercise({ workoutId, exercise });
    setExerciseForm({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes ?? '',
    });
  };

  const saveExerciseEdit = () => {
    if (!editingExercise) return;
    if (!exerciseForm.name.trim()) {
      toast.error('Informe o nome do exercício');
      return;
    }
    updateExercise(editingExercise.workoutId, editingExercise.exercise.id, {
      name: exerciseForm.name,
      sets: exerciseForm.sets,
      reps: exerciseForm.reps,
      weight: exerciseForm.weight,
      restSeconds: exerciseForm.restSeconds,
      notes: exerciseForm.notes,
    });
    toast.success('Exercício atualizado!');
    setEditingExercise(null);
  };

  const handleDeleteExercise = (workoutId: string, exerciseId: string) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (workout && workout.exercises.length <= 1) {
      toast.error('O treino precisa ter pelo menos 1 exercício');
      return;
    }
    deleteExercise(workoutId, exerciseId);
    toast.success('Exercício removido!');
  };

  const saveWorkout = () => {
    if (!workoutName.trim()) { toast.error('Informe o nome do treino'); return; }
    if (exercises.some(e => !e.name.trim())) { toast.error('Preencha o nome de todos os exercícios'); return; }

    if (editingWorkout) {
      updateWorkout(editingWorkout.id, {
        name: workoutName,
        muscleGroups: selectedMuscles,
        exercises: exercises.map(e => ({ ...e, id: nanoid(), completed: false })),
      });
      toast.success('Treino atualizado!');
    } else {
      addWorkout({
        name: workoutName,
        muscleGroups: selectedMuscles,
        exercises: exercises.map(e => ({ ...e, id: nanoid(), completed: false })),
      });
      toast.success('Treino criado!');
    }
    setShowWorkoutForm(false);
  };

  const toggleMuscle = (m: string) => {
    setSelectedMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleStartWithCheckIn = (workoutId: string) => {
    setCheckingIn(workoutId);
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste dispositivo.");
      setCheckingIn(null);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simulação de busca de endereço (reversa)
        // Em produção, usaríamos uma API como Google Maps ou OpenStreetMap
        const mockAddress = "Rua das Acácias, 450 - Centro"; 
        
        setCheckInLocation({ lat: latitude, lng: longitude, address: mockAddress });
        setIsLocating(false);
        setShowCheckInForm(true);
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("Não conseguimos validar sua localização. O check-in é obrigatório para treinar.");
        setCheckingIn(null);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const confirmCheckIn = () => {
    if (!gymName.trim()) {
      toast.error("O nome da academia é obrigatório.");
      return;
    }

    // Salvar no histórico de check-ins (simulado no estado global futuramente)
    console.log("Check-in realizado:", {
      workoutId: checkingIn,
      gym: gymName,
      location: checkInLocation,
      timestamp: new Date().toISOString()
    });

    toast.success(`Check-in em "${gymName}" realizado!`, { icon: '📍' });
    
    setTimeout(() => {
      navigate(`/treino-ativo/${checkingIn}`);
      setCheckingIn(null);
      setShowCheckInForm(false);
      setGymName('');
    }, 1000);
  };

  const addExerciseRow = () => setExercises(prev => [...prev, { ...defaultExercise }]);
  const removeExerciseRow = (i: number) => setExercises(prev => prev.filter((_, idx) => idx !== i));
  const updateExerciseRow = (i: number, field: keyof ExerciseFormData, value: string | number) => {
    setExercises(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-10 pb-6">
        <img src={WORKOUT_BG} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.22 }} />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(13,13,15,0.18) 0%, rgba(13,13,15,0.86) 38%, #0d0d0f 100%)',
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Flame size={12} style={{ color: 'var(--theme-accent)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.62)', fontFamily: 'Space Grotesk' }}>
                  Central de Treinos
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight" style={{ fontFamily: 'Space Grotesk' }}>
                Seus treinos com mais
                <span style={{ color: 'var(--theme-accent)' }}> presença</span>
              </h1>
              <p className="text-sm mt-2 max-w-[260px]" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit' }}>
                Organize sua rotina, escolha o treino do dia e acompanhe sua carga de forma mais clara.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={openNewWorkout}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold shadow-lg btn-glow"
              style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
            >
              <Plus size={18} />
              Novo
            </motion.button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)' }}>
              <p className="text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Treinos</p>
              <p className="text-2xl font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>{workouts.length}</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>rotinas salvas</p>
            </div>
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)' }}>
              <p className="text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Exercícios</p>
              <p className="text-2xl font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>{totalExercises}</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>na sua biblioteca</p>
            </div>
            <div className="rounded-2xl p-3.5" style={{ background: 'rgba(var(--theme-accent-rgb), 0.12)', border: '1px solid rgba(var(--theme-accent-rgb), 0.22)', backdropFilter: 'blur(14px)' }}>
              <p className="text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Volume</p>
              <p className="text-2xl font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>{Math.round(totalVolume)}</p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit' }}>carga total</p>
            </div>
          </div>

          <div
            className="rounded-[24px] p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.16) 0%, rgba(255,255,255,0.04) 100%)',
              border: '1px solid rgba(var(--theme-accent-rgb), 0.18)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.28)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Space Grotesk' }}>Treino do dia</p>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {todayWorkout ? todayWorkout.name : 'Nenhum treino definido'}
                </h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit' }}>
                  {todayWorkout
                    ? `${todayWorkout.exercises.length} exercícios para manter consistência e intensidade.`
                    : 'Escolha um treino abaixo para destacar sua rotina principal de hoje.'}
                </p>
              </div>
              <div className="px-3 py-2 rounded-2xl text-right" style={{ background: 'rgba(13,13,15,0.34)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk' }}>Status</p>
                <p className="text-sm font-bold mt-1" style={{ color: todayWorkout ? 'var(--theme-accent)' : 'rgba(255,255,255,0.75)', fontFamily: 'Space Grotesk' }}>
                  {todayWorkout ? 'Pronto para iniciar' : 'Selecione abaixo'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workouts List */}
      <div className="px-4 pb-6 space-y-3">
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Space Grotesk' }}>Biblioteca</p>
            <h3 className="text-lg font-bold text-white mt-1" style={{ fontFamily: 'Space Grotesk' }}>Seus planos de treino</h3>
          </div>
          <div className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit' }}>
            {workouts.length} item{workouts.length !== 1 ? 's' : ''}
          </div>
        </div>
        <AnimatePresence>
          {workouts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fitpro-card p-10 text-center mt-4" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mx-auto mb-3"
              >
                <Dumbbell size={48} style={{ color: 'rgba(255,255,255,0.15)' }} />
              </motion.div>
              <p className="text-base font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>Sua biblioteca está vazia</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>Monte seu primeiro treino personalizado com um visual mais organizado e profissional</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={openNewWorkout}
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)', color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}
              >
                + Criar treino
              </motion.button>
            </motion.div>
          ) : (
            workouts.map(w => (
              <WorkoutCard
                key={w.id}
                workout={w}
                isToday={todayWorkoutId === w.id}
                onSetToday={() => {
                  setTodayWorkout(todayWorkoutId === w.id ? null : w.id);
                  toast.success(todayWorkoutId === w.id ? 'Treino removido do dia' : 'Treino do dia definido!');
                }}
                onEdit={() => openEditWorkout(w)}
                onDelete={() => { deleteWorkout(w.id); toast.success('Treino excluído'); }}
                onStart={() => handleStartWithCheckIn(w.id)}
                onEditExercise={(ex) => openEditExercise(w.id, ex)}
                onDeleteExercise={handleDeleteExercise}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Check-in Overlay & Form */}
      <AnimatePresence>
        {checkingIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(12px)' }}
          >
            {isLocating ? (
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-theme-accent/20 flex items-center justify-center mx-auto mb-6 border border-theme-accent/30"
                >
                  <MapPin size={32} className="text-theme-accent" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>Localizando Academia</h2>
                <p className="text-sm text-white/50 max-w-[240px] mx-auto" style={{ fontFamily: 'Outfit' }}>
                  Buscando seu endereço em tempo real para validar o treino.
                </p>
              </div>
            ) : showCheckInForm && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-[#161618] rounded-[32px] p-6 border border-white/10 shadow-2xl"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-theme-accent/10 flex items-center justify-center border border-theme-accent/20">
                    <Dumbbell size={28} className="text-theme-accent" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-white text-center mb-1" style={{ fontFamily: 'Space Grotesk' }}>Check-in Obrigatório</h2>
                <p className="text-xs text-white/40 text-center mb-6" style={{ fontFamily: 'Outfit' }}>
                  Para contabilizar seu treino, confirme onde você está treinando hoje.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block ml-1">Endereço Detectado</label>
                    <div className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <MapPin size={16} className="text-theme-accent/60" />
                      <span className="text-sm text-white/70 truncate" style={{ fontFamily: 'Outfit' }}>
                        {checkInLocation?.address || "Localização obtida"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 block ml-1">Nome da Academia</label>
                    <input 
                      autoFocus
                      value={gymName}
                      onChange={e => setGymName(e.target.value)}
                      placeholder="Ex: Bluefit, Smart Fit..."
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-theme-accent/50 transition-colors"
                      style={{ fontFamily: 'Outfit' }}
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      onClick={() => { setCheckingIn(null); setShowCheckInForm(false); }}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white/50 bg-white/5 border border-white/5"
                      style={{ fontFamily: 'Space Grotesk' }}
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmCheckIn}
                      className="flex-[2] py-3.5 rounded-2xl text-sm font-bold text-black bg-theme-accent shadow-lg shadow-theme-accent/20"
                      style={{ fontFamily: 'Space Grotesk' }}
                    >
                      Confirmar e Treinar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout Form Modal */}
      <AnimatePresence>
        {showWorkoutForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowWorkoutForm(false); }}
          >
            <motion.div
              ref={modalRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onTouchStart={e => setDragStart(e.touches[0].clientY)}
              onTouchEnd={e => {
                const dragEnd = e.changedTouches[0].clientY;
                if (dragEnd - dragStart > 100) setShowWorkoutForm(false);
              }}
              className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden flex flex-col"
              style={{ background: '#161618', maxHeight: '92vh' }}
            >
              <div className="flex-1 overflow-y-auto">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <div className="px-5 pb-8 pt-0">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    {editingWorkout ? 'Editar Treino' : 'Novo Treino'}
                  </h2>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowWorkoutForm(false)}>
                    <X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  </motion.button>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>NOME DO TREINO</label>
                  <input
                    value={workoutName}
                    onChange={e => setWorkoutName(e.target.value)}
                    placeholder="Ex: Treino A — Peito e Tríceps"
                    className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                  />
                </div>

                {/* Muscle Groups */}
                <div className="mb-5">
                  <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>GRUPOS MUSCULARES</label>
                  <div className="flex flex-wrap gap-2">
                    {MUSCLE_GROUPS.map(m => (
                      <motion.button
                        key={m}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleMuscle(m)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: selectedMuscles.includes(m) ? MUSCLE_COLORS[m].bg : 'rgba(255,255,255,0.06)',
                          border: selectedMuscles.includes(m) ? `1.5px solid ${MUSCLE_COLORS[m].border}` : '1px solid rgba(255,255,255,0.08)',
                          color: selectedMuscles.includes(m) ? MUSCLE_COLORS[m].text : 'rgba(255,255,255,0.4)',
                          fontFamily: 'Space Grotesk',
                        }}
                      >
                        {m}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Exercises */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>EXERCÍCIOS</label>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={addExerciseRow}
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}
                    >
                      <Plus size={12} /> Adicionar
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {exercises.map((ex, i) => (
                      <motion.div key={i} layout className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            value={ex.name}
                            onChange={e => updateExerciseRow(i, 'name', e.target.value)}
                            placeholder="Nome do exercício"
                            className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                            style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Outfit' }}
                          />
                          {exercises.length > 1 && (
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeExerciseRow(i)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
                              <X size={14} style={{ color: '#ef4444' }} />
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Séries', field: 'sets' as const },
                            { label: 'Reps', field: 'reps' as const },
                            { label: 'Carga (kg)', field: 'weight' as const },
                            { label: 'Descanso (s)', field: 'restSeconds' as const },
                          ].map(({ label, field }) => (
                            <div key={field}>
                              <label className="text-[9px] block mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>{label}</label>
                              <input
                                type="number"
                                value={ex[field]}
                                onChange={e => updateExerciseRow(i, field, Number(e.target.value))}
                                className="w-full px-2 py-1.5 rounded-lg text-sm text-white text-center outline-none"
                                style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'Space Grotesk' }}
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={saveWorkout}
                  className="w-full py-3.5 rounded-xl text-sm font-bold btn-glow"
                  style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                >
                  {editingWorkout ? 'Salvar Alterações' : 'Criar Treino'}
                </motion.button>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Edit Modal */}
      <AnimatePresence>
        {editingExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => { if (e.target === e.currentTarget) setEditingExercise(null); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-lg mx-auto rounded-t-3xl overflow-hidden"
              style={{ background: '#161618', maxHeight: '80vh' }}
            >
              <div className="overflow-y-auto">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
                </div>

                <div className="px-5 pb-8 pt-0">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      Editar Exercício
                    </h2>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingExercise(null)}>
                      <X size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                    </motion.button>
                  </div>

                  {/* Exercise Name */}
                  <div className="mb-4">
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>NOME DO EXERCÍCIO</label>
                    <input
                      value={exerciseForm.name}
                      onChange={e => setExerciseForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nome do exercício"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Outfit' }}
                    />
                  </div>

                  {/* Exercise Fields */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: 'Séries', field: 'sets' as const },
                      { label: 'Repetições', field: 'reps' as const },
                      { label: 'Carga (kg)', field: 'weight' as const },
                      { label: 'Descanso (s)', field: 'restSeconds' as const },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>{label}</label>
                        <input
                          type="number"
                          value={exerciseForm[field]}
                          onChange={e => setExerciseForm(f => ({ ...f, [field]: Number(e.target.value) }))}
                          className="w-full px-4 py-3 rounded-xl text-sm text-white text-center outline-none"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Space Grotesk' }}
                        />
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={saveExerciseEdit}
                    className="w-full py-3.5 rounded-xl text-sm font-bold btn-glow"
                    style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
                  >
                    Salvar Exercício
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
