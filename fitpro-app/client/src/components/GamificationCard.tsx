/**
 * FitPro — Gamification Card
 * Design: Premium Dark Fitness
 * Exibe pontos, streaks, badges e conquistas do usuário.
 */

import { motion } from 'framer-motion';
import { Flame, Zap, Trophy, Star, Lock } from 'lucide-react';

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

const BADGE_ICONS: Record<string, string> = {
  first_workout: '🏋️',
  streak_7: '🔥',
  streak_30: '⚡',
  weight_goal: '🎯',
  photo_milestone: '📸',
  diet_perfect_day: '🥗',
  pr_achieved: '🏆',
};

export default function GamificationCard({
  totalPoints,
  currentStreak,
  longestStreak,
  badges,
  onBadgeClick,
}: GamificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="fitpro-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.15)' }}
          >
            <Trophy size={16} style={{ color: '#a855f7' }} />
          </div>
          <span className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk' }}>
            Conquistas
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Points */}
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap size={12} style={{ color: '#f59e0b' }} />
            <span className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {totalPoints}
            </span>
          </div>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
            Pontos
          </p>
        </div>

        {/* Current Streak */}
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame size={12} style={{ color: '#ef4444' }} />
            <span className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {currentStreak}
            </span>
          </div>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
            Sequência
          </p>
        </div>

        {/* Longest Streak */}
        <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star size={12} style={{ color: 'var(--theme-accent)' }} />
            <span className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
              {longestStreak}
            </span>
          </div>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
            Recorde
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 py-3">
        <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
          BADGES ({badges.filter(b => b.unlocked).length}/{badges.length})
        </p>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((badge, idx) => (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: badge.unlocked ? 1.1 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onBadgeClick?.(badge)}
              className="relative flex items-center justify-center p-2.5 rounded-xl transition-all"
              style={{
                background: badge.unlocked ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                border: badge.unlocked ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.08)',
                cursor: badge.unlocked ? 'pointer' : 'default',
              }}
              title={badge.description}
            >
              <span className="text-2xl">{badge.icon}</span>
              {!badge.unlocked && (
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                >
                  <Lock size={10} style={{ color: 'rgba(255,255,255,0.5)' }} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Streak Info */}
      {currentStreak > 0 && (
        <div className="mx-4 mb-3 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <p className="text-xs font-medium text-white mb-0.5" style={{ fontFamily: 'Space Grotesk' }}>
            🔥 Sequência ativa!
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
            Mantenha a sequência por {30 - currentStreak} dias para desbloquear a badge de 30 dias!
          </p>
        </div>
      )}
    </motion.div>
  );
}
