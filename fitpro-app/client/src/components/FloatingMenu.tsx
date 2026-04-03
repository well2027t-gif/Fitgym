/**
 * FitPro — Floating Menu Component
 * Design: Premium Dark Fitness
 * FAB com ícone de anilha de academia e menu de funcionalidades rápidas
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  BookOpen,
  Calculator,
  Share2,
  Sparkles,
  MessageSquareText,
  ScanSearch,
  X,
} from 'lucide-react';

/** Ícone SVG customizado de anilha (weight plate) de academia */
function WeightPlateIcon({ size = 22, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10.5" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="2" fill="none" />
      <line x1="12" y1="1.5" x2="12" y2="4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="12" y1="19.5" x2="12" y2="22.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="1.5" y1="12" x2="4.5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="19.5" y1="12" x2="22.5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const MENU_ITEMS = [
  { icon: Sparkles, label: 'Gerar Plano IA', path: '/personal/plano', color: 'var(--theme-accent)' },
  { icon: MessageSquareText, label: 'Chat Personal', path: '/personal/chat', color: 'var(--theme-accent)' },
  { icon: ScanSearch, label: 'Evolução IA', path: '/personal/evolucao', color: 'var(--theme-accent)' },
  { icon: TrendingUp, label: 'Histórico', path: '/historico', color: 'var(--theme-accent)' },
  { icon: BookOpen, label: 'Planos', path: '/planos', color: 'var(--theme-accent)' },
  { icon: Calculator, label: '1RM', path: '/1rm', color: 'var(--theme-accent)' },
  { icon: Share2, label: 'Compartilhar', path: '/compartilhar', color: 'var(--theme-accent)' },
];

export default function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleItemClick = (item: typeof MENU_ITEMS[0]) => {
    setIsOpen(false);
    setTimeout(() => navigate(item.path), 100);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-28 right-4 z-50 flex flex-col-reverse gap-3">
        <AnimatePresence>
          {isOpen && MENU_ITEMS.map((item, idx) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 20 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleItemClick(item)}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg relative group transition-all"
              style={{ background: item.color, cursor: 'pointer' }}
            >
              <item.icon size={18} style={{ color: 'white' }} />
              <div
                className="absolute right-full mr-3 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none opacity-100"
                style={{ background: 'rgba(0,0,0,0.85)', color: 'white', fontFamily: 'Outfit, sans-serif' }}
              >
                {item.label}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[72px] right-4 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
        style={{
          background: isOpen
            ? 'rgba(255,255,255,0.1)'
            : `linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-accent) 100%)`,
          border: isOpen ? '2px solid rgba(var(--theme-accent-rgb), 0.5)' : '2px solid rgba(255,255,255,0.15)',
          cursor: 'pointer',
          boxShadow: isOpen
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 25px rgba(var(--theme-accent-rgb), 0.4), 0 0 40px rgba(var(--theme-accent-rgb), 0.15)',
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          {isOpen ? (
            <X size={20} style={{ color: 'var(--theme-accent)' }} />
          ) : (
            <WeightPlateIcon size={24} color="white" />
          )}
        </motion.div>
      </motion.button>
    </>
  );
}
