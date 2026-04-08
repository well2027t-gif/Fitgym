/**
 * FitPro — PremiumBottomNavBar v9
 *
 * Design Premium Refinado:
 * - Glassmorphism elegante com desfoque e transparências
 * - Glow sutil nos elementos interativos
 * - Animações fluidas e refinadas
 * - Menu lateral completo com todas as funções
 * - Layout FIXO em 100vh sem rolagem
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from '@/lib/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House,
  Barbell,
  Plus,
  Heartbeat,
  Sparkle,
  Pulse,
  Target,
  Rocket,
  Notebook,
  User,
  Calculator,
  Share,
} from '@phosphor-icons/react';
import { X, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   Cores e Configurações
───────────────────────────────────────────── */
const C = {
  bg:         '#0A0E18',
  active:     '#22C55E',
  inactive:   '#8B95A5',
  green:      '#22C55E',
  gradTop:    '#22C55E',
  gradBot:    '#16A34A',
  border:     'rgba(255,255,255,0.08)',
  glow:       'rgba(34,197,94,0.3)',
};

/* ─────────────────────────────────────────────
   Ícones SVG customizados
───────────────────────────────────────────── */

function DietIcon({ active, size = 32 }: { active?: boolean; size?: number }) {
  const grey = active ? C.active : C.inactive;
  const leafColor = active ? C.active : C.green;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 14h20c0 5.523-4.477 10-10 10S6 19.523 6 14z" stroke={grey} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M12 24h8v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2z" stroke={grey} strokeWidth="1.5" fill="none" />
      <circle cx="16" cy="18" r="1.5" fill={leafColor} />
      <path d="M19 5c3 0 6 2 6 6-3 0-6-2-6-6z" fill={leafColor} opacity="0.9" />
      <path d="M19 5c-1 2-1.5 4.5-1 7" stroke={leafColor} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ProfessionalIcon({ active, size = 32 }: { active?: boolean; size?: number }) {
  const grey = active ? C.active : C.inactive;
  const shieldColor = active ? C.active : '#4B7BF5';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="10" r="4.5" stroke={grey} strokeWidth="2" fill="none" />
      <path d="M5 27c0-4.418 3.582-8 8-8 1.5 0 2.9.4 4.1 1.1" stroke={grey} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M24 14l-4.5 2v4c0 2.5 2 4.5 4.5 5.5 2.5-1 4.5-3 4.5-5.5v-4L24 14z" fill={shieldColor} opacity="0.85" />
      <path d="M24 17.5l.9 1.8 2 .3-1.45 1.4.34 2-1.79-.94-1.79.94.34-2-1.45-1.4 2-.3z" fill="#fff" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Itens do Menu Lateral - Completo
───────────────────────────────────────────── */
const QUICK_ITEMS = [
  { path: '/progresso',    Icon: Heartbeat,           label: 'Progresso',           description: 'Evolução e resultados' },
  { path: '/ciclo',        Icon: Sparkle,             label: 'Saúde Feminina',      description: 'Acompanhamento de ciclo menstrual' },
  { path: '/historico',    Icon: Pulse,               label: 'Histórico',           description: 'Ver registros e evolução' },
  { path: '/planos',       Icon: Notebook,            label: 'Planos',              description: 'Gerenciar planos de treino' },
  { path: '/1rm',          Icon: Calculator,          label: 'Calculadora 1RM',     description: 'Estimativa de carga máxima' },
  { path: '/compartilhar', Icon: Share,               label: 'Compartilhar',        description: 'Enviar resultados e progresso' },
  { path: '/hidratacao',   Icon: Target,              label: 'Hidratação',          description: 'Acompanhar ingestão de água' },
  { path: '/passos',       Icon: Rocket,              label: 'Passos',              description: 'Monitorar atividade diária' },
];

/* ─────────────────────────────────────────────
   Componentes Auxiliares
───────────────────────────────────────────── */

function NavItem({ href, label, isActive, children }: { href: string; label: string; isActive: boolean; children: React.ReactNode }) {
  const color = isActive ? C.active : C.inactive;
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minWidth: 56,
        minHeight: 56,
        textDecoration: 'none',
        gap: 6,
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
        paddingTop: 8,
        paddingBottom: 6,
      }}
    >
      <motion.div whileTap={{ scale: 0.85 }} transition={{ duration: 0.1 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 34 }}>
        {children}
      </motion.div>
      <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color, lineHeight: 1, letterSpacing: '0.01em', transition: 'color 200ms ease' }}>
        {label}
      </span>
      <motion.div
        animate={{ width: isActive ? 24 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{ height: 3, borderRadius: 1.5, background: C.active }}
      />
    </Link>
  );
}

