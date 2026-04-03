/**
 * FitPro — BottomTabBar
 * Design: Premium Dark Fitness
 * Mobile-first bottom navigation with active state animations.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  Menu,
  User,
  Sparkles,
  MessageSquareText,
  ScanSearch,
  BookOpen,
  Calculator,
  Share2,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/dieta', icon: UtensilsCrossed, label: 'Dieta' },
  { path: '/progresso', icon: TrendingUp, label: 'Progresso' },
];

const menuItems = [
  { path: '/perfil', icon: User, label: 'Perfil', description: 'Dados pessoais e preferências' },
  { path: '/personal/plano', icon: Sparkles, label: 'Plano IA', description: 'Gerar plano inteligente' },
  { path: '/personal/chat', icon: MessageSquareText, label: 'Chat Personal', description: 'Tirar dúvidas e ajustar rotina' },
  { path: '/personal/evolucao', icon: ScanSearch, label: 'Evolução IA', description: 'Acompanhar fotos e progresso' },
  { path: '/historico', icon: TrendingUp, label: 'Histórico', description: 'Ver registros e evolução' },
  { path: '/planos', icon: BookOpen, label: 'Planos', description: 'Gerenciar planos de treino' },
  { path: '/1rm', icon: Calculator, label: 'Calculadora 1RM', description: 'Estimativa de carga máxima' },
  { path: '/compartilhar', icon: Share2, label: 'Compartilhar', description: 'Enviar resultados e progresso' },
];

export default function BottomTabBar() {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousHtmlTouchAction = html.style.touchAction;

    if (menuOpen) {
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      body.style.touchAction = 'none';
      html.style.touchAction = 'none';
    }

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      body.style.touchAction = previousBodyTouchAction;
      html.style.touchAction = previousHtmlTouchAction;
    };
  }, [menuOpen]);

  const isMenuActive = menuItems.some(({ path }) => location === path || location.startsWith(path + '/'));

  const handleMenuNavigate = (path: string) => {
    setMenuOpen(false);
    setTimeout(() => navigate(path), 140);
  };

  const secondaryItems = menuItems.filter(item => item.path !== '/perfil');

  return (
    <>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{
                background: 'rgba(0,0,0,0.62)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                touchAction: 'none',
              }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%', opacity: 0.94 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.94 }}
              transition={{ type: 'tween', duration: 0.24, ease: 'easeOut' }}
              className="fixed top-0 right-0 z-50 h-[100dvh] w-[84%] max-w-sm overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(18,20,24,0.99) 0%, rgba(10,10,12,0.99) 100%)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '-20px 0 50px rgba(0,0,0,0.45)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                touchAction: 'manipulation',
              }}
            >
              <div className="h-full flex flex-col justify-between px-3 py-3">
                <div>
                  <div
                    className="px-4 pt-3 pb-3 rounded-[28px]"
                    style={{
                      background: 'radial-gradient(circle at top right, rgba(var(--theme-accent-rgb), 0.22) 0%, rgba(255,255,255,0) 46%), rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                          FitPro
                        </p>
                        <h3 className="text-lg font-bold text-white mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                          Menu lateral
                        </h3>
                        <p className="text-[11px] mt-1 leading-4" style={{ color: 'rgba(255,255,255,0.48)', fontFamily: 'Outfit, sans-serif' }}>
                          Tudo em uma tela, sem rolagem.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <X size={16} style={{ color: 'white' }} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMenuNavigate('/perfil')}
                      className="w-full rounded-[22px] p-3 text-left"
                      style={{
                        background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.18) 0%, rgba(var(--theme-accent-rgb), 0.08) 100%)',
                        border: '1px solid rgba(var(--theme-accent-rgb), 0.18)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(0,0,0,0.18)' }}
                          >
                            <User size={18} style={{ color: 'var(--theme-accent)' }} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                              Perfil e ajustes
                            </p>
                            <p className="text-[11px] leading-4" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif' }}>
                              Configurações, metas e preferências
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: 'var(--theme-accent)' }} />
                      </div>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {secondaryItems.map(({ path, icon: Icon, label, description }) => {
                      const active = location === path || location.startsWith(path + '/');

                      return (
                        <button
                          key={path}
                          type="button"
                          onClick={() => handleMenuNavigate(path)}
                          className="w-full rounded-[20px] px-3 py-2.5 text-left transition-all"
                          style={{
                            background: active ? 'rgba(var(--theme-accent-rgb), 0.12)' : 'rgba(255,255,255,0.035)',
                            border: active ? '1px solid rgba(var(--theme-accent-rgb), 0.22)' : '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                              style={{ background: active ? 'rgba(var(--theme-accent-rgb), 0.16)' : 'rgba(255,255,255,0.06)' }}
                            >
                              <Icon size={16} style={{ color: active ? 'var(--theme-accent)' : 'rgba(255,255,255,0.82)' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[13px] font-semibold leading-4"
                                style={{ color: active ? 'var(--theme-accent)' : 'white', fontFamily: 'Space Grotesk, sans-serif' }}
                              >
                                {label}
                              </p>
                              <p
                                className="text-[10px] leading-3 mt-1"
                                style={{ color: 'rgba(255,255,255,0.42)', fontFamily: 'Outfit, sans-serif' }}
                              >
                                {description}
                              </p>
                            </div>
                            <ChevronRight size={14} style={{ color: active ? 'var(--theme-accent)' : 'rgba(255,255,255,0.32)' }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="px-2 pb-1 pt-2">
                  <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'Outfit, sans-serif' }}>
                    Toque em qualquer opção para navegar.
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bottom-tab-bar"
        style={{
          background: 'linear-gradient(to top, #0d0d0f 80%, transparent)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {tabs.map(({ path, icon: Icon, label }) => {
            const isActive = location === path || (path !== '/' && location.startsWith(path));

            return (
              <Link key={path} href={path}>
                <motion.div
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl relative"
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'rgba(var(--theme-accent-rgb), 0.12)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={{
                      color: isActive ? 'var(--theme-accent)' : 'rgba(255,255,255,0.4)',
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10"
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </motion.div>
                  <motion.span
                    animate={{
                      color: isActive ? 'var(--theme-accent)' : 'rgba(255,255,255,0.35)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] relative z-10"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}

          <motion.button
            type="button"
            onClick={() => setMenuOpen(prev => !prev)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl relative"
          >
            {(isMenuActive || menuOpen) && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'rgba(var(--theme-accent-rgb), 0.12)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <motion.div
              animate={{
                color: isMenuActive || menuOpen ? 'var(--theme-accent)' : 'rgba(255,255,255,0.4)',
                scale: isMenuActive || menuOpen ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <Menu size={20} strokeWidth={isMenuActive || menuOpen ? 2.5 : 1.8} />
            </motion.div>
            <motion.span
              animate={{
                color: isMenuActive || menuOpen ? 'var(--theme-accent)' : 'rgba(255,255,255,0.35)',
                fontWeight: isMenuActive || menuOpen ? 600 : 400,
              }}
              transition={{ duration: 0.2 }}
              className="text-[10px] relative z-10"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Menu
            </motion.span>
          </motion.button>
        </div>
      </nav>
    </>
  );
}
