/**
 * FitPro — BottomTabBar
 * Design: Premium Dark Fitness / Floating Pill Layout
 * Mobile-first bottom navigation with floating center button and rounded pill style.
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
  ChevronRight,
  X,
  Plus,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tabs conforme a foto: Início, Treinos, Academia, Perfil
const tabs = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/academia', icon: Building2, label: 'Academia' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

const menuItems = [
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
      {/* ── SIDE MENU MODAL ── */}
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
                {menuItems.map(({ path, icon: Icon, label, description }) => {
                  const active = location === path;
                  return (
                    <button
                      key={path}
                      onClick={() => handleMenuNavigate(path)}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                        active ? 'bg-[#c5ff22]/10 border border-[#c5ff22]/20' : 'bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-[#c5ff22] text-black' : 'bg-white/5 text-white/60'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold ${active ? 'text-[#c5ff22]' : 'text-white'}`}>{label}</p>
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

      {/* ── FLOATING PILL BOTTOM TAB BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-end justify-center pb-4 pointer-events-none">
        <div className="relative w-full flex justify-center">
          {/* Pílula com abas */}
          <nav
            className="relative h-24 bg-[#1a1a1d]/95 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 pointer-events-auto"
            style={{ width: 'calc(100% - 32px)', maxWidth: '480px', marginLeft: '16px', marginRight: '16px' }}
          >
            {/* Primeira aba (Início) */}
            <Link href={tabs[0].path} className="flex flex-col items-center gap-1 flex-1 py-2">
              {(() => {
                const isActive = location === tabs[0].path || (tabs[0].path !== '/' && location.startsWith(tabs[0].path));
                const Icon = tabs[0].icon;
                return (
                  <>
                    <Icon 
                      size={26} 
                      className={isActive ? 'text-[#c5ff22]' : 'text-white/45'} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-[#c5ff22]' : 'text-white/45'}`}>
                      {tabs[0].label}
                    </span>
                  </>
                );
              })()}
            </Link>

            {/* Segunda aba (Treinos) */}
            <Link href={tabs[1].path} className="flex flex-col items-center gap-1 flex-1 py-2">
              {(() => {
                const isActive = location === tabs[1].path || location.startsWith(tabs[1].path);
                const Icon = tabs[1].icon;
                return (
                  <>
                    <Icon 
                      size={26} 
                      className={isActive ? 'text-[#c5ff22]' : 'text-white/45'} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-[#c5ff22]' : 'text-white/45'}`}>
                      {tabs[1].label}
                    </span>
                  </>
                );
              })()}
            </Link>

            {/* Terceira aba (Academia) */}
            <Link href={tabs[2].path} className="flex flex-col items-center gap-1 flex-1 py-2">
              {(() => {
                const isActive = location === tabs[2].path || location.startsWith(tabs[2].path);
                const Icon = tabs[2].icon;
                return (
                  <>
                    <Icon 
                      size={26} 
                      className={isActive ? 'text-[#c5ff22]' : 'text-white/45'} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-[#c5ff22]' : 'text-white/45'}`}>
                      {tabs[2].label}
                    </span>
                  </>
                );
              })()}
            </Link>

            {/* Quarta aba (Perfil) */}
            <Link href={tabs[3].path} className="flex flex-col items-center gap-1 flex-1 py-2">
              {(() => {
                const isActive = location === tabs[3].path || location.startsWith(tabs[3].path);
                const Icon = tabs[3].icon;
                return (
                  <>
                    <Icon 
                      size={26} 
                      className={isActive ? 'text-[#c5ff22]' : 'text-white/45'} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-[#c5ff22]' : 'text-white/45'}`}>
                      {tabs[3].label}
                    </span>
                  </>
                );
              })()}
            </Link>
          </nav>

          {/* Botão Central (+) - Flutuante acima da pílula */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen(true)}
              className="w-16 h-16 rounded-full bg-[#c5ff22] shadow-[0_10px_35px_rgba(197,255,34,0.45)] flex items-center justify-center border-[4px] border-[#000000] hover:scale-105 transition-transform"
            >
              <Plus size={32} className="text-black" strokeWidth={3} />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
