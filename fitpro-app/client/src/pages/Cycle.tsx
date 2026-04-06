/**
 * FitPro — Cycle Tracking Page
 * Design: Premium Dark Fitness
 * Acompanhamento de ciclo menstrual e saúde feminina.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  History, 
  Activity, 
  Heart,
  Droplets,
  Trash2,
  Info
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Cycle() {
  const [, setLocation] = useLocation();
  const { state, addCycleEntry, deleteCycleEntry } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [notes, setNotes] = useState('');

  const cycleEntries = state.cycleEntries || [];

  const lastEntry = useMemo(() => {
    if (cycleEntries.length === 0) return null;
    return cycleEntries[0]; // Already sorted by date in context
  }, [cycleEntries]);

  const nextPeriodEstimate = useMemo(() => {
    if (!lastEntry) return null;
    const date = new Date(lastEntry.startDate);
    date.setDate(date.getDate() + 28); // Average cycle
    return date.toISOString().split('T')[0];
  }, [lastEntry]);

  const handleAddEntry = () => {
    addCycleEntry({
      startDate,
      flow,
      notes,
      symptoms: [],
    });
    setShowAddModal(false);
    toast.success('Registro adicionado com sucesso!');
    // Reset form
    setStartDate(new Date().toISOString().split('T')[0]);
    setFlow('medium');
    setNotes('');
  };

  const handleDelete = (id: string) => {
    deleteCycleEntry(id);
    toast.success('Registro removido.');
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
            <p className="text-sm text-white/50">Acompanhe seu ciclo menstrual</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="rounded-2xl gap-2"
          style={{ background: 'var(--theme-accent)', color: 'white' }}
        >
          <Plus size={18} />
          Registrar
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <Card className="p-5 border-white/5 bg-white/[0.03] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-[50px] rounded-full -mr-16 -mt-16" />
          
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-500">
              <CalendarIcon size={24} />
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Próximo Ciclo (Estimativa)</span>
              <p className="text-xl font-bold text-white mt-1">
                {nextPeriodEstimate ? new Date(nextPeriodEstimate).toLocaleDateString('pt-BR') : '--/--/----'}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Último início</span>
              <span className="text-white font-medium">
                {lastEntry ? new Date(lastEntry.startDate).toLocaleDateString('pt-BR') : 'Nenhum registro'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: lastEntry ? '65%' : '0%' }}
                className="h-full bg-pink-500"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Info Sections */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-4 border-white/5 bg-white/[0.02] flex flex-col gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <Droplets size={16} />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 font-bold">Fluxo Médio</p>
            <p className="text-sm font-semibold text-white mt-0.5">Normal</p>
          </div>
        </Card>
        <Card className="p-4 border-white/5 bg-white/[0.02] flex flex-col gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
            <Activity size={16} />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 font-bold">Fase Atual</p>
            <p className="text-sm font-semibold text-white mt-0.5">Folicular</p>
          </div>
        </Card>
      </div>

      {/* History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History size={18} className="text-pink-500" />
            Histórico
          </h2>
        </div>

        {cycleEntries.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-white/5 rounded-[32px]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Heart size={32} className="text-white/20" />
            </div>
            <h3 className="text-white font-bold mb-1">Nenhum registro ainda</h3>
            <p className="text-sm text-white/40">Comece a registrar seu ciclo para ter previsões e insights.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cycleEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-[24px] bg-white/[0.03] border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <Droplets size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {new Date(entry.startDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      Fluxo: {entry.flow === 'light' ? 'Leve' : entry.flow === 'medium' ? 'Moderado' : 'Intenso'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(entry.id)}
                  className="text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                >
                  <Trash2 size={16} />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Simulado */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 sm:items-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="relative w-full max-w-md bg-[#121418] border border-white/10 rounded-[32px] p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-pink-500" />
              Novo Registro
            </h3>

            <div className="space-y-5">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">Data de Início</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">Intensidade do Fluxo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'medium', 'heavy'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFlow(f)}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                        flow === f 
                          ? 'bg-pink-500/20 border-pink-500 text-pink-500' 
                          : 'bg-white/5 border-white/5 text-white/40'
                      }`}
                    >
                      {f === 'light' ? 'Leve' : f === 'medium' ? 'Médio' : 'Intenso'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/40 font-bold mb-2 block">Notas (Opcional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Como você está se sentindo?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl text-white/60"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddEntry}
                  className="flex-1 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold"
                >
                  Salvar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
