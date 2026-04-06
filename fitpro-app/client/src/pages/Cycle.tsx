/**
 * FitPro — Women's Health & Cycle Tracking (Professional Edition)
 * Design: Ultra-Premium Soft Feminine
 * Acompanhamento profissional de ciclo menstrual com análise, educação e insights médicos.
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
  Download,
  BookOpen,
  BarChart3,
  Info,
  Settings,
  X,
  Shield,
  Lock,
  CheckCircle,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { useApp, CycleDayEntry, CycleProfile } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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
  hormones: { name: string; level: string; description: string }[];
  empowermentMessage?: string;
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
      hormones: [
        { name: 'Estrogênio', level: 'Baixo', description: 'Níveis mínimos de estrogênio' },
        { name: 'Progesterona', level: 'Baixa', description: 'Queda de progesterona causa menstruação' },
      ],
      empowermentMessage: 'Cuide de si mesma com gentileza. Seu corpo está se renovando e você merece repouso.',
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
      hormones: [
        { name: 'Estrogênio', level: 'Crescente', description: 'Aumento gradual de estrogênio' },
        { name: 'FSH', level: 'Alto', description: 'Hormônio folículo-estimulante em alta' },
      ],
      empowermentMessage: 'Sua energia está no topo! É o momento perfeito para conquistar seus objetivos.',
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
      hormones: [
        { name: 'LH', level: 'Pico', description: 'Hormônio luteinizante em seu pico máximo' },
        { name: 'Estrogênio', level: 'Pico', description: 'Estrogênio atinge seu nível máximo' },
      ],
      empowermentMessage: 'Você é imparável! Confiança, carisma e força em seu auge absoluto.',
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
      hormones: [
        { name: 'Progesterona', level: 'Alta', description: 'Progesterona em níveis elevados' },
        { name: 'Estrogênio', level: 'Moderado', description: 'Estrogênio em níveis moderados' },
      ],
      empowermentMessage: 'Introspectão e sabedoria. Ouça sua intuição e honre suas necessidades.',
    };
  }
}

export default function Cycle() {
  const [, setLocation] = useLocation();
  const { state, addCycleEntry, updateCycleEntry, deleteCycleEntry, updateCycleProfile } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'education'>('overview');
  const [profileForm, setProfileForm] = useState<Partial<CycleProfile>>({
    cycleLengthDays: 28,
    menstruationDays: 5,
    useContraceptive: false,
    objective: 'track',
  });

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

  // Sincronizar profileForm com cycleProfile do state
  useMemo(() => {
    if (state.cycleProfile) {
      setProfileForm(state.cycleProfile);
    }
  }, [state.cycleProfile]);

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

  const handleSaveProfile = () => {
    if (!profileForm.cycleLengthDays || !profileForm.menstruationDays) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }
    updateCycleProfile(profileForm as CycleProfile);
    setShowSettingsModal(false);
    toast.success('Perfil de ciclo atualizado com sucesso!');
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

  const handleExportReport = () => {
    if (!lastCycle) return;
    
    const reportData = {
      startDate: lastCycle.startDate,
      endDate: lastCycle.endDate,
      cycleLengthDays: lastCycle.cycleLengthDays,
      totalEntries: lastCycle.dayEntries?.length || 0,
      averageTemperature: (lastCycle.dayEntries?.reduce((sum, e) => sum + (e.temperature || 0), 0) || 0) / (lastCycle.dayEntries?.length || 1),
      averageSleep: (lastCycle.dayEntries?.reduce((sum, e) => sum + (e.sleep || 0), 0) || 0) / (lastCycle.dayEntries?.length || 1),
      mostCommonSymptoms: getMostCommonSymptoms(),
    };

    const reportText = `
RELATÓRIO DE CICLO MENSTRUAL
============================
Data de Início: ${new Date(lastCycle.startDate).toLocaleDateString('pt-BR')}
Duração do Ciclo: ${lastCycle.cycleLengthDays} dias
Registros Realizados: ${reportData.totalEntries}

DADOS MÉDICOS:
- Temperatura Média: ${reportData.averageTemperature.toFixed(1)}°C
- Horas de Sono Média: ${reportData.averageSleep.toFixed(1)}h
- Sintomas Mais Comuns: ${reportData.mostCommonSymptoms.join(', ') || 'Nenhum'}

Este relatório foi gerado automaticamente pelo FitPro.
Consulte seu médico para análise profissional.
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciclo_menstrual_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast.success('Relatório exportado com sucesso!');
  };

  const getMostCommonSymptoms = () => {
    const symptomCount: Record<string, number> = {};
    lastCycle?.dayEntries?.forEach(entry => {
      entry.symptoms?.forEach(symptom => {
        symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
      });
    });
    return Object.entries(symptomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom]) => SYMPTOMS.find(s => s.id === symptom)?.label || symptom);
  };

  // Dados para gráficos
  const temperatureData = useMemo(() => {
    return (lastCycle?.dayEntries || [])
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(entry => ({
        date: new Date(entry.date).getDate(),
        temperature: entry.temperature || 0,
      }));
  }, [lastCycle]);

  const sleepData = useMemo(() => {
    return (lastCycle?.dayEntries || [])
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(entry => ({
        date: new Date(entry.date).getDate(),
        sleep: entry.sleep || 0,
      }));
  }, [lastCycle]);

  const symptomFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    lastCycle?.dayEntries?.forEach(entry => {
      entry.symptoms?.forEach(symptom => {
        counts[symptom] = (counts[symptom] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([symptom, count]) => ({
      name: SYMPTOMS.find(s => s.id === symptom)?.label || symptom,
      count,
    }));
  }, [lastCycle]);

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

  const nextOvulation = useMemo(() => {
    if (!lastCycle) return null;
    const startDate = new Date(lastCycle.startDate);
    const ovulationDate = new Date(startDate);
    ovulationDate.setDate(ovulationDate.getDate() + 14);
    return ovulationDate.toISOString().split('T')[0];
  }, [lastCycle]);

  const currentPhaseInfo = useMemo(() => {
    if (!lastCycle) return null;
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(lastCycle.startDate);
    const currentDate = new Date(today);
    const diffTime = currentDate.getTime() - startDate.getTime();
    const dayOfCycle = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const isValidDay = dayOfCycle > 0 && dayOfCycle <= (lastCycle.cycleLengthDays || 28);
    return isValidDay ? getCyclePhaseInfo(dayOfCycle) : null;
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
        {lastCycle && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowSettingsModal(true)}
              className="rounded-2xl gap-2 bg-white/5 hover:bg-white/10 text-white"
            >
              <Settings size={16} />
              Perfil
            </Button>
            <Button 
              onClick={handleExportReport}
              className="rounded-2xl gap-2 bg-white/5 hover:bg-white/10 text-white"
            >
              <Download size={16} />
              Exportar
            </Button>
          </div>
        )}
      </div>

      {lastCycle ? (
        <>
          {/* Tabs de Navegação */}
          <div className="flex gap-2 border-b border-white/10">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Heart },
              { id: 'analysis', label: 'Análise', icon: BarChart3 },
              { id: 'education', label: 'Educação', icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-500'
                    : 'border-transparent text-white/50 hover:text-white/70'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Roda de Ciclo */}
              <Card className="p-8 border-white/5 bg-gradient-to-br from-pink-500/10 via-white/[0.03] to-purple-500/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/20 blur-[80px] rounded-full -mr-24 -mt-24" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/15 blur-[60px] rounded-full -ml-20 -mb-20" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center relative mb-6">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="20" strokeDasharray="47.1 282.6" strokeDashoffset="0" />
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="20" strokeDasharray="62.8 282.6" strokeDashoffset="-47.1" />
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="20" strokeDasharray="47.1 282.6" strokeDashoffset="-109.9" />
                      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(217, 119, 6, 0.3)" strokeWidth="20" strokeDasharray="125.6 282.6" strokeDashoffset="-157" />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Fase Atual</p>
                      <p className={`text-2xl font-bold mt-2 ${currentPhaseInfo?.color || 'text-pink-500'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {currentPhaseInfo?.phase || 'Lútea'}
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

              {/* Calendário em Grade Premium */}
              <div className="overflow-hidden rounded-3xl border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Ciclo Menstrual</p>
                    <h2 className="text-xl font-semibold text-white capitalize">{monthName} {currentMonth.getFullYear()}</h2>
                  </div>
                  <div className="flex gap-1">
                    <motion.button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <motion.button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                </div>

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold text-white/30 uppercase tracking-wider py-1">{d}</div>
                  ))}
                </div>

                {/* Grade de Dias */}
                <div className="grid grid-cols-7 gap-1 px-3 pb-3">
                  {days.map((day, idx) => {
                    const dayOfCycle = getDayOfCycle(day);
                    const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                    const hasEntry = day && lastCycle.dayEntries?.some(e => e.date === dateStr);
                    const isSelected = day && selectedDate === dateStr;
                    const isToday = day && dateStr === new Date().toISOString().split('T')[0];

                    // Cores por fase
                    let phaseBg = '';
                    let phaseText = 'text-white/70';
                    if (dayOfCycle) {
                      if (dayOfCycle <= 5) { phaseBg = 'bg-red-500/25 border-red-500/40'; phaseText = 'text-red-300'; }
                      else if (dayOfCycle <= 13) { phaseBg = 'bg-blue-500/20 border-blue-500/30'; phaseText = 'text-blue-300'; }
                      else if (dayOfCycle <= 16) { phaseBg = 'bg-pink-500/25 border-pink-500/40'; phaseText = 'text-pink-300'; }
                      else { phaseBg = 'bg-amber-500/20 border-amber-500/30'; phaseText = 'text-amber-300'; }
                    }

                    if (!day) return <div key={idx} className="aspect-square" />;

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleDayClick(day)}
                        className={`aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center gap-0.5 relative ${
                          isSelected
                            ? 'bg-white/20 border-white/50 shadow-lg shadow-white/10'
                            : dayOfCycle
                            ? `${phaseBg} hover:brightness-125`
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/10 hover:border-white/20'
                        }`}
                        whileHover={{ scale: 1.06 }}
                        whileTap={{ scale: 0.94 }}
                      >
                        {/* Ponto de hoje */}
                        {isToday && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400" />
                        )}

                        {/* Número do dia */}
                        <span className={`text-sm font-bold leading-none ${
                          isSelected ? 'text-white' : dayOfCycle ? phaseText : 'text-white/40'
                        }`}>
                          {day}
                        </span>

                        {/* Indicador de registro */}
                        {hasEntry && (
                          <motion.div
                            className="w-1 h-1 rounded-full bg-white/60"
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

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
            </motion.div>
          )}

          {/* TAB: ANÁLISE */}
          {activeTab === 'analysis' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Gráfico de Temperatura */}
              {temperatureData.length > 0 && (
                <Card className="p-6 border-white/5 bg-white/[0.03]">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Thermometer size={16} className="text-red-400" />
                    Temperatura Corporal
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={temperatureData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" />
                      <YAxis stroke="rgba(255,255,255,0.3)" domain={[35, 38]} />
                      <Tooltip contentStyle={{ background: '#1a1620', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Line type="monotone" dataKey="temperature" stroke="#ef4444" dot={{ fill: '#ef4444' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Gráfico de Sono */}
              {sleepData.length > 0 && (
                <Card className="p-6 border-white/5 bg-white/[0.03]">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Moon size={16} className="text-blue-400" />
                    Horas de Sono
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sleepData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" />
                      <YAxis stroke="rgba(255,255,255,0.3)" />
                      <Tooltip contentStyle={{ background: '#1a1620', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Bar dataKey="sleep" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Frequência de Sintomas */}
              {symptomFrequency.length > 0 && (
                <Card className="p-6 border-white/5 bg-white/[0.03]">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle size={16} className="text-yellow-400" />
                    Sintomas Mais Frequentes
                  </h3>
                  <div className="space-y-3">
                    {symptomFrequency.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm text-white/70">{item.name}</p>
                          <p className="text-sm font-bold text-pink-500">{item.count}x</p>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / Math.max(...symptomFrequency.map(s => s.count))) * 100}%` }}
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Estatísticas Resumidas */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-white/5 bg-white/[0.03]">
                  <p className="text-[11px] text-white/60 uppercase tracking-wider font-bold">Temperatura Média</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {(temperatureData.reduce((sum, d) => sum + d.temperature, 0) / temperatureData.length || 0).toFixed(1)}°C
                  </p>
                </Card>
                <Card className="p-4 border-white/5 bg-white/[0.03]">
                  <p className="text-[11px] text-white/60 uppercase tracking-wider font-bold">Sono Médio</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {(sleepData.reduce((sum, d) => sum + d.sleep, 0) / sleepData.length || 0).toFixed(1)}h
                  </p>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB: EDUCAÇÃO */}
          {activeTab === 'education' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {currentPhaseInfo && (
                <>
                  <Card className="p-6 border-white/5 bg-white/[0.03]">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <BookOpen size={18} className="text-blue-400" />
                      Hormônios na Fase {currentPhaseInfo.phase}
                    </h3>
                    <div className="space-y-4">
                      {currentPhaseInfo.hormones.map((hormone, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-white">{hormone.name}</h4>
                            <span className="px-2 py-1 rounded-lg bg-pink-500/20 text-pink-500 text-[10px] font-bold">
                              {hormone.level}
                            </span>
                          </div>
                          <p className="text-sm text-white/70">{hormone.description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 border-white/5 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Info size={18} className="text-cyan-400" />
                      Dica Profissional
                    </h3>
                    <p className="text-sm text-white/80">
                      Durante a fase {currentPhaseInfo.phase.toLowerCase()}, seu corpo passa por mudanças hormonais significativas. 
                      Acompanhe seus sintomas e padrões para identificar anomalias e compartilhe esses dados com seu médico durante consultas.
                    </p>
                  </Card>
                </>
              )}
            </motion.div>
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

      {/* Modal de Configurações de Perfil */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowSettingsModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              className="relative w-full max-w-md bg-gradient-to-br from-[#1a1620] to-[#121418] border border-white/10 rounded-[32px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart size={20} className="text-pink-500" />
                  Meu Perfil Biológico
                </h3>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Duração do Ciclo */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">Duração Média do Ciclo (dias)</label>
                  <input 
                    type="number" 
                    min="21" 
                    max="35" 
                    value={profileForm.cycleLengthDays || 28}
                    onChange={(e) => setProfileForm({ ...profileForm, cycleLengthDays: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>

                {/* Duração da Menstruação */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">Duração da Menstruação (dias)</label>
                  <input 
                    type="number" 
                    min="2" 
                    max="10" 
                    value={profileForm.menstruationDays || 5}
                    onChange={(e) => setProfileForm({ ...profileForm, menstruationDays: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>

                {/* Última Menstruação */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">Última Menstruação</label>
                  <input 
                    type="date" 
                    value={profileForm.lastMenstruationDate || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, lastMenstruationDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>

                {/* Anticoncepcional */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block flex items-center gap-2">
                    <Heart size={14} />
                    Usa Anticoncepcional?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'Sim', value: true }, { label: 'Não', value: false }].map(opt => (
                      <button
                        key={String(opt.value)}
                        onClick={() => setProfileForm({ ...profileForm, useContraceptive: opt.value })}
                        className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                          profileForm.useContraceptive === opt.value
                            ? 'bg-pink-500/20 border-pink-500 text-pink-500'
                            : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de Anticoncepcional */}
                {profileForm.useContraceptive && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">Tipo de Anticoncepcional</label>
                    <select 
                      value={profileForm.contraceptiveType || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, contraceptiveType: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                    >
                      <option value="">Selecione...</option>
                      <option value="pilula">Pílula</option>
                      <option value="diu">DIU</option>
                      <option value="injecao">Injeção</option>
                      <option value="implante">Implante</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                )}

                {/* Objetivo */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block flex items-center gap-2">
                    <Sparkles size={14} />
                    Qual é seu Objetivo?
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'track', label: 'Acompanhar ciclo', description: 'Entender melhor meu ciclo' },
                      { id: 'conceive', label: 'Engravidar', description: 'Identificar dias férteis' },
                      { id: 'avoid', label: 'Evitar gravidez', description: 'Usar como método contraceptivo' },
                      { id: 'performance', label: 'Performance esportiva', description: 'Otimizar treinos' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setProfileForm({ ...profileForm, objective: opt.id as any })}
                        className={`w-full p-3 rounded-2xl text-left transition-all border ${
                          profileForm.objective === opt.id
                            ? 'bg-pink-500/20 border-pink-500'
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <p className={`text-xs font-bold ${profileForm.objective === opt.id ? 'text-pink-500' : 'text-white'}`}>{opt.label}</p>
                        <p className="text-[10px] text-white/50 mt-1">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 rounded-2xl text-white/60 hover:bg-white/5"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
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

      {/* Rodapé Premium */}
      <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
        {/* Mensagem de Empoderamento */}
        {currentPhaseInfo && (
          <div className="px-4 py-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
            <p className="text-sm text-white/80 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span className="font-bold text-pink-400">💪 {currentPhaseInfo.phase}:</span> {currentPhaseInfo.empowermentMessage || 'Você é forte e capaz de conquistar seus objetivos!'}
            </p>
          </div>
        )}

        {/* Selos de Segurança e Privacidade */}
        <div className="px-4">
          <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-3">Segurança e Privacidade</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-colors">
              <Shield size={20} className="text-green-500" />
              <p className="text-[10px] text-white/60 text-center">Dados Criptografados</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
              <Lock size={20} className="text-blue-500" />
              <p className="text-[10px] text-white/60 text-center">Privacidade 100%</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors">
              <CheckCircle size={20} className="text-purple-500" />
              <p className="text-[10px] text-white/60 text-center">Verificado</p>
            </div>
          </div>
        </div>



        {/* Estatísticas Pessoais */}
        {lastCycle && lastCycle.dayEntries && lastCycle.dayEntries.length > 0 && (
          <div className="px-4">
            <p className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-3">Seu Histórico</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 text-center">
                <p className="text-xl font-bold text-pink-400">{lastCycle.dayEntries.length}</p>
                <p className="text-[10px] text-white/60 mt-1">Dias Registrados</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
                <p className="text-xl font-bold text-blue-400">{lastCycle.cycleLengthDays}</p>
                <p className="text-[10px] text-white/60 mt-1">Dias do Ciclo</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
                <p className="text-xl font-bold text-purple-400">{Math.round((lastCycle.dayEntries.length / lastCycle.cycleLengthDays) * 100)}%</p>
                <p className="text-[10px] text-white/60 mt-1">Preenchimento</p>
              </div>
            </div>
          </div>
        )}

        {/* Assinatura Premium */}
        <div className="px-4 py-4 border-t border-white/5 text-center">
          <p className="text-[11px] text-white/40 mb-2">FitPro Women's Edition</p>
          <p className="text-[10px] text-white/30">Cuidando da sua saúde, ciclo após ciclo</p>
          <p className="text-[9px] text-white/20 mt-2">© 2024 FitPro. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