function CenterButton({ onPress }: { onPress: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 90, position: 'relative', paddingBottom: 6 }}>
      <motion.button
        whileTap={{ scale: 0.90 }}
        transition={{ duration: 0.12 }}
        onClick={onPress}
        style={{
          width: 62,
          height: 62,
          borderRadius: '50%',
          background: `linear-gradient(180deg, ${C.gradTop} 0%, ${C.gradBot} 100%)`,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginTop: -18,
          outline: 'none',
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
          boxShadow: `0 4px 24px ${C.glow}, 0 8px 40px rgba(34,197,94,0.25), 0 0 60px rgba(34,197,94,0.15)`,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Plus size={30} weight="bold" color="#fff" />
      </motion.button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente Principal
───────────────────────────────────────────── */
export default function BottomTabBar() {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isInProfessionalChat = location.startsWith('/profissionais/chat/');
  const isInWorkoutMode      = location.startsWith('/treino-ativo/');

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [menuOpen]);

  if (isInProfessionalChat || isInWorkoutMode) return null;

  const isTabActive = (path: string) =>
    path === '/' ? location === '/' : location.startsWith(path);

  const handleMenuNavigate = (path: string) => {
    setMenuOpen(false);
    setTimeout(() => navigate(path), 140);
  };

  return (
    <>
      {/* ── MENU LATERAL (DRAWER) ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay com Glassmorphism */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />

            {/* Drawer Panel - Premium Design com ALTURA FIXA */}
            <motion.aside
              key="drawer"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 1.2 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '85%',
                maxWidth: 400,
                zIndex: 9999,
                background: 'linear-gradient(135deg, rgba(13,13,15,0.95) 0%, rgba(20,20,24,0.92) 100%)',
                borderLeft: `1px solid rgba(34,197,94,0.15)`,
                display: 'flex',
                flexDirection: 'column',
                padding: '12px 14px',
                height: '100vh',
                maxHeight: '100vh',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: 'inset 0 0 60px rgba(34,197,94,0.08), 0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header com botão de fechar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6, flexShrink: 0 }}>
                <motion.button
                  whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.08)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <X size={16} color="#fff" />
                </motion.button>
              </div>

              {/* Título do Menu com Gradient */}
              <div style={{ marginBottom: 8, flexShrink: 0 }}>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(34,197,94,0.6)', marginBottom: 1, fontWeight: 700, fontFamily: 'Space Grotesk' }}
                >
                  FITPRO
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, fontFamily: 'Space Grotesk', lineHeight: 1 }}
                >
                  Menu lateral
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ fontSize: 9, color: 'rgba(255,255,255,0.52)', marginTop: 1, fontFamily: 'Outfit' }}
                >
                  Tudo em uma tela.
                </motion.p>
              </div>

              {/* Item de Perfil Destacado com Glow */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(34,197,94,0.25), inset 0 0 20px rgba(34,197,94,0.08)' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => handleMenuNavigate('/perfil')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.08) 100%)',
                  border: '1.5px solid rgba(34,197,94,0.3)',
                  marginBottom: 6,
                  textAlign: 'left',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 0 20px rgba(34,197,94,0.15), inset 0 0 15px rgba(34,197,94,0.05)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
              >
                <motion.div
                  style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.05) 100%)', flexShrink: 0, boxShadow: '0 0 16px rgba(34,197,94,0.2)' }}
                >
                  <User size={16} color="#22C55E" weight="fill" />
                </motion.div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'Space Grotesk' }}>Perfil e ajustes</p>
                  <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.52)', margin: '0px 0 0', lineHeight: 1.1, fontFamily: 'Outfit' }}>Configurações, metas e preferências</p>
                </div>
                <motion.div whileHover={{ x: 4 }}>
                  <ChevronRight size={14} color="#22C55E" style={{ flexShrink: 0 }} />
                </motion.div>
              </motion.button>

              {/* Lista de Itens Rápidos com Animações Refinadas - FLEX GROW */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflow: 'hidden', paddingRight: 0 }}>
                {QUICK_ITEMS.map(({ path, Icon, label, description }, idx) => (
                  <motion.button
                    key={path}
                    initial={{ opacity: 0, x: 20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.03, type: 'spring', stiffness: 200, damping: 20 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(34,197,94,0.15), inset 0 0 12px rgba(34,197,94,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMenuNavigate(path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '7px 9px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: '0 0 12px rgba(0,0,0,0.2), inset 0 0 8px rgba(255,255,255,0.03)',
                      transition: 'all 0.3s ease',
                      flexShrink: 0,
                    }}
                  >
                    <motion.div
                      style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.03) 100%)', flexShrink: 0, border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 0 12px rgba(34,197,94,0.1)' }}
                    >
                      <Icon size={16} color="rgba(255,255,255,0.75)" weight="regular" />
                    </motion.div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'Space Grotesk' }}>{label}</p>
                      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.48)', margin: '0px 0 0', lineHeight: 1.1, fontFamily: 'Outfit' }}>{description}</p>
                    </div>
                    <motion.div whileHover={{ x: 4 }}>
                      <ChevronRight size={12} color="rgba(255,255,255,0.25)" style={{ flexShrink: 0 }} />
                    </motion.div>
                  </motion.button>
                ))}
              </div>

              {/* Footer do Menu */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                style={{ paddingTop: 2, textAlign: 'center', flexShrink: 0 }}
              >
                <p style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.02em', margin: 0, fontFamily: 'Outfit' }}>Toque para navegar</p>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── BARRA INFERIOR ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9990,
          transform: 'translate3d(0,0,0)',
          WebkitTransform: 'translate3d(0,0,0)',
        }}
      >
        <nav
          style={{
            width: '100%',
            background: C.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            height: 78,
            position: 'relative',
            borderTop: `1px solid ${C.border}`,
            boxShadow: `0 -4px 30px rgba(0,0,0,0.5)`,
          }}
        >
          <NavItem href="/" label="Início" isActive={isTabActive('/')}>
            <House size={30} weight={isTabActive('/') ? 'fill' : 'regular'} color={isTabActive('/') ? C.active : C.inactive} />
          </NavItem>

          <NavItem href="/treinos" label="Treinos" isActive={isTabActive('/treinos')}>
            <Barbell size={30} weight={isTabActive('/treinos') ? 'fill' : 'regular'} color={isTabActive('/treinos') ? C.active : C.inactive} />
          </NavItem>

          <CenterButton onPress={() => setMenuOpen(true)} />

          <NavItem href="/dieta" label="Dieta" isActive={isTabActive('/dieta')}>
            <DietIcon active={isTabActive('/dieta')} size={32} />
          </NavItem>

          <NavItem href="/profissionais" label="Profissionais" isActive={isTabActive('/profissionais')}>
            <ProfessionalIcon active={isTabActive('/profissionais')} size={32} />
          </NavItem>
        </nav>

        <div style={{ background: C.bg, height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </>
  );
}
