/**
 * FitPro — BottomTabBar
 * Design: Identical to reference image
 * Floating pill with central notch, blue neon glow, fixed at bottom
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from '@/lib/router';
import {
  Home,
  Dumbbell,
  UtensilsCrossed,
  Users,
  TrendingUp,
  User,
  Droplets,
  Calculator,
  Share2,
  X,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Main navigation tabs
const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/dieta', icon: UtensilsCrossed, label: 'Dieta' },
  { path: '/profissionais', icon: Users, label: 'Profissionais' },
];

// Central menu items
const centralMenuItems = [
  { path: '/perfil', icon: User, label: 'Perfil', description: 'Dados pessoais e preferências' },
  { path: '/progresso', icon: TrendingUp, label: 'Progresso', description: 'Evolução e resultados' },
  { path: '/ciclo', icon: Droplets, label: 'Saúde Feminina', description: 'Acompanhamento de ciclo menstrual' },
  { path: '/historico', icon: TrendingUp, label: 'Histórico', description: 'Ver registros e evolução' },
  { path: '/1rm', icon: Calculator, label: 'Calculadora 1RM', description: 'Estimativa de carga máxima' },
  { path: '/compartilhar', icon: Share2, label: 'Compartilhar', description: 'Enviar resultados e progresso' },
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

  return (
    <>
      {/* ── CENTRAL MENU MODAL ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-[100dvh] w-[85%] max-w-sm bg-[#0d0d0f] border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Menu</h3>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {centralMenuItems.map(({ path, icon: Icon, label, description }) => {
                  const active = location === path;
                  return (
                    <button
                      key={path}
                      onClick={() => handleMenuNavigate(path)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                        active ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/60'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${active ? 'text-blue-500' : 'text-white'}`}>{label}</p>
                        <p className="text-[11px] text-white/40">{description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── FIXED BOTTOM TAB BAR WITH CENTRAL NOTCH ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-end justify-center pb-6 pointer-events-none">
        <div className="relative w-full flex justify-center">
          {/* Main Navigation Bar - Pill Shape with Central Notch */}
          <nav
            className="relative pointer-events-auto"
            style={{
              width: 'calc(100% - 32px)',
              maxWidth: '520px',
              marginLeft: '16px',
              marginRight: '16px',
            }}
          >
            {/* SVG Background with Notch */}
            <svg
              viewBox="0 0 520 80"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))',
              }}
            >
              <defs>
                <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                  <stop offset="50%" stopColor="rgba(59, 130, 246, 0.08)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.15)" />
                </linearGradient>
              </defs>
              
              {/* Left side of pill */}
              <path
                d="M 20 40 Q 20 10 50 10 L 210 10 Q 230 10 240 25 L 240 55 Q 230 70 210 70 L 50 70 Q 20 70 20 40 Z"
                fill="url(#navGradient)"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="1.5"
              />
              
              {/* Right side of pill */}
              <path
                d="M 280 25 Q 290 10 310 10 L 470 10 Q 500 10 500 40 Q 500 70 470 70 L 310 70 Q 290 70 280 55 Z"
                fill="url(#navGradient)"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="1.5"
              />
            </svg>

            {/* Navigation Content */}
            <div className="relative h-20 flex items-center justify-between px-8">
              {/* Início */}
              <Link href={tabs[0].path} className="flex flex-col items-center gap-1.5 flex-1 py-2">
                {(() => {
                  const isActive = location === tabs[0].path || (tabs[0].path !== '/' && location.startsWith(tabs[0].path));
                  const Icon = tabs[0].icon;
                  return (
                    <>
                      <Icon 
                        size={24} 
                        className={isActive ? 'text-blue-400' : 'text-white/40'} 
                        strokeWidth={2}
                      />
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-400' : 'text-white/40'}`}>
                        {tabs[0].label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="h-1 w-6 rounded-full bg-blue-400 mt-0.5"
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        />
                      )}
                    </>
                  );
                })()}
              </Link>

              {/* Treinos */}
              <Link href={tabs[1].path} className="flex flex-col items-center gap-1.5 flex-1 py-2">
                {(() => {
                  const isActive = location === tabs[1].path || location.startsWith(tabs[1].path);
                  const Icon = tabs[1].icon;
                  return (
                    <>
                      <Icon 
                        size={24} 
                        className={isActive ? 'text-blue-400' : 'text-white/40'} 
                        strokeWidth={2}
                      />
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-400' : 'text-white/40'}`}>
                        {tabs[1].label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="h-1 w-6 rounded-full bg-blue-400 mt-0.5"
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        />
                      )}
                    </>
                  );
                })()}
              </Link>

              {/* Central Space */}
              <div className="flex-1" />

              {/* Dieta */}
              <Link href={tabs[2].path} className="flex flex-col items-center gap-1.5 flex-1 py-2">
                {(() => {
                  const isActive = location === tabs[2].path || location.startsWith(tabs[2].path);
                  const Icon = tabs[2].icon;
                  return (
                    <>
                      <Icon 
                        size={24} 
                        className={isActive ? 'text-blue-400' : 'text-white/40'} 
                        strokeWidth={2}
                      />
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-400' : 'text-white/40'}`}>
                        {tabs[2].label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="h-1 w-6 rounded-full bg-blue-400 mt-0.5"
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        />
                      )}
                    </>
                  );
                })()}
              </Link>

              {/* Profissionais */}
              <Link href={tabs[3].path} className="flex flex-col items-center gap-1.5 flex-1 py-2">
                {(() => {
                  const isActive = location === tabs[3].path || location.startsWith(tabs[3].path);
                  const Icon = tabs[3].icon;
                  return (
                    <>
                      <Icon 
                        size={24} 
                        className={isActive ? 'text-blue-400' : 'text-white/40'} 
                        strokeWidth={2}
                      />
                      <span className={`text-[10px] font-semibold ${isActive ? 'text-blue-400' : 'text-white/40'}`}>
                        {tabs[3].label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="h-1 w-6 rounded-full bg-blue-400 mt-0.5"
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        />
                      )}
                    </>
                  );
                })()}
              </Link>
            </div>
          </nav>

          {/* Central Button - Encased in Notch */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(true)}
              className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-blue-400/60 hover:scale-110 transition-transform relative"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              <Plus size={36} className="text-white" strokeWidth={3} />
              
              {/* Animated Outer Glow */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-300/40"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
