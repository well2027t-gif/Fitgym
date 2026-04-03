/**
 * FitPro — Theme Selector Component
 * Seletor de temas premium para a tela de perfil.
 */

import { useApp, ThemeColor } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { Check, Palette, Sparkles } from 'lucide-react';

const THEMES: Array<{
  value: ThemeColor;
  label: string;
  color: string;
  accent: string;
  description: string;
}> = [
  {
    value: 'green',
    label: 'Verde Energy',
    color: '#22c55e',
    accent: 'rgba(34,197,94,0.18)',
    description: 'Visual fitness clássico com energia e performance.',
  },
  {
    value: 'blue',
    label: 'Azul Focus',
    color: '#3b82f6',
    accent: 'rgba(59,130,246,0.18)',
    description: 'Estilo mais clean, moderno e tecnológico.',
  },
  {
    value: 'pink',
    label: 'Rosa Pulse',
    color: '#ec4899',
    accent: 'rgba(236,72,153,0.18)',
    description: 'Tema vibrante com destaque mais ousado e premium.',
  },
];

export default function ThemeSelector() {
  const { state, updatePreferences } = useApp();
  const currentTheme = state.preferences.theme;

  return (
    <div className="fitpro-card overflow-hidden">
      <div
        className="relative px-4 pt-4 pb-4"
        style={{
          background: 'linear-gradient(180deg, rgba(var(--theme-accent-rgb), 0.14) 0%, rgba(255,255,255,0.02) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(var(--theme-accent-rgb), 0.18) 0%, transparent 70%)',
            transform: 'translate(28%, -32%)',
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(var(--theme-accent-rgb), 0.18)',
                  border: '1px solid rgba(var(--theme-accent-rgb), 0.22)',
                }}
              >
                <Palette size={18} style={{ color: 'var(--theme-accent)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                  Aparência do app
                </h3>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                  Escolha o estilo visual que combina com você
                </p>
              </div>
            </div>
          </div>

          <div
            className="px-3 py-2 rounded-2xl text-right"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.32)', fontFamily: 'Outfit' }}>
              Tema ativo
            </p>
            <p className="text-sm font-bold text-white mt-1" style={{ fontFamily: 'Space Grotesk' }}>
              {THEMES.find(theme => theme.value === currentTheme)?.label ?? 'Personalizado'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {THEMES.map((theme, index) => {
          const active = currentTheme === theme.value;

          return (
            <motion.button
              key={theme.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => updatePreferences({ theme: theme.value })}
              className="w-full text-left rounded-2xl p-4 transition-all relative overflow-hidden"
              style={{
                background: active
                  ? `linear-gradient(135deg, ${theme.accent} 0%, rgba(255,255,255,0.05) 100%)`
                  : 'linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)',
                border: active
                  ? `1px solid ${theme.color}55`
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: active ? `0 12px 28px ${theme.accent}` : 'none',
              }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${theme.accent} 0%, transparent 72%)`,
                  transform: 'translate(28%, -28%)',
                }}
              />

              <div className="relative z-10 flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${theme.color} 0%, rgba(255,255,255,0.9) 180%)`,
                    boxShadow: `0 0 20px ${theme.color}33`,
                  }}
                >
                  {active ? (
                    <Check size={22} style={{ color: '#0d0d0f' }} />
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2" style={{ borderColor: '#0d0d0f', background: 'rgba(13,13,15,0.15)' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                      {theme.label}
                    </p>
                    {active && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          background: theme.accent,
                          color: theme.color,
                          fontFamily: 'Outfit',
                        }}
                      >
                        Em uso
                      </span>
                    )}
                  </div>

                  <p className="text-xs mt-1 leading-4" style={{ color: active ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.42)', fontFamily: 'Outfit' }}>
                    {theme.description}
                  </p>

                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex gap-2">
                      {[theme.color, '#ffffff', '#0d0d0f'].map((sample, sampleIndex) => (
                        <span
                          key={`${theme.value}-${sampleIndex}`}
                          className="w-4 h-4 rounded-full border"
                          style={{
                            background: sample,
                            borderColor: 'rgba(255,255,255,0.12)',
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.34)', fontFamily: 'Outfit' }}>
                      {active ? 'Tema selecionado agora' : 'Toque para aplicar'}
                    </span>
                  </div>
                </div>

                <Sparkles size={16} style={{ color: active ? theme.color : 'rgba(255,255,255,0.16)' }} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
