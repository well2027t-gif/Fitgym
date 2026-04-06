/**
 * FitPro — Share Page
 * Design: Premium Dark Fitness
 * Página dedicada para compartilhamento de conquistas
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Trophy, ArrowLeft } from 'lucide-react';
import { useLocation } from '@/lib/router';
import { toast } from 'sonner';

export default function Share() {
  const { state } = useApp();
  const [, navigate] = useLocation();
  const { profile, stats } = state;
  const [copied, setCopied] = useState(false);

  const shareText = `🏋️ FitPro - Meu Progresso\n\n💪 ${profile.name}\n🎯 ${stats.totalPoints} pontos\n🔥 ${stats.currentStreak} dias seguidos\n🏆 ${stats.longestStreak} melhor sequência\n📊 ${stats.totalWorkouts} treinos realizados\n⭐ ${stats.badges.length} badges desbloqueadas\n\nBaixa o FitPro e acompanhe seu progresso!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FitPro - Meu Progresso',
          text: shareText,
        });
      } catch (e) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6 flex items-center gap-3" style={{ background: 'linear-gradient(to bottom, #161618, #0d0d0f)' }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} style={{ color: 'var(--theme-accent)' }} />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Compartilhar</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Mostre seu progresso</p>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitpro-card p-5 space-y-4"
          style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Trophy size={16} style={{ color: '#a855f7' }} />
            <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Suas Conquistas</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pontos', value: stats.totalPoints, color: 'var(--theme-accent)' },
              { label: 'Streak', value: `${stats.currentStreak}d`, color: '#f59e0b' },
              { label: 'Treinos', value: stats.totalWorkouts, color: '#60a5fa' },
              { label: 'Badges', value: stats.badges.length, color: '#a855f7' },
            ].map(stat => (
              <div
                key={stat.label}
                className="p-3 rounded-lg text-center"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <p className="text-2xl font-bold" style={{ color: stat.color, fontFamily: 'Space Grotesk' }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Preview Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="fitpro-card p-4"
        >
          <p className="text-xs font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Space Grotesk' }}>PREVIEW</p>
          <div
            className="p-4 rounded-lg text-xs space-y-1 whitespace-pre-wrap"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit' }}
          >
            {shareText}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: '#a855f7', color: 'white', fontFamily: 'Space Grotesk' }}
          >
            <Share2 size={16} />
            Compartilhar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: copied ? 'rgba(var(--theme-accent-rgb), 0.2)' : 'rgba(255,255,255,0.06)',
              color: copied ? 'var(--theme-accent)' : 'rgba(255,255,255,0.7)',
              fontFamily: 'Space Grotesk',
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
