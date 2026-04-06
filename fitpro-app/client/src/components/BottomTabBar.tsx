/**
 * FitPro — PremiumBottomNavBar v4
 *
 * Clonado do design de referência:
 * - Container com borda azul neon sutil
 * - Botão central com glow azul + anel externo
 * - Ícones customizados multicoloridos (Dieta = folha verde, Profissionais = escudo azul)
 * - Visual premium dark com toques neon
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from '@/lib/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House,
  Barbell,
  Plus,
  IdentificationBadge,
  Heartbeat,
  Sparkle,
  Pulse,
  Target,
  Rocket,
} from '@phosphor-icons/react';
import { X, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   Cores
───────────────────────────────────────────── */
const C = {
  bg:         '#0A0E18',
  active:     '#2F80ED',
  inactive:   '#8B95A5',
  green:      '#4ADE80',
  gradTop:    '#4DA3FF',
  gradBot:    '#1E5EFF',
  border:     'rgba(47,128,237,0.25)',
  glow:       'rgba(47,128,237,0.50)',
};

/* ─────────────────────────────────────────────
   Ícones SVG customizados (multicoloridos)
───────────────────────────────────────────── */

/** Dieta — bowl com folha verde */
function DietIcon({ active, size = 28 }: { active?: boolean; size?: number }) {
  const grey = active ? C.active : C.inactive;
  const leafColor = active ? C.active : C.green;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bowl */}
      <path
        d="M6 14h20c0 5.523-4.477 10-10 10S6 19.523 6 14z"
        stroke={grey}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Base do bowl */}
      <path
        d="M12 24h8v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2z"
        stroke={grey}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Pontinho verde no bowl */}
      <circle cx="16" cy="18" r="1.5" fill={leafColor} />
      {/* Folha */}
      <path
        d="M19 5c3 0 6 2 6 6-3 0-6-2-6-6z"
        fill={leafColor}
        opacity="0.9"
      />
      {/* Talo da folha */}
      <path
        d="M19 5c-1 2-1.5 4.5-1 7"
        stroke={leafColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Profissionais — pessoa com escudo e estrela */
function ProfessionalIcon({ active, size = 28 }: { active?: boolean; size?: number }) {
  const grey = active ? C.active : C.inactive;
  const shieldColor = active ? C.active : '#4B7BF5';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cabeça */}
      <circle
        cx="13"
        cy="10"
        r="4.5"
        stroke={grey}
        strokeWidth="2"
        fill="none"
      />
      {/* Corpo */}
      <path
        d="M5 27c0-4.418 3.582-8 8-8 1.5 0 2.9.4 4.1 1.1"
        stroke={grey}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Escudo */}
      <path
        d="M24 14l-4.5 2v4c0 2.5 2 4.5 4.5 5.5 2.5-1 4.5-3 4.5-5.5v-4L24 14z"
        fill={shieldColor}
        opacity="0.85"
      />
      {/* Estrela no escudo */}
      <path
        d="M24 17.5l.9 1.8 2 .3-1.45 1.4.34 2-1.79-.94-1.79.94.34-2-1.45-1.4 2-.3z"
        fill="#fff"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Quick Actions
───────────────────────────────────────────── */
const QUICK_ITEMS = [
  { path: '/perfil',       Icon: IdentificationBadge, label: 'Perfil',          description: 'Dados pessoais e preferências' },
  { path: '/progresso',    Icon: Heartbeat,           label: 'Progresso',       description: 'Evolução e resultados' },
  { path: '/ciclo',        Icon: Sparkle,             label: 'Saúde Feminina',  description: 'Ciclo menstrual' },
  { path: '/historico',    Icon: Pulse,               label: 'Histórico',       description: 'Registros e evolução' },
  { path: '/1rm',          Icon: Target,              label: 'Calculadora 1RM', description: 'Estimativa de carga máxima' },
  { path: '/compartilhar', Icon: Rocket,              label: 'Compartilhar',    description: 'Enviar resultados' },
];

