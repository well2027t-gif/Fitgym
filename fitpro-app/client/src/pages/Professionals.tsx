/**
 * FitPro — Professionals Page
 * Design: Premium Dark Fitness
 * Conexão com profissionais (Personal Trainers, Nutricionistas, etc.)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Star, MessageCircle, Dumbbell, Apple, Award
} from 'lucide-react';
import { useLocation } from '@/lib/router';
import { toast } from 'sonner';
import { useProfessionalChat, type Professional } from '@/contexts/ProfessionalChatContext';

const PROFESSIONALS = [
  {
    id: '1',
    name: 'Coach Rafael',
    type: 'personal',
    rating: 4.9,
    availability: 'Disponível agora',
    specialties: ['Hipertrofia', 'Força'],
    description: 'Especialista em hipertrofia e recomposição corporal.',
    avatar: '👨‍🏫',
  },
  {
    id: '2',
    name: 'Nutricionista Ana',
    type: 'nutritionist',
    rating: 4.8,
    availability: 'Disponível em 2h',
    specialties: ['Emagrecimento', 'Performance'],
    description: 'Especialista em nutrição esportiva e reeducação alimentar.',
    avatar: '👩‍⚕️',
  },
  {
    id: '3',
    name: 'Coach Marina',
    type: 'personal',
    rating: 4.7,
    availability: 'Disponível amanhã',
    specialties: ['Funcional', 'Mobilidade'],
    description: 'Especialista em treinos funcionais e prevenção de lesões.',
    avatar: '👩‍🏫',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export default function Professionals() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'personais' | 'nutricionistas'>('personais');
  const { startChat } = useProfessionalChat();

  const filteredProfessionals = PROFESSIONALS.filter(p => {
    if (activeTab === 'personais') return p.type === 'personal';
    return p.type === 'nutritionist';
  });

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-12 pb-4 flex items-center justify-between" style={{
        background: 'linear-gradient(to bottom, #0d0d0f 70%, transparent)',
        backdropFilter: 'blur(12px)',
      }}>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Profissionais</h1>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
              Escolha seu acompanhamento
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-24">
        {/* Premium Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitpro-card p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.2) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(var(--theme-accent-rgb), 0.2)',
            boxShadow: '0 0 30px rgba(var(--theme-accent-rgb), 0.1)',
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)' }}>
              <Award size={18} style={{ color: 'var(--theme-accent)' }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>
                Atendimento Premium
              </p>
              <p className="text-sm font-bold text-white mt-1" style={{ fontFamily: 'Space Grotesk' }}>
                Converse direto com seu especialista
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                Escolha um profissional e inicie o chat imediato.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('personais')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === 'personais' ? 'var(--theme-accent)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'personais' ? '#0d0d0f' : 'rgba(255,255,255,0.6)',
              border: activeTab === 'personais' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Space Grotesk',
            }}
          >
            Personais
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('nutricionistas')}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === 'nutricionistas' ? 'var(--theme-accent)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'nutricionistas' ? '#0d0d0f' : 'rgba(255,255,255,0.6)',
              border: activeTab === 'nutricionistas' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'Space Grotesk',
            }}
          >
            Nutricionistas
          </motion.button>
        </div>

        {/* Professionals List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {filteredProfessionals.map((prof, idx) => (
              <motion.div
                key={prof.id}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="fitpro-card p-4 border border-white/10"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {prof.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                        {prof.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star size={14} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                        <span className="text-xs font-bold text-white">{prof.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                      {prof.availability}
                    </p>
                  </div>
                </div>

                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit' }}>
                  {prof.description}
                </p>

                <div className="flex gap-2 mb-3">
                  {prof.specialties.map(spec => (
                    <span
                      key={spec}
                      className="text-[10px] px-2.5 py-1 rounded-lg font-semibold"
                      style={{
                        background: 'rgba(var(--theme-accent-rgb), 0.1)',
                        color: 'var(--theme-accent)',
                        fontFamily: 'Outfit',
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    startChat(prof as Professional);
                    navigate(`/profissionais/chat/${prof.id}`);
                    toast.success(`Chat iniciado com ${prof.name}!`);
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'var(--theme-accent)',
                    color: '#0d0d0f',
                    fontFamily: 'Space Grotesk',
                  }}
                >
                  <MessageCircle size={16} />
                  Conversar
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
