/**
 * FitPro — Women's Health & Cycle Tracking
 * Design: Premium Soft Feminine
 * Acompanhamento completo de ciclo menstrual, saúde e bem-estar feminino.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Dumbbell,
  Apple,
  Heart,
  Droplets,
  Trash2,
  Zap,
  Moon,
  Thermometer,
  AlertCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useApp, CycleDayEntry } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

const SYMPTOMS = [
  { id: 'colica', label: 'Cólica', emoji: '🤕' },
  { id: 'inchaco', label: 'Inchaço', emoji: '💧' },
  { id: 'fadiga', label: 'Fadiga', emoji: '😴' },
  { id: 'acne', label: 'Acne', emoji: '🔴' },
  { id: 'dor_cabeca', label: 'Dor de Cabeça', emoji: '🤯' },
  { id: 'nausea', label: 'Náusea', emoji: '🤢' },
  { id: 'seios', label: 'Sensibilidade nos Seios', emoji: '💔' },
  { id: 'gases', label: 'Gases/Incômodo', emoji: '💨' },
];

const MOODS = [
  { id: 'feliz', label: 'Feliz', emoji: '😊' },
  { id: 'normal', label: 'Normal', emoji: '😐' },
  { id: 'triste', label: 'Triste', emoji: '😢' },
  { id: 'irritada', label: 'Irritada', emoji: '😠' },
  { id: 'ansiosa', label: 'Ansiosa', emoji: '😰' },
];

interface PhaseInfo {
  phase: string;
  dayRange: string;
  color: string;
  bgColor: string;
  description: string;
  trainingTip: string;
  nutritionTip: string;
  symptoms: string[];
}

function getCyclePhaseInfo(dayOfCycle: number): PhaseInfo {
  if (dayOfCycle >= 1 && dayOfCycle <= 5) {
    return {
      phase: 'Menstruação',
      dayRange: 'Dias 1-5',
      color: 'text-red-500',
      bgColor: 'from-red-500/20 to-rose-500/10',
      description: 'Período de repouso e regeneração',
      trainingTip: 'Foco em atividades leves: yoga, pilates, caminhada. Evite treinos de alta intensidade.',
      nutritionTip: 'Aumente ferro (carnes vermelhas, feijão) e magnésio. Hidrate-se bem.',
      symptoms: ['cólica', 'fadiga', 'inchaco'],
    };
  } else if (dayOfCycle >= 6 && dayOfCycle <= 13) {
    return {
      phase: 'Folicular',
      dayRange: 'Dias 6-13',
      color: 'text-blue-500',
      bgColor: 'from-blue-500/20 to-cyan-500/10',
      description: 'Energia crescente e disposição máxima',
      trainingTip: 'Ideal para treinos de força e alta intensidade. Seu corpo está pronto para desafios!',
      nutritionTip: 'Aumente proteína e carboidratos complexos. Seu metabolismo está acelerado.',
      symptoms: [],
    };
  } else if (dayOfCycle >= 14 && dayOfCycle <= 16) {
    return {
      phase: 'Ovulatória',
      dayRange: 'Dias 14-16',
      color: 'text-pink-500',
      bgColor: 'from-pink-500/20 to-fuchsia-500/10',
      description: 'Pico de confiança e energia',
      trainingTip: 'Melhor momento para estabelecer recordes pessoais. Máxima força e resistência.',
      nutritionTip: 'Mantenha proteína alta. Aproveite o metabolismo acelerado.',
      symptoms: [],
    };
  } else {
    return {
      phase: 'Lútea',
      dayRange: 'Dias 17-28',
      color: 'text-amber-500',
      bgColor: 'from-amber-500/20 to-yellow-500/10',
      description: 'Fase de repouso e autoconhecimento',
      trainingTip: 'Priorize cardio leve, alongamento e meditação. Ouça seu corpo.',
      nutritionTip: 'Aumente cálcio e magnésio. Controle desejos por doces com alimentos integrais.',
      symptoms: ['inchaco', 'fadiga', 'acne'],
    };
  }
}

export default function Cycle() {
  const [, setLocation] = useLocation();
  const { state, addCycleEntry, updateCycleEntry, deleteCycleEntry } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

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

  const selectedDayEntry = useMemo(() => {
    if (!selectedDate || !lastCycle) return null;
    return lastCycle.dayEntries?.find(e => e.date === selectedDate);
  }, [selectedDate, lastCycle]);

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
      const updatedDayEntries = lastCycle.dayEntries.map(e => 
        e.date === selectedDate ? { ...dayForm, id: e.id } : e
      );
      updateCycleEntry(lastCycle.id, { dayEntries: updatedDayEntries });
    } else {
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
    if (!dayOfCycle) return 'bg-white/5 border-white/5';
    const phase = getCyclePhaseInfo(dayOfCycle);
    if (phase.phase === 'Menstruação') return 'bg-red-500/15 border-red-500/40 hover:border-red-500/60';
    if (phase.phase === 'Folicular') return 'bg-blue-500/15 border-blue-500/40 hover:border-blue-500/60';
    if (phase.phase === 'Ovulatória') return 'bg-pink-500/15 border-pink-500/40 hover:border-pink-500/60';
    return 'bg-amber-500/15 border-amber-500/40 hover:border-amber-500/60';
  };

  // Calcular próxima ovulação e janela fértil
  const nextOvulation = useMemo(() => {
    if (!lastCycle) return null;
    const startDate = new Date(lastCycle.startDate);
    const ovulationDate = new Date(startDate);
    ovulationDate.setDate(ovulationDate.getDate() + 14);
    return ovulationDate.toISOString().split('T')[0];
  }, [lastCycle]);

  const currentPhaseInfo = useMemo(() => {
    if (!lastCycle || !lastCycle.dayEntries || lastCycle.dayEntries.length === 0) return null;
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = lastCycle.dayEntries.find(e => e.date === today);
    const dayOfCycle = getDayOfCycle(new Date().getDate());
    return dayOfCycle ? getCyclePhaseInfo(dayOfCycle) : null;
  }, [lastCycle]);

  return (
    <div className="pb-24 space-y-6">
      {/* Header Premium */}
      <div className="flex items-center justify-between pt-2">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-300 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Saúde Feminina
            </h1>
            <p className="text-sm text-white/50">Seu ciclo, sua força, seu bem-estar</p>
          </div>
        </div>
        {!lastCycle && (
          <Button 
            onClick={handleStartNewCycle}
            className="rounded-2xl gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', color: 'white' }}
          >
            <Plus size={18} />
            Iniciar
          </Button>
        )}
      </div>

      {lastCycle ? (
        <>
          {/* Roda de Ciclo - Visualização Circular */}
          <Card className="p-8 border-white/5 bg-gradient-to-br from-pink-500/10 via-white/[0.03] to-purple-500/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/20 blur-[80px] rounded-full -mr-24 -mt-24" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/15 blur-[60px] rounded-full -ml-20 -mb-20" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center relative mb-6">
                {/* Roda de ciclo SVG */}
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  {/* Menstruação */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="20" strokeDasharray="47.1 282.6" strokeDashoffset="0" />
                  {/* Folicular */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="20" strokeDasharray="62.8 282.6" strokeDashoffset="-47.1" />
                  {/* Ovulatória */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="20" strokeDasharray="47.1 282.6" strokeDashoffset="-109.9" />
                  {/* Lútea */}
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(217, 119, 6, 0.3)" strokeWidth="20" strokeDasharray="125.6 282.6" strokeDashoffset="-157" />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Fase Atual</p>
                  <p className={`text-2xl font-bold mt-2 ${currentPhaseInfo?.color || 'text-pink-500'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {currentPhaseInfo?.phase || 'Carregando...'}
                  </p>
                </div>
              </div>

              {currentPhaseInfo && (
                <div className="text-center">
                  <p className="text-sm text-white/70 mb-3">{currentPhaseInfo.description}</p>
                  <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <p className="text-[11px] text-white/60">{currentPhaseInfo.dayRange}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Insights de Treino e Nutrição */}
          {currentPhaseInfo && (
            <div className="grid grid-cols-1 gap-4">
              <Card className={`p-5 border-white/5 bg-gradient-to-br ${currentPhaseInfo.bgColor} overflow-hidden relative`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full -mr-16 -mt-16" />
                
                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Dumbbell size={20} className={currentPhaseInfo.color} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold">Recomendação de Treino</p>
                      <p className="text-sm text-white font-semibold mt-1">{currentPhaseInfo.trainingTip}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={`p-5 border-white/5 bg-gradient-to-br ${currentPhaseInfo.bgColor} overflow-hidden relative`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full -mr-16 -mt-16" />
                
                <div className="relative z-10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Apple size={20} className={currentPhaseInfo.color} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold">Recomendação Nutricional</p>
                      <p className="text-sm text-white font-semibold mt-1">{currentPhaseInfo.nutritionTip}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Próximas Datas Importantes */}
          <Card className="p-5 border-white/5 bg-white/[0.03]">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={18} className="text-yellow-400" />
              <h3 className="text-sm font-bold text-white">Próximas Datas Importantes</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
                <div>
                  <p className="text-[11px] text-white/60 uppercase tracking-wider font-bold">Próxima Ovulação</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {nextOvulation ? new Date(nextOvulation).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : '--'}
                  </p>
                </div>
                <Heart size={20} className="text-pink-500" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div>
                  <p className="text-[11px] text-white/60 uppercase tracking-wider font-bold">Próxima Menstruação</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {lastCycle ? new Date(new Date(lastCycle.startDate).getTime() + (lastCycle.cycleLengthDays || 28) * 86400000).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : '--'}
                  </p>
                </div>
                <Droplets size={20} className="text-blue-500" />
              </div>
            </div>
          </Card>

          {/* Calendário */}
          <Card className="p-6 border-white/5 bg-white/[0.03] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/10 blur-[50px] rounded-full -mr-20 -mt-20" />
            
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

            <div className="grid grid-cols-7 gap-2 mb-4 relative z-10">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="text-center text-[11px] font-bold text-white/40 uppercase">
                  {day}
                </div>
              ))}
            </div>

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
                    className={`aspect-square rounded-lg border transition-all ${getColorForDay(day)} ${isSelected ? 'ring-2 ring-pink-500' : ''} ${day ? 'cursor-pointer' : 'cursor-default'}`}
                    whileTap={day ? { scale: 0.95 } : {}}
                  >
                    <div className="h-full flex flex-col items-center justify-center">
                      {day && (
                        <>
                          <span className="text-sm font-bold text-white">{day}</span>
                          {dayOfCycle && (
                            <span className="text-[9px] text-white/60 font-medium">D{dayOfCycle}</span>
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
          <div className="grid grid-cols-2 gap-3">
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
            <Card className="p-3 border-white/5 bg-amber-500/10 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="text-[11px]">
                <p className="font-bold text-white">Lútea</p>
                <p className="text-white/50 text-[9px]">Dias 17-28</p>
              </div>
            </Card>
          </div>

          {/* Histórico */}
          {lastCycle.dayEntries && lastCycle.dayEntries.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-pink-500" />
                Histórico do Mês
              </h2>

              <div className="space-y-3">
                {lastCycle.dayEntries.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => {
                  const dayOfCycle = getDayOfCycle(parseInt(entry.date.split('-')[2]));
                  const phase = dayOfCycle ? getCyclePhaseInfo(dayOfCycle) : null;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all"
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

                      <div className="grid grid-cols-2 gap-3 text-[11px] mb-3">
                        {entry.flow && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Droplets size={14} className="text-red-400" />
                            <span>{entry.flow === 'light' ? 'Leve' : entry.flow === 'medium' ? 'Moderado' : 'Intenso'}</span>
                          </div>
                        )}
                        {entry.mood && (
                          <div className="flex items-center gap-2 text-white/60">
                            <Heart size={14} className="text-pink-400" />
                            <span>{MOODS.find(m => m.id === entry.mood)?.label || entry.mood}</span>
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
                        <div className="flex flex-wrap gap-2 mb-3">
                          {entry.symptoms.map(symptom => {
                            const symptomData = SYMPTOMS.find(s => s.id === symptom);
                            return (
                              <span key={symptom} className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-white/70">
                                {symptomData?.emoji} {symptomData?.label || symptom}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {entry.notes && (
                        <p className="text-[11px] text-white/50 italic border-l-2 border-pink-500/30 pl-3">"{entry.notes}"</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center px-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-6">
            <Heart size={48} className="text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Bem-vinda!</h2>
          <p className="text-sm text-white/60 mb-8 max-w-sm">Inicie seu rastreamento de ciclo menstrual para acompanhar sua saúde, otimizar seus treinos e compreender melhor seu corpo.</p>
          <Button 
            onClick={handleStartNewCycle}
            className="rounded-2xl gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)', color: 'white' }}
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
              className="relative w-full max-w-md bg-gradient-to-br from-[#1a1620] to-[#121418] border border-white/10 rounded-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
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
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
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
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
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
                        <span>{symptom.emoji}</span>
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
                    className="flex-1 rounded-2xl text-white/60 hover:bg-white/5"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveDay}
                    className="flex-1 rounded-2xl text-white font-bold"
                    style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' }}
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
