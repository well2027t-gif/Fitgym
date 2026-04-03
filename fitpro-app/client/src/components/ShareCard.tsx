/**
 * FitPro — Share Card Component
 * Design: Premium Dark Fitness
 * Gera card de compartilhamento de conquistas
 */

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface ShareCardProps {
  onClose?: () => void;
}

export default function ShareCard({ onClose }: ShareCardProps) {
  const { state } = useApp();
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fitpro-card p-5 space-y-4"
      style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)' }}
    >
      <div className="flex items-center gap-2">
        <Trophy size={16} style={{ color: '#a855f7' }} />
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Compartilhe Seu Progresso</h3>
      </div>

      {/* Preview */}
      <div
        className="p-4 rounded-lg text-xs space-y-2 whitespace-pre-wrap"
        style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit' }}
      >
        {shareText}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
          style={{ background: '#a855f7', color: 'white', fontFamily: 'Space Grotesk' }}
        >
          <Share2 size={14} />
          Compartilhar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCopy}
          className="flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
          style={{
            background: copied ? 'rgba(var(--theme-accent-rgb), 0.2)' : 'rgba(255,255,255,0.06)',
            color: copied ? 'var(--theme-accent)' : 'rgba(255,255,255,0.7)',
            fontFamily: 'Space Grotesk',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </motion.button>
      </div>
    </motion.div>
  );
}
