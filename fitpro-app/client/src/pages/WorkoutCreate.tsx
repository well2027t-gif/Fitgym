/**
 * FitPro — WorkoutCreate Page
 * Design: Premium Dark Fitness
 * Tela para criar treinos personalizados selecionando exercícios da biblioteca
 */

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Dumbbell,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from '@/lib/router';
import { useApp } from '@/contexts/AppContext';
import { getExerciseLibrary } from '@/lib/workoutEngine';

interface SelectedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  weight: number;
  restSeconds: number;
  videoUrl?: string;
  instructions?: string;
}

const DAYS_OF_WEEK = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function WorkoutCreate() {
  const [, navigate] = useLocation();
  const { state, saveWorkout } = useApp();
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const exerciseLibrary = useMemo(() => getExerciseLibrary(), []);

  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter(ex =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, exerciseLibrary]);

  const handleAddExercise = (exercise: typeof exerciseLibrary[0]) => {
    const newExercise: SelectedExercise = {
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      sets: 3,
      reps: 10,
      weight: 0,
      restSeconds: 60,
      videoUrl: exercise.videoUrl,
      instructions: exercise.instructions,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    toast.success(`${exercise.name} adicionado!`);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: string, value: number) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSaveWorkout = async () => {
    if (selectedExercises.length === 0) {
      toast.error('Adicione pelo menos um exercício');
      return;
    }

    setIsSaving(true);
    try {
      saveWorkout(selectedExercises, selectedDay);
      toast.success('Treino salvo com sucesso!');
      navigate('/treinos');
    } catch (error) {
      toast.error('Erro ao salvar treino');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] pb-24">
      {/* CABEÇALHO */}
      <div className="sticky top-0 z-30 bg-[#0d0d0f]/95 backdrop-blur border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/treinos')}
            className="flex size-9 items-center justify-center rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
          >
            <ArrowLeft size={16} />
          </motion.button>
          <h1 className="flex-1 text-center text-base font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Criar Treino Personalizado
          </h1>
          <div className="w-9" />
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="px-4 py-4">
        {/* SELETOR DE DIA */}
        <div className="mb-4 rounded-lg border p-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>Selecione o dia:</p>
          <div className="grid grid-cols-7 gap-1">
            {DAYS_OF_WEEK.map((day, index) => (
              <motion.button
                key={day}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(index)}
                className="rounded-lg px-1 py-2 text-[10px] font-bold transition-all"
                style={{
                  background: selectedDay === index ? '#4ade80' : 'rgba(255,255,255,0.08)',
                  color: selectedDay === index ? '#0d0d0f' : 'rgba(255,255,255,0.6)',
                  border: selectedDay === index ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'Space Grotesk',
                }}
              >
                {day.substring(0, 3)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* BUSCA DE EXERCÍCIOS */}
        <div className="mb-4 relative">
          <Search size={16} className="absolute left-3 top-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
          <input
            type="text"
            placeholder="Buscar exercício..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/40 outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* EXERCÍCIOS DISPONÍVEIS */}
        <div className="mb-6">
          <p className="text-xs font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Exercícios Disponíveis ({filteredExercises.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {filteredExercises.map((exercise) => (
              <motion.button
                key={exercise.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddExercise(exercise)}
                className="w-full rounded-lg border p-2.5 text-left transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      {exercise.name}
                    </p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                      {exercise.muscleGroup}
                    </p>
                  </div>
                  <Plus size={14} style={{ color: '#4ade80' }} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* EXERCÍCIOS SELECIONADOS */}
        <div className="mb-6">
          <p className="text-xs font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Exercícios Selecionados ({selectedExercises.length})
          </p>
          <AnimatePresence>
            {selectedExercises.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                Adicione exercícios para começar
              </p>
            ) : (
              <div className="space-y-2">
                {selectedExercises.map((exercise, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-lg border p-3"
                    style={{ background: 'rgba(74, 222, 128, 0.08)', borderColor: 'rgba(74, 222, 128, 0.15)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                        {exercise.name}
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveExercise(index)}
                        className="p-1 rounded-md"
                        style={{ background: 'rgba(255,255,255,0.1)' }}
                      >
                        <Trash2 size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {/* Séries */}
                      <div>
                        <p className="text-[9px] text-white/50 mb-1" style={{ fontFamily: 'Space Grotesk' }}>Séries</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateExercise(index, 'sets', Math.max(1, exercise.sets - 1))}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-xs font-bold text-white">{exercise.sets}</span>
                          <button
                            onClick={() => handleUpdateExercise(index, 'sets', exercise.sets + 1)}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Reps */}
                      <div>
                        <p className="text-[9px] text-white/50 mb-1" style={{ fontFamily: 'Space Grotesk' }}>Reps</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateExercise(index, 'reps', Math.max(1, exercise.reps - 1))}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-xs font-bold text-white">{exercise.reps}</span>
                          <button
                            onClick={() => handleUpdateExercise(index, 'reps', exercise.reps + 1)}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Carga */}
                      <div>
                        <p className="text-[9px] text-white/50 mb-1" style={{ fontFamily: 'Space Grotesk' }}>Carga</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateExercise(index, 'weight', Math.max(0, exercise.weight - 2.5))}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-xs font-bold text-white">{exercise.weight.toFixed(0)}</span>
                          <button
                            onClick={() => handleUpdateExercise(index, 'weight', exercise.weight + 2.5)}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Descanso */}
                      <div>
                        <p className="text-[9px] text-white/50 mb-1" style={{ fontFamily: 'Space Grotesk' }}>Descanso</p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateExercise(index, 'restSeconds', Math.max(15, exercise.restSeconds - 15))}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            −
                          </button>
                          <span className="flex-1 text-center text-xs font-bold text-white">{exercise.restSeconds}s</span>
                          <button
                            onClick={() => handleUpdateExercise(index, 'restSeconds', exercise.restSeconds + 15)}
                            className="flex-1 rounded-md py-1 bg-white/10 text-[10px] font-bold text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-[#0d0d0f]/95 backdrop-blur border-t border-white/5">
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/treinos')}
              className="flex-1 rounded-lg px-4 py-3 text-sm font-bold border"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontFamily: 'Space Grotesk' }}
            >
              Cancelar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveWorkout}
              disabled={isSaving || selectedExercises.length === 0}
              className="flex-1 rounded-lg px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: '#4ade80', color: '#0d0d0f', fontFamily: 'Space Grotesk', opacity: isSaving || selectedExercises.length === 0 ? 0.6 : 1 }}
            >
              <Check size={16} /> {isSaving ? 'Salvando...' : 'Salvar Treino'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