/* ─────────────────────────────────────────────
   NavItem
───────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}

function NavItem({ href, label, isActive, children }: NavItemProps) {
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
      {/* Ícone */}
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 28,
        }}
      >
        {children}
      </motion.div>

      {/* Label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: isActive ? 600 : 400,
          color,
          lineHeight: 1,
          letterSpacing: '0.01em',
          transition: 'color 200ms ease',
        }}
      >
        {label}
      </span>

      {/* Indicador ativo — linha azul abaixo do label */}
      <motion.div
        animate={{ width: isActive ? 24 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{
          height: 3,
          borderRadius: 1.5,
          background: C.active,
        }}
      />
    </Link>
  );
}

/* ─────────────────────────────────────────────
   CenterButton — com glow e anel externo
───────────────────────────────────────────── */
function CenterButton({ onPress }: { onPress: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
        position: 'relative',
        paddingBottom: 6,
      }}
    >
      {/* Anel externo */}
      <div
        style={{
          position: 'absolute',
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: `2px solid ${C.border}`,
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Botão */}
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
          boxShadow: `0 4px 24px ${C.glow}, 0 8px 40px rgba(47,128,237,0.25), 0 0 60px rgba(47,128,237,0.15)`,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Plus size={28} weight="bold" color="#fff" />
      </motion.button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente principal
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
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
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
      {/* ── QUICK ACTIONS BOTTOM SHEET ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            <motion.aside
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                background: 'linear-gradient(180deg, #16161a 0%, #0d0d0f 100%)',
                border: `1px solid ${C.border}`,
                borderBottom: 'none',
                maxWidth: 480,
                margin: '0 auto',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                    Mais opções
                  </h3>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
                    Acesse recursos adicionais
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} color="#fff" />
                </button>
              </div>

              <div style={{ padding: '0 16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {QUICK_ITEMS.map(({ path, Icon, label, description }, idx) => {
                  const active = location === path;
                  return (
                    <motion.button
                      key={path}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleMenuNavigate(path)}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: 16,
                        borderRadius: 16,
                        textAlign: 'left',
                        overflow: 'hidden',
                        background: active ? 'rgba(47,128,237,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(47,128,237,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: active ? C.active : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon size={18} weight={active ? 'fill' : 'regular'} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: active ? C.active : 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.3 }}>
                          {label}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0', lineHeight: 1.3 }}>
                          {description}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        color="rgba(255,255,255,0.2)"
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── BARRA INFERIOR — FULL WIDTH ── */}
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
        {/* Container com borda azul neon */}
        <nav
          style={{
            width: '100%',
            background: C.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            height: 78,
            overflow: 'visible',
            position: 'relative',
            borderTop: `1px solid ${C.border}`,
            boxShadow: `0 -4px 30px rgba(0,0,0,0.5), 0 0 40px rgba(47,128,237,0.06)`,
          }}
        >
          {/* Borda neon sutil — top glow line */}
          <div
            style={{
              position: 'absolute',
              top: -1,
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent 0%, rgba(47,128,237,0.4) 30%, rgba(47,128,237,0.5) 50%, rgba(47,128,237,0.4) 70%, transparent 100%)`,
              pointerEvents: 'none',
            }}
          />

          {/* Início */}
          <NavItem href="/" label="Início" isActive={isTabActive('/')}>
            <House
              size={26}
              weight={isTabActive('/') ? 'fill' : 'regular'}
              color={isTabActive('/') ? C.active : C.inactive}
            />
          </NavItem>

          {/* Treinos */}
          <NavItem href="/treinos" label="Treinos" isActive={isTabActive('/treinos')}>
            <Barbell
              size={26}
              weight={isTabActive('/treinos') ? 'fill' : 'regular'}
              color={isTabActive('/treinos') ? C.active : C.inactive}
            />
          </NavItem>

          {/* Botão central (+) */}
          <CenterButton onPress={() => setMenuOpen(true)} />

          {/* Dieta — ícone customizado com folha verde */}
          <NavItem href="/dieta" label="Dieta" isActive={isTabActive('/dieta')}>
            <DietIcon active={isTabActive('/dieta')} size={26} />
          </NavItem>

          {/* Profissionais — ícone customizado com escudo azul */}
          <NavItem href="/profissionais" label="Profissionais" isActive={isTabActive('/profissionais')}>
            <ProfessionalIcon active={isTabActive('/profissionais')} size={26} />
          </NavItem>
        </nav>

        {/* Safe area iPhone */}
        <div style={{ background: C.bg, height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </>
  );
}
