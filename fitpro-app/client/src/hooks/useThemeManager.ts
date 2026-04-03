/**
 * FitPro — Theme Manager Hook
 * Gerencia temas dinâmicos com CSS variables
 */

import { useEffect } from 'react';
import { ThemeColor } from '@/contexts/AppContext';

const THEME_COLORS: Record<ThemeColor, { oklch: string; hex: string; rgb: string }> = {
  green: {
    oklch: 'oklch(0.72 0.19 145)',
    hex: 'var(--theme-accent)',
    rgb: '34, 197, 94',
  },
  blue: {
    oklch: 'oklch(0.68 0.19 258)',
    hex: '#3b82f6',
    rgb: '59, 130, 246',
  },
  pink: {
    oklch: 'oklch(0.65 0.20 350)',
    hex: '#ec4899',
    rgb: '236, 72, 153',
  },
};

export function useThemeManager(theme: ThemeColor) {
  useEffect(() => {
    const colors = THEME_COLORS[theme];
    
    // Atualizar CSS variables
    document.documentElement.style.setProperty('--theme-accent', colors.oklch);
    document.documentElement.style.setProperty('--theme-accent-rgb', colors.rgb);
    
    // Atualizar localStorage
    localStorage.setItem('fitpro_theme', theme);
  }, [theme]);
}

export function getThemeFromStorage(): ThemeColor {
  const saved = localStorage.getItem('fitpro_theme');
  if (saved === 'green' || saved === 'blue' || saved === 'pink') {
    return saved;
  }
  return 'green';
}
