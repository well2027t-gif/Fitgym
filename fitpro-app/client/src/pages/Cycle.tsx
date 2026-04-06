/**
 * FitPro — Cycle Tracking Page
 * Design: Premium Dark Fitness
 * Acompanhamento completo de ciclo menstrual e saúde feminina.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  History, 
  Activity, 
  Heart,
  Droplets,
  Trash2,
  Info,
  Zap,
  Moon,
  Thermometer,
  AlertCircle,
} from 'lucide-react';
import { useApp, CycleDayEntry } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

const SYMPTOMS = [
  { id: 'colica', label: 'Cólica', icon: '🤕' },
  { id: 'inchaco', label: 'Inchaço', icon: '💧' },
  { id: 'fadiga', label: 'Fadiga', icon: '😴' },
  { id: 'acne', label: 'Acne', icon: '🔴' },
  { id: 'dor_cabeca', label: 'Dor de Cabeça', icon: '🤯' },
  { id: 'nausea', label: 'Náusea', icon: '🤢' },
  { id: 'seios', label: 'Sensibilidade nos Seios', icon: '💔' },
  { id: 'gases', label: 'Gases/Incômodo', icon: '💨' },
];

const MOODS = [
  { id: 'feliz', label: 'Feliz', emoji: '😊' },
  { id: 'normal', label: 'Normal', emoji: '😐' },
  { id: 'triste', label: 'Triste', emoji: '😢' },
  { id: 'irritada', label: 'Irritada', emoji: '😠' },
  { id: 'ansiosa', label: 'Ansiosa', emoji: '😰' },
];

function getCyclePhase(dayOfCycle: number): { phase: string; color: string; description: string } {
  if (dayOfCycle >= 1 && dayOfCycle <= 5) {
    return { phase: 'Menstruação', color: 'text-red-500', description: 'Dias de fluxo menstrual' };
  } else if (dayOfCycle >= 6 && dayOfCycle <= 13) {
    return { phase: 'Folicular', color: 'text-blue-500', description: 'Energia em alta, disposição para treinos' };
  } else if (dayOfCycle >= 14 && dayOfCycle <= 16) {
    return { phase: 'Ovulatória', color: 'text-pink-500', description: 'Pico de energia e confiança' };
  } else {
    return { phase: 'Lútea', color: 'text-yellow-500', description: 'Repouso e recuperação recomendados' };
  }
}

export default function Cycle() {
  const [, setLocation] = useLocation();
  const { state, addCycleEntry, updateCycleEntry, deleteCycleEntry } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // Form state para o dia selecionado
  const [dayForm, setDayForm] = useState<CycleDayEntry>({
    id: '',
    date: '',
    flow: 'medium',
    symptoms: [],
    mood: 'normal',
    energy: 'normal',
    libido: 'normal',
    sleep: 7,
    temperature: 36.5,
    notes: '',
  });

  const cycleEntries = state.cycleEntries || [];
  const lastCycle = useMemo(() => cycleEntries[0], [cycleEntries]);

  // Encontrar entrada do dia selecionado
  const selectedDayEntry = useMemo(() => {
    if (!selectedDate || !lastCycle) return null;
    return lastCycle.dayEntries?.find(e => e.date === selectedDate);
  }, [selectedDate, lastCycle]);

  // Calcular dias do mês
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    
    const existing = lastCycle?.dayEntries?.find(e => e.date === dateStr);
    if (existing) {
      setDayForm(existing);
    } else {
      setDayForm({
        id: '',
        date: dateStr,
        flow: undefined,
        symptoms: [],
        mood: 'normal',
        energy: 'normal',
        libido: 'normal',
        sleep: 7,
        temperature: 36.5,
        notes: '',
      });
    }
    setShowDayModal(true);
  };

  const handleSaveDay = () => {
    if (!selectedDate || !lastCycle) return;

    const existing = lastCycle.dayEntries?.find(e => e.date === selectedDate);
    if (existing) {
      // Atualizar
      const updatedDayEntries = lastCycle.dayEntries.map(e => 
        e.date === selectedDate ? { ...dayForm, id: e.id } : e
      );
      updateCycleEntry(lastCycle.id, { dayEntries: updatedDayEntries });
    } else {
      // Criar novo
      const newDayEntries = [...(lastCycle.dayEntries || []), { ...dayForm, id: Math.random().toString() }];
      updateCycleEntry(lastCycle.id, { dayEntries: newDayEntries });
    }
    
    setShowDayModal(false);
    toast.success('Dia registrado com sucesso!');
  };

  const handleStartNewCycle = () => {
    const today = new Date().toISOString().split('T')[0];
    addCycleEntry({
      startDate: today,
      cycleLengthDays: 28,
      dayEntries: [{
        id: Math.random().toString(),
        date: today,
        flow: 'medium',
        symptoms: [],
        mood: 'normal',
        energy: 'normal',
        libido: 'normal',
        sleep: 7,
        temperature: 36.5,
      }],
    });
    toast.success('Novo ciclo iniciado!');
  };

  // Renderizar calendário
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Calcular dia do ciclo para cada dia do mês
  const getDayOfCycle = (day: number | null): number | null => {
    if (!day || !lastCycle) return null;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const startDate = new Date(lastCycle.startDate);
    const currentDate = new Date(dateStr);
    const diffTime = currentDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 && diffDays <= (lastCycle.cycleLengthDays || 28) ? diffDays : null;
  };

  const getColorForDay = (day: number | null): string => {
    const dayOfCycle = getDayOfCycle(day);
    if (!dayOfCycle) return 'bg-white/5';
    const phase = getCyclePhase(dayOfCycle);
    if (phase.phase === 'Menstruação') return 'bg-red-500/20 border-red-500/30';
    if (phase.phase === 'Folicular') return 'bg-blue-500/20 border-blue-500/30';
    if (phase.phase === 'Ovulatória') return 'bg-pink-500/20 border-pink-500/30';
    return 'bg-yellow-500/20 border-yellow-500/30';
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => window.history.back()}
            className="rounded-full hover:bg-white/5"
          >
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Saúde Feminina
            </h1>
            <p className="text-sm text-white/50">Ciclo menstrual completo</p>
          </div>
        </div>
        {!lastCycle && (
          <Button 
            onClick={handleStartNewCycle}
            className="rounded-2xl gap-2"
            style={{ background: 'var(--theme-accent)', color: 'white' }}
          >
            <Plus size={18} />
            Iniciar
          </Button>
        )}
      </div>

      {lastCycle ? (
        <>
          {/* Calendário */}
          <Card className="p-6 border-white/5 bg-white/[0.03] mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 blur-[50px] rounded-full -mr-20 -mt-20" />
            
            {/* Cabeçalho do Calendário */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold text-white capitalize">{monthName}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="rounded-lg hover:bg-white/5"
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="rounded-lg hover:bg-white/5"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-4 relative z-10">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="text-center text-[11px] font-bold text-white/40 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-2 relative z-10">
              {days.map((day, idx) => {
                const dayOfCycle = getDayOfCycle(day);
                const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                const hasEntry = day && lastCycle.dayEntries?.some(e => e.date === dateStr);
                const isSelected = day && selectedDate === dateStr;

                return (
                  <motion.button
                    key={idx}
                    onClick={() => day && handleDayClick(day)}
                    disabled={!day}
                    className={`aspect-square rounded-lg border transition-all ${getColorForDay(day)} ${isSelected ? 'ring-2 ring-pink-500' : 'border-white/5'} ${day ? 'cursor-pointer hover:border-white/20' : 'cursor-default'}`}
                    whileTap={day ? { scale: 0.95 } : {}}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      {day && (
                        <>
                          <span className="text-sm font-bold text-white">{day}</span>
                          {dayOfCycle && (
                            <span className="text-[10px] text-white/60 font-medium">D{dayOfCycle}</span>
                          )}
                          {hasEntry && (
                            <span className="text-[8px] text-pink-400 mt-0.5">●</span>
                          )}
                        </>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Legenda de Fases */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Card className="p-3 border-white/5 bg-red-500/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="text-[11px]">
                <p className="font-bold text-white">Menstruação</p>
                <p className="text-white/50 text-[9px]">Dias 1-5</p>
              </div>
            </Card>
            <Card className="p-3 border-white/5 bg-blue-500/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div className="text-[11px]">
                <p className="font-bold text-white">Folicular</p>
                <p className="text-white/50 text-[9px]">Dias 6-13</p>
              </div>
            </Card>
            <Card className="p-3 border-white/5 bg-pink-500/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <div className="text-[11px]">
                <p className="font-bold text-white">Ovulatória</p>
                <p className="text-white/50 text-[9px]">Dias 14-16</p>
              </div>
            </Card>
            <Card className="p-3 border-white/5 bg-yellow-500/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="text-[11px]">
                <p className="font-bold text-white">Lútea</p>
                <p className="text-white/50 text-[9px]">Dias 17-28</p>
              </div>
            </Card>
          </div>

          {/* Dica da Fase Atual */}
          {lastCycle && lastCycle.dayEntries && lastCycle.dayEntries.length > 0 && (
            <Card className="p-4 border-white/5 bg-white/[0.03] mb-8 flex gap-3">
              <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white mb-1">Dica de Treino</p>
                <p className="text-[12px] text-white/60">
                  Adapte sua intensidade de treino de acordo com a fase do seu ciclo. Fases folicular e ovulatória são ideais para treinos mais intensos.
                </p>
              </div>
            </Card>
          )}

          {/* Histórico */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-pink-500" />
              Registros do Mês
            </h2>

            {lastCycle.dayEntries && lastCycle.dayEntries.length > 0 ? (
              <div className="space-y-3">
                {lastCycle.dayEntries.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => {
                  const dayOfCycle = getDayOfCycle(parseInt(entry.date.split('-')[2]));
                  const phase = dayOfCycle ? getCyclePhase(dayOfCycle) : null;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {new Date(entry.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'short' })}
                          </p>
                          {phase && (
                            <p className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${phase.color}`}>
                              {phase.phase}
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            if (lastCycle.dayEntries) {
                              updateCycleEntry(lastCycle.id, {
                                dayEntries: lastCycle.dayEntries.filter(e => e.id !== entry.id)
                              });
                              toast.success('Registro removido.');
                            }
                          }}
                          className="text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>

                      {/* Detalhes do Dia */}
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        {entry.flow && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Droplets size={14} className="text-red-400" />
                            <span>{entry.flow === 'light' ? 'Leve' : entry.flow === 'medium' ? 'Moderado' : 'Intenso'}</span>
                          </div>
                        )}
                        {entry.mood && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Heart size={14} className="text-pink-400" />
                            <span>{entry.mood}</span>
                          </div>
                        )}
                        {entry.energy && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Zap size={14} className="text-yellow-400" />
                            <span>Energia: {entry.energy}</span>
                          </div>
                        )}
                        {entry.sleep && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Moon size={14} className="text-blue-400" />
                            <span>{entry.sleep}h de sono</span>
                          </div>
                        )}
                      </div>

                      {entry.symptoms && entry.symptoms.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {entry.symptoms.map(symptom => {
                            const symptomData = SYMPTOMS.find(s => s.id === symptom);
                            return (
                              <span key={symptom} className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-white/70">
                                {symptomData?.label || symptom}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {entry.notes && (
                        <p className="mt-3 text-[11px] text-white/50 italic">"{entry.notes}"</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-white/5 rounded-[32px]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Heart size={32} className="text-white/20" />
                </div>
                <h3 className="text-white font-bold mb-1">Comece a registrar</h3>
                <p className="text-sm text-white/40">Clique em um dia no calendário para adicionar seus dados.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center mb-6">
            <Heart size={40} className="text-pink-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Bem-vinda!</h2>
          <p className="text-sm text-white/60 mb-6">Inicie seu rastreamento de ciclo menstrual para acompanhar sua saúde e otimizar seus treinos.</p>
          <Button 
            onClick={handleStartNewCycle}
            className="rounded-2xl gap-2"
            style={{ background: 'var(--theme-accent)', color: 'white' }}
          >
            <Plus size={18} />
            Iniciar Rastreamento
          </Button>
        </div>
      )}

      {/* Modal de Edição do Dia */}
      <AnimatePresence>
        {showDayModal && selectedDate && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowDayModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              className="relative w-full max-w-md bg-[#121418] border border-white/10 rounded-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CalendarIcon size={20} className="text-pink-500" />
                {new Date(selectedDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
              </h3>

              <div className="space-y-5">
                {/* Fluxo */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block flex items-center gap-2">
                    <Droplets size={14} />
                    Intensidade do Fluxo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'medium', 'heavy'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setDayForm({ ...dayForm, flow: f })}
                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                          dayForm.flow === f 
                            ? 'bg-red-500/20 border-red-500 text-red-500' 
                            : 'bg-white/5 border-white/5 text-white/40'
                        }`}
                      >
                        {f === 'light' ? 'Leve' : f === 'medium' ? 'Médio' : 'Intenso'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Humor */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block flex items-center gap-2">
                    <Heart size={14} />
                    Como você está se sentindo?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => setDayForm({ ...dayForm, mood: mood.id })}
                        className={`py-2 rounded-2xl text-lg transition-all border ${
                          dayForm.mood === mood.id 
                            ? 'bg-pink-500/20 border-pink-500' 
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                        title={mood.label}
                      >
                        {mood.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energia */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block flex items-center gap-2">
                    <Zap size={14} />
                    Nível de Energia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['baixa', 'normal', 'alta'] as const).map((e) => (
                      <button
                        key={e}
                        onClick={() => setDayForm({ ...dayForm, energy: e })}
                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                          dayForm.energy === e 
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' 
                            : 'bg-white/5 border-white/5 text-white/40'
                        }`}
                      >
                        {e === 'baixa' ? 'Baixa' : e === 'normal' ? 'Normal' : 'Alta'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Libido */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">
                    Libido
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['baixa', 'normal', 'alta'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setDayForm({ ...dayForm, libido: l })}
                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                          dayForm.libido === l 
                            ? 'bg-pink-500/20 border-pink-500 text-pink-500' 
                            : 'bg-white/5 border-white/5 text-white/40'
                        }`}
                      >
                        {l === 'baixa' ? 'Baixa' : l === 'normal' ? 'Normal' : 'Alta'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sono */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block flex items-center gap-2">
                    <Moon size={14} />
                    Horas de Sono
                  </label>
                  <input 
                    type="number" 
                    min="0" 
                    max="24" 
                    step="0.5"
                    value={dayForm.sleep}
                    onChange={(e) => setDayForm({ ...dayForm, sleep: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>

                {/* Temperatura */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block flex items-center gap-2">
                    <Thermometer size={14} />
                    Temperatura Corporal (°C)
                  </label>
                  <input 
                    type="number" 
                    min="35" 
                    max="40" 
                    step="0.1"
                    value={dayForm.temperature}
                    onChange={(e) => setDayForm({ ...dayForm, temperature: parseFloat(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>

                {/* Sintomas */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">
                    Sintomas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom.id}
                        onClick={() => {
                          const symptoms = dayForm.symptoms || [];
                          if (symptoms.includes(symptom.id)) {
                            setDayForm({ ...dayForm, symptoms: symptoms.filter(s => s !== symptom.id) });
                          } else {
                            setDayForm({ ...dayForm, symptoms: [...symptoms, symptom.id] });
                          }
                        }}
                        className={`py-2 px-3 rounded-2xl text-xs font-bold transition-all border flex items-center gap-2 ${
                          dayForm.symptoms?.includes(symptom.id) 
                            ? 'bg-pink-500/20 border-pink-500 text-pink-500' 
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                        }`}
                      >
                        <span>{symptom.icon}</span>
                        {symptom.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">
                    Notas Pessoais
                  </label>
                  <textarea 
                    value={dayForm.notes}
                    onChange={(e) => setDayForm({ ...dayForm, notes: e.target.value })}
                    placeholder="Como você se sentiu neste dia?"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors h-20 resize-none"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDayModal(false)}
                    className="flex-1 rounded-2xl text-white/60"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveDay}
                    className="flex-1 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold"
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
