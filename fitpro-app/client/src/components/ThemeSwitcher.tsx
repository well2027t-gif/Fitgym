/**
 * FitPro — Theme Switcher Component
 * Design: Premium Dark Fitness
 * Permite customizar cores do app
 */

import { useApp, ThemeColor } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Palette, Check } from 'lucide-react';

const THEMES: Array<{ value: ThemeColor; label: string; color: string; gradient: string }> = [
  { value: 'green', label: 'Verde', color: 'var(--theme-accent)', gradient: 'linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-accent) 100%)' },
  { value: 'blue', label: 'Azul', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { value: 'pink', label: 'Rosa', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
];

interface ThemeSwitcherProps {
  compact?: boolean;
}

export default function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { state, updatePreferences } = useApp();
  const currentTheme = state.preferences.theme;

  if (compact) {
    return (
      <div className="flex gap-2">
        {THEMES.map(theme => (
          <motion.button
            key={theme.value}
            whileTap={{ scale: 0.9 }}
            onClick={() => updatePreferences({ theme: theme.value })}
            className="w-8 h-8 rounded-full relative"
            style={{ background: theme.gradient }}
          >
            {currentTheme === theme.value && (
              <Check size={14} className="absolute inset-0 m-auto" style={{ color: 'white' }} />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="fitpro-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Palette size={16} style={{ color: 'var(--theme-accent)' }} />
        <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Tema de Cores</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {THEMES.map(theme => (
          <motion.button
            key={theme.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => updatePreferences({ theme: theme.value })}
            className="p-3 rounded-lg text-center transition-all"
            style={{
              background: currentTheme === theme.value ? theme.gradient : 'rgba(255,255,255,0.06)',
              border: currentTheme === theme.value ? 'none' : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full mx-auto mb-2"
              style={{ background: theme.gradient }}
            />
            <p
              className="text-xs font-semibold"
              style={{
                color: currentTheme === theme.value ? 'white' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Space Grotesk',
              }}
            >
              {theme.label}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
