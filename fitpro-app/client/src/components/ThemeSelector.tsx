/**
 * FitPro — Theme Selector Component
 * Seletor de temas para usar no Perfil com design premium
 */

import { useApp, ThemeColor } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';

const THEMES: Array<{ value: ThemeColor; label: string; color: string }> = [
  { value: 'green', label: 'Verde', color: '#22c55e' },
  { value: 'blue', label: 'Azul', color: '#3b82f6' },
  { value: 'pink', label: 'Rosa', color: '#ec4899' },
];

export default function ThemeSelector() {
  const { state, updatePreferences } = useApp();
  const currentTheme = state.preferences.theme;

  return (
    <div className="fitpro-card p-4 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Palette size={16} style={{ color: 'var(--theme-accent)' }} />
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Tema</h3>
      </div>

      <div className="space-y-2">
        {THEMES.map((theme) => (
          <motion.button
            key={theme.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => updatePreferences({ theme: theme.value })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group"
            style={{
              background: currentTheme === theme.value ? theme.color : 'rgba(255,255,255,0.05)',
              border: currentTheme === theme.value ? `2px solid ${theme.color}` : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            {/* Círculo de cor */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: theme.color,
                boxShadow: `0 0 16px ${theme.color}40`,
              }}
            >
              {currentTheme === theme.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Check size={20} style={{ color: '#0d0d0f' }} className="font-bold" />
                </motion.div>
              )}
            </div>

            {/* Texto */}
            <div className="flex-1 text-left">
              <p
                className="text-sm font-bold"
                style={{
                  color: currentTheme === theme.value ? '#0d0d0f' : 'rgba(255,255,255,0.7)',
                  fontFamily: 'Space Grotesk',
                }}
              >
                {theme.label}
              </p>
              <p
                className="text-xs"
                style={{
                  color: currentTheme === theme.value ? 'rgba(13,13,15,0.6)' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Outfit',
                }}
              >
                {currentTheme === theme.value ? 'Tema ativo' : 'Clique para selecionar'}
              </p>
            </div>

            {/* Indicador de seleção */}
            {currentTheme === theme.value && (
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: '#0d0d0f' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
