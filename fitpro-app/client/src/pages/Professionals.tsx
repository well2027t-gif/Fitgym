/**
 * FitPro Preview — Professionals Page
 * Direção visual: luxo técnico escuro, foco em acompanhamento humano e acesso imediato ao chat.
 * Esta tela replica somente a navegação necessária para continuar o trabalho interrompido.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, ChevronLeft, MessageCircle, Star } from 'lucide-react';
import { useLocation } from '@/lib/router';
import { useProfessionalChat } from '@/contexts/ProfessionalChatContext';
import { PROFESSIONALS } from '@/lib/professionals';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.28, ease: 'easeOut' as const },
  }),
};

export default function Professionals() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<'personais' | 'nutricionistas'>('personais');
  const { startChat } = useProfessionalChat();

  const filteredProfessionals = PROFESSIONALS.filter((professional) => {
    if (activeTab === 'personais') return professional.type === 'personal';
    return professional.type === 'nutritionist';
  });

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white">
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 pt-8 pb-4"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,13,15,0.98) 72%, rgba(13,13,15,0))',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,255,255,0.78)' }} />
          </motion.button>
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: 'rgba(64,208,160,0.88)', fontFamily: 'Outfit, sans-serif' }}
            >
              Acompanhamento
            </p>
            <h1 className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Profissionais
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] p-5"
          style={{
            background:
              'radial-gradient(circle at top right, rgba(64,208,160,0.18) 0%, rgba(64,208,160,0) 42%), linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.025) 100%)',
            border: '1px solid rgba(64,208,160,0.18)',
            boxShadow: '0 18px 44px rgba(0,0,0,0.28)',
          }}
        >
          <div className="mb-3 flex items-start gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(64,208,160,0.12)', border: '1px solid rgba(64,208,160,0.14)' }}
            >
              <Award size={18} style={{ color: '#40d0a0' }} />
            </div>
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: '#7ff0cb', fontFamily: 'Outfit, sans-serif' }}
              >
                Atendimento premium
              </p>
              <h2 className="mt-1 text-base font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Converse direto com seu especialista
              </h2>
              <p className="mt-1 text-[13px] leading-5" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: 'Outfit, sans-serif' }}>
                Escolha um profissional e continue a experiência de chat que estava sendo ajustada.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-2 rounded-[22px] p-1.5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('personais')}
            className="rounded-[18px] px-3 py-3 text-sm font-semibold"
            style={{
              background: activeTab === 'personais' ? '#40d0a0' : 'transparent',
              color: activeTab === 'personais' ? '#08110e' : 'rgba(255,255,255,0.62)',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Personais
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('nutricionistas')}
            className="rounded-[18px] px-3 py-3 text-sm font-semibold"
            style={{
              background: activeTab === 'nutricionistas' ? '#40d0a0' : 'transparent',
              color: activeTab === 'nutricionistas' ? '#08110e' : 'rgba(255,255,255,0.62)',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Nutricionistas
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className="space-y-3"
          >
            {filteredProfessionals.map((professional, index) => (
              <motion.div
                key={professional.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="rounded-[26px] p-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.028) 100%)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.24)',
                }}
              >
                <div className="mb-3 flex items-start gap-3">
                  <img
                    src={professional.avatar}
                    alt={professional.name}
                    className="h-14 w-14 flex-shrink-0 rounded-[20px] object-cover"
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h3 className="truncate text-sm font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                        {professional.name}
                      </h3>
                      <div className="flex items-center gap-1 rounded-full px-2 py-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Star size={13} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                        <span className="text-[11px] font-bold text-white">{professional.rating}</span>
                      </div>
                    </div>
                    <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit, sans-serif' }}>
                      {professional.availability}
                    </p>
                  </div>
                </div>

                <p className="mb-3 text-[13px] leading-5" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Outfit, sans-serif' }}>
                  {professional.description}
                </p>

                <div className="mb-3 flex flex-wrap gap-2">
                  {professional.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-xl px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        background: 'rgba(64,208,160,0.12)',
                        color: '#93f7d7',
                        border: '1px solid rgba(64,208,160,0.12)',
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    startChat(professional);
                    navigate(`/profissionais/chat/${professional.id}`);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-[18px] py-3 text-sm font-bold"
                  style={{
                    background: '#40d0a0',
                    color: '#07110d',
                    fontFamily: 'Space Grotesk, sans-serif',
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
