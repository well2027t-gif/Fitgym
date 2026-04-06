/**
 * FitPro — Themes Page
 * Design: Premium Dark Fitness
 * Página dedicada para customizar temas
 */

import { useApp, ThemeColor } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Palette, Check, ArrowLeft } from 'lucide-react';
import { useLocation } from '@/lib/router';

const THEMES: Array<{ value: ThemeColor; label: string; color: string; gradient: string }> = [
  { value: 'green', label: 'Verde', color: 'var(--theme-accent)', gradient: 'linear-gradient(135deg, var(--theme-accent) 0%, var(--theme-accent) 100%)' },
  { value: 'blue', label: 'Azul', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { value: 'pink', label: 'Rosa', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
];

export default function Themes() {
  const { state, updatePreferences } = useApp();
  const [, navigate] = useLocation();
  const currentTheme = state.preferences.theme;

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
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Temas</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Escolha sua cor favorita</p>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {THEMES.map((theme, idx) => (
            <motion.button
              key={theme.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updatePreferences({ theme: theme.value })}
              className="fitpro-card p-6 text-center space-y-3 transition-all"
              style={{
                background: currentTheme === theme.value ? theme.gradient : 'rgba(255,255,255,0.04)',
                border: currentTheme === theme.value ? 'none' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto relative"
                style={{ background: theme.gradient }}
              >
                {currentTheme === theme.value && (
                  <Check size={20} className="absolute inset-0 m-auto" style={{ color: 'white' }} />
                )}
              </div>
              <p
                className="text-sm font-bold"
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

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fitpro-card p-4 text-center"
        >
          <Palette size={16} className="mx-auto mb-2" style={{ color: 'var(--theme-accent)' }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
            Tema atual: <span style={{ color: currentTheme === 'green' ? 'var(--theme-accent)' : currentTheme === 'blue' ? '#3b82f6' : '#ec4899', fontWeight: 600 }}>
              {THEMES.find(t => t.value === currentTheme)?.label}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
