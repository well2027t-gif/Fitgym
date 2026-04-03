/**
 * FitPro — Gamification Card
 * Design: Premium Dark Fitness
 * Exibe pontos, sequência e conquistas com visual mais premium.
 */

import { motion } from 'framer-motion';
import { Flame, Zap, Trophy, Star, Lock, Sparkles, ChevronRight } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  description: string;
}

interface GamificationCardProps {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
}

export default function GamificationCard({
  totalPoints,
  currentStreak,
  longestStreak,
  badges,
  onBadgeClick,
}: GamificationCardProps) {
  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const lockedCount = badges.length - unlockedCount;
  const progressPct = badges.length > 0 ? Math.round((unlockedCount / badges.length) * 100) : 0;
  const nextBadge = badges.find(badge => !badge.unlocked);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.45 }}
      className="fitpro-card overflow-hidden"
      style={{
        boxShadow: '0 0 30px rgba(168,85,247,0.08), 0 12px 35px rgba(0,0,0,0.32)',
      }}
    >
      <div
        className="relative px-4 pt-4 pb-4"
        style={{
          background: 'linear-gradient(180deg, rgba(168,85,247,0.16) 0%, rgba(255,255,255,0.02) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-36 h-36 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 68%)',
            transform: 'translate(25%, -30%)',
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.22)' }}
              >
                <Trophy size={17} style={{ color: '#c084fc' }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Conquistas
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Outfit' }}>
                  Seu progresso de consistência no app
                </p>
              </div>
            </div>

            <div className="flex items-end gap-2 mt-3">
              <span className="text-3xl font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>
                {progressPct}%
              </span>
              <span className="text-xs pb-1" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                concluído
              </span>
            </div>
          </div>

          <div
            className="px-3 py-2 rounded-2xl text-right"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Outfit' }}>
              Badges
            </p>
            <p className="text-lg font-bold text-white leading-none mt-1" style={{ fontFamily: 'Space Grotesk' }}>
              {unlockedCount}/{badges.length}
            </p>
          </div>
        </div>

        <div className="relative z-10 mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            style={{
              background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 45%, var(--theme-accent) 100%)',
              boxShadow: '0 0 18px rgba(168,85,247,0.4)',
            }}
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              label: 'Pontos',
              value: totalPoints.toLocaleString('pt-BR'),
              icon: Zap,
              color: '#f59e0b',
              glow: 'rgba(245,158,11,0.16)',
            },
            {
              label: 'Sequência',
              value: currentStreak.toLocaleString('pt-BR'),
              icon: Flame,
              color: '#ef4444',
              glow: 'rgba(239,68,68,0.16)',
            },
            {
              label: 'Recorde',
              value: longestStreak.toLocaleString('pt-BR'),
              icon: Star,
              color: 'var(--theme-accent)',
              glow: 'rgba(var(--theme-accent-rgb), 0.16)',
            },
          ].map(({ label, value, icon: Icon, color, glow }) => (
            <div
              key={label}
              className="rounded-2xl p-3"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.025) 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 20px ${glow}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: glow }}
                >
                  <Icon size={15} style={{ color }} />
                </div>
                <Sparkles size={12} style={{ color: 'rgba(255,255,255,0.18)' }} />
              </div>
              <p className="text-base font-bold text-white leading-none" style={{ fontFamily: 'Space Grotesk' }}>
                {value}
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl px-3.5 py-3"
          style={{
            background: unlockedCount > 0 ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.035)',
            border: unlockedCount > 0 ? '1px solid rgba(168,85,247,0.16)' : '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {nextBadge ? 'Próxima conquista' : 'Coleção completa'}
              </p>
              <p className="text-[11px] mt-1 leading-4" style={{ color: 'rgba(255,255,255,0.46)', fontFamily: 'Outfit' }}>
                {nextBadge ? nextBadge.description : 'Você já desbloqueou todas as conquistas disponíveis.'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-bold" style={{ color: unlockedCount > 0 ? '#c084fc' : 'rgba(255,255,255,0.5)', fontFamily: 'Space Grotesk' }}>
                {lockedCount} restantes
              </p>
              <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', marginTop: 6 }} />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
              Destaques da jornada
            </p>
            <p className="text-[11px]" style={{ color: '#c084fc', fontFamily: 'Outfit' }}>
              {unlockedCount} liberadas
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {badges.map((badge, idx) => (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.04, duration: 0.28 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onBadgeClick?.(badge)}
                className="relative rounded-2xl px-2 py-3 min-h-[94px] text-center transition-all"
                style={{
                  background: badge.unlocked
                    ? 'linear-gradient(180deg, rgba(168,85,247,0.18) 0%, rgba(255,255,255,0.05) 100%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)',
                  border: badge.unlocked
                    ? '1px solid rgba(192,132,252,0.28)'
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: badge.unlocked
                    ? '0 10px 24px rgba(168,85,247,0.14)'
                    : 'none',
                  cursor: onBadgeClick ? 'pointer' : 'default',
                }}
                title={badge.description}
              >
                <div
                  className="mx-auto mb-2 w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: badge.unlocked ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                    boxShadow: badge.unlocked ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  <span className="text-2xl" style={{ filter: badge.unlocked ? 'none' : 'grayscale(0.35)' }}>
                    {badge.icon}
                  </span>
                </div>

                <p className="text-[10px] font-semibold leading-3 text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  {badge.name}
                </p>

                <p className="text-[9px] mt-1 leading-3" style={{ color: badge.unlocked ? 'rgba(255,255,255,0.54)' : 'rgba(255,255,255,0.32)', fontFamily: 'Outfit' }}>
                  {badge.unlocked ? 'Desbloqueada' : 'Bloqueada'}
                </p>

                {!badge.unlocked && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.34)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Lock size={9} style={{ color: 'rgba(255,255,255,0.55)' }} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {currentStreak > 0 && (
          <div
            className="rounded-2xl px-3.5 py-3 flex items-start gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(239,68,68,0.18)',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.16)' }}>
              <Flame size={16} style={{ color: '#f87171' }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Sequência ativa em andamento
              </p>
              <p className="text-[11px] mt-1 leading-4" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit' }}>
                Continue treinando por mais {Math.max(30 - currentStreak, 0)} dias para liberar a conquista de 30 dias.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
