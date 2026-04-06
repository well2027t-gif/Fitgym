/**
 * FitPro — BottomTabBar
 * Design: Glassmorphism Dark / Curved Indicator
 * Menu inferior com indicador animado, glassmorphism e drawer lateral premium.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from '@/lib/router';
import {
  Home,
  Dumbbell,
  TrendingUp,
  User,
  Droplets,
  Calculator,
  Share2,
  X,
  Building2,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academia', icon: Building2, label: 'Academia' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

const menuItems = [
  { path: '/perfil', icon: User, label: 'Perfil', description: 'Dados pessoais e preferências', color: '#818cf8' },
  { path: '/progresso', icon: TrendingUp, label: 'Progresso', description: 'Evolução e resultados', color: '#34d399' },
  { path: '/ciclo', icon: Droplets, label: 'Saúde Feminina', description: 'Acompanhamento de ciclo menstrual', color: '#f472b6' },
  { path: '/historico', icon: TrendingUp, label: 'Histórico', description: 'Ver registros e evolução', color: '#fb923c' },
  { path: '/1rm', icon: Calculator, label: 'Calculadora 1RM', description: 'Estimativa de carga máxima', color: '#38bdf8' },
  { path: '/compartilhar', icon: Share2, label: 'Compartilhar', description: 'Enviar resultados e progresso', color: '#c5ff22' },
];

export default function BottomTabBar() {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isInProfessionalChat = location.startsWith('/profissionais/chat/');

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    if (menuOpen) {
      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      body.style.touchAction = 'none';
    } else {
      body.style.overflow = '';
      html.style.overflow = '';
      body.style.touchAction = '';
    }
  }, [menuOpen]);

  if (isInProfessionalChat) return null;

  const handleMenuNavigate = (path: string) => {
    setMenuOpen(false);
    setTimeout(() => navigate(path), 140);
  };

  const getActiveIndex = () => {
    for (let i = tabs.length - 1; i >= 0; i--) {
      const t = tabs[i];
      if (t.path === '/' ? location === '/' : location.startsWith(t.path)) return i;
    }
    return 0;
  };

  const activeIndex = getActiveIndex();

  return (
    <>
      {/* ── DRAWER LATERAL ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #16161a 0%, #0d0d0f 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                maxWidth: '480px',
                margin: '0 auto',
              }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                    Mais opções
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Acesse recursos adicionais
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Grid de itens */}
              <div className="px-4 pb-6 grid grid-cols-2 gap-3">
                {menuItems.map(({ path, icon: Icon, label, description, color }, idx) => {
                  const active = location === path;
                  return (
                    <motion.button
                      key={path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleMenuNavigate(path)}
                      className="relative flex flex-col items-start gap-2 p-4 rounded-2xl text-left overflow-hidden"
                      style={{
                        background: active
                          ? `${color}18`
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? `${color}40` : 'rgba(255,255,255,0.07)'}`,
                      }}
                    >
                      {/* Glow de fundo no ativo */}
                      {active && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at top left, ${color}20 0%, transparent 70%)`,
                          }}
                        />
                      )}

                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: active ? color : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon size={18} style={{ color: active ? '#000' : color }} />
                      </div>

                      <div>
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{ color: active ? color : 'rgba(255,255,255,0.85)' }}
                        >
                          {label}
                        </p>
                        <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {description}
                        </p>
                      </div>

                      <ChevronRight
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                      />
                    </motion.button>
                  );
                })}
              </div>

              {/* Safe area bottom */}
              <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── BARRA INFERIOR ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30"
        style={{ maxWidth: '480px', margin: '0 auto', left: 0, right: 0 }}
      >
        {/* Gradiente de fade acima da barra */}
        <div
          className="pointer-events-none"
          style={{
            height: '32px',
            background: 'linear-gradient(to top, #0d0d0f, transparent)',
          }}
        />

        <nav
          className="relative flex items-center"
          style={{
            background: 'rgba(18,18,22,0.96)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          {/* Indicador deslizante */}
          <motion.div
            className="absolute top-0 h-[2px] rounded-full"
            style={{ background: '#c5ff22', width: `${100 / 5}%` }}
            animate={{ left: `${(activeIndex * 100) / 5}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />

          {/* Tabs */}
          {tabs.map((tab, idx) => {
            const isActive = idx === activeIndex;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className="flex flex-col items-center justify-center gap-1 py-3 flex-1"
                style={{ minHeight: '60px' }}
              >
                <motion.div
                  animate={isActive ? { scale: 1.12 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative flex items-center justify-center"
                >
                  {/* Halo ativo */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-halo"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'rgba(197,255,34,0.12)',
                        width: '40px',
                        height: '40px',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                  <Icon
                    size={22}
                    style={{
                      color: isActive ? '#c5ff22' : 'rgba(255,255,255,0.38)',
                      strokeWidth: isActive ? 2.5 : 1.8,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </motion.div>
                <span
                  className="text-[9px] font-semibold tracking-wide"
                  style={{
                    color: isActive ? '#c5ff22' : 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* Botão "Mais" */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 py-3 flex-1"
            style={{ minHeight: '60px' }}
          >
            <motion.div
              whileTap={{ scale: 0.88 }}
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{
                background: menuOpen
                  ? 'rgba(197,255,34,0.18)'
                  : 'rgba(255,255,255,0.07)',
                border: `1px solid ${menuOpen ? 'rgba(197,255,34,0.35)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <MoreHorizontal
                size={20}
                style={{
                  color: menuOpen ? '#c5ff22' : 'rgba(255,255,255,0.5)',
                  strokeWidth: 2,
                }}
              />
            </motion.div>
            <span
              className="text-[9px] font-semibold tracking-wide"
              style={{
                color: menuOpen ? '#c5ff22' : 'rgba(255,255,255,0.35)',
                letterSpacing: '0.04em',
              }}
            >
              Mais
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}
