/**
 * FitPro — BottomTabBar
 * Design: Premium Dark Fitness / Floating Pill Layout with Central Menu
 * New design: Início, Treinos, Dieta, Profissionais + Central Menu Button
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
  Camera,
  BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Main navigation tabs
const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/dieta', icon: UtensilsCrossed, label: 'Dieta' },
  { path: '/profissionais', icon: Users, label: 'Profissionais' },
];

// Central menu items (opened by the + button)
const centralMenuItems = [
  { path: '/perfil', icon: User, label: 'Perfil', description: 'Dados pessoais e preferências' },
  { path: '/progresso', icon: TrendingUp, label: 'Progresso', description: 'Evolução e resultados' },
  { path: '/ciclo', icon: Droplets, label: 'Saúde Feminina', description: 'Acompanhamento de ciclo menstrual' },
  { path: '/historico', icon: BarChart3, label: 'Histórico', description: 'Ver registros e evolução' },
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

      {/* ── BOTTOM TAB BAR WITH CENTRAL BUTTON ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-end justify-center pb-4 pointer-events-none">
        <div className="relative w-full flex justify-center">
          {/* Main Navigation Bar */}
          <nav
            className="relative h-20 bg-[#0a0a0f]/80 backdrop-blur-xl border border-blue-500/30 rounded-full shadow-[0_20px_50px_rgba(59,130,246,0.25)] flex items-center justify-between px-8 pointer-events-auto"
            style={{ width: 'calc(100% - 32px)', maxWidth: '520px', marginLeft: '16px', marginRight: '16px' }}
          >
            {/* Início */}
            <Link href={tabs[0].path} className="flex flex-col items-center gap-2 flex-1">
              {(() => {
                const isActive = location === tabs[0].path || (tabs[0].path !== '/' && location.startsWith(tabs[0].path));
                const Icon = tabs[0].icon;
                return (
                  <>
                    <Icon 
                      size={24} 
                      className={isActive ? 'text-blue-400' : 'text-white/50'} 
                      strokeWidth={2}
                    />
                    <span className={`text-[11px] font-semibold tracking-tight ${isActive ? 'text-blue-400' : 'text-white/50'}`}>
                      {tabs[0].label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="h-1 w-8 rounded-full bg-blue-500 mt-1"
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                  </>
                );
              })()}
            </Link>

            {/* Treinos */}
            <Link href={tabs[1].path} className="flex flex-col items-center gap-2 flex-1">
              {(() => {
                const isActive = location === tabs[1].path || location.startsWith(tabs[1].path);
                const Icon = tabs[1].icon;
                return (
                  <>
                    <Icon 
                      size={24} 
                      className={isActive ? 'text-blue-400' : 'text-white/50'} 
                      strokeWidth={2}
                    />
                    <span className={`text-[11px] font-semibold tracking-tight ${isActive ? 'text-blue-400' : 'text-white/50'}`}>
                      {tabs[1].label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="h-1 w-8 rounded-full bg-blue-500 mt-1"
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                  </>
                );
              })()}
            </Link>

            {/* Central Space for Button */}
            <div className="flex-1" />

            {/* Dieta */}
            <Link href={tabs[2].path} className="flex flex-col items-center gap-2 flex-1">
              {(() => {
                const isActive = location === tabs[2].path || location.startsWith(tabs[2].path);
                const Icon = tabs[2].icon;
                return (
                  <>
                    <Icon 
                      size={24} 
                      className={isActive ? 'text-blue-400' : 'text-white/50'} 
                      strokeWidth={2}
                    />
                    <span className={`text-[11px] font-semibold tracking-tight ${isActive ? 'text-blue-400' : 'text-white/50'}`}>
                      {tabs[2].label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="h-1 w-8 rounded-full bg-blue-500 mt-1"
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                  </>
                );
              })()}
            </Link>

            {/* Profissionais */}
            <Link href={tabs[3].path} className="flex flex-col items-center gap-2 flex-1">
              {(() => {
                const isActive = location === tabs[3].path || location.startsWith(tabs[3].path);
                const Icon = tabs[3].icon;
                return (
                  <>
                    <Icon 
                      size={24} 
                      className={isActive ? 'text-blue-400' : 'text-white/50'} 
                      strokeWidth={2}
                    />
                    <span className={`text-[11px] font-semibold tracking-tight ${isActive ? 'text-blue-400' : 'text-white/50'}`}>
                      {tabs[3].label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="h-1 w-8 rounded-full bg-blue-500 mt-1"
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                      />
                    )}
                  </>
                );
              })()}
            </Link>
          </nav>

          {/* Central Button with Glow Effect */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(true)}
              className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-blue-500/60 hover:scale-110 transition-transform relative"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Plus size={36} className="text-white" strokeWidth={3} />
              
              {/* Animated Glow Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
