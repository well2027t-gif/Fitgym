/**
 * FitPro — Theme Menu Component
 * Design: Premium Dark Fitness
 * Menu para selecionar tema no header
 */

import { useState } from 'react';
import { useApp, ThemeColor } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check } from 'lucide-react';

const THEMES: Array<{ value: ThemeColor; label: string; color: string; gradient: string }> = [
  { value: 'green', label: 'Verde', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
  { value: 'blue', label: 'Azul', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { value: 'pink', label: 'Rosa', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
];

export default function ThemeMenu() {
  const { state, updatePreferences } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = state.preferences.theme;

  return (
    <div className="relative">
      {/* Menu Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-all"
        style={{
          background: isOpen ? 'rgba(var(--theme-accent-rgb), 0.15)' : 'rgba(255,255,255,0.06)',
          border: isOpen ? '1px solid rgba(var(--theme-accent-rgb), 0.3)' : '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Palette size={18} style={{ color: 'var(--theme-accent)' }} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 z-50 p-3 rounded-xl space-y-2"
              style={{
                background: 'rgba(13, 13, 15, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                minWidth: '160px',
              }}
            >
              {THEMES.map((theme) => (
                <motion.button
                  key={theme.value}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    updatePreferences({ theme: theme.value });
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: currentTheme === theme.value ? theme.gradient : 'rgba(255,255,255,0.06)',
                    border: currentTheme === theme.value ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: theme.gradient }}
                  />
                  <span
                    className="text-xs font-semibold flex-1 text-left"
                    style={{
                      color: currentTheme === theme.value ? 'white' : 'rgba(255,255,255,0.6)',
                      fontFamily: 'Outfit',
                    }}
                  >
                    {theme.label}
                  </span>
                  {currentTheme === theme.value && (
                    <Check size={14} style={{ color: 'white' }} />
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
