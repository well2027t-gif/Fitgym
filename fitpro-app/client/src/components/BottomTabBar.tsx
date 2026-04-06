/**
 * FitPro — PremiumBottomNavBar
 *
 * Barra de navegação inferior premium — clean, minimal, high-end.
 * Inspirada em apps iOS / fitness premium (Apple-level minimalism).
 *
 * Especificações:
 * - Background: #0B0F1A
 * - Cor ativa: #2F80ED
 * - Cor inativa: #6B7280
 * - Indicador ativo: linha 20px × 3px, cor #2F80ED
 * - Botão central: gradiente #2F80ED → #1E5EFF, 60×60px
 * - Animações suaves: 200ms
 * - SEM glow, SEM background no item ativo, SEM exageros visuais
 */

import { useState } from 'react';
import { Link, useLocation } from '@/lib/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House,
  Barbell,
  BowlFood,
  UserCircleCheck,
  Plus,
} from '@phosphor-icons/react';
import {
  User,
  TrendingUp,
  Droplets,
  Calculator,
  Share2,
  X,
  ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Paleta de cores
───────────────────────────────────────────── */
const COLORS = {
  bg: '#0B0F1A',
  active: '#2F80ED',
  inactive: '#6B7280',
  gradStart: '#2F80ED',
  gradEnd: '#1E5EFF',
};

/* ─────────────────────────────────────────────
   Itens do menu expandido (botão +)
───────────────────────────────────────────── */
const quickActionItems = [
  { path: '/perfil',       Icon: User,        label: 'Perfil',            description: 'Dados pessoais e preferências' },
  { path: '/progresso',    Icon: TrendingUp,  label: 'Progresso',         description: 'Evolução e resultados' },
  { path: '/ciclo',        Icon: Droplets,    label: 'Saúde Feminina',    description: 'Acompanhamento de ciclo menstrual' },
  { path: '/historico',    Icon: TrendingUp,  label: 'Histórico',         description: 'Ver registros e evolução' },
  { path: '/1rm',          Icon: Calculator,  label: 'Calculadora 1RM',   description: 'Estimativa de carga máxima' },
  { path: '/compartilhar', Icon: Share2,      label: 'Compartilhar',      description: 'Enviar resultados e progresso' },
];

/* ─────────────────────────────────────────────
   Definição dos 4 itens de navegação (sem o central)
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { index: 0, href: '/',             label: 'Início',       Icon: House,            IconFill: House            },
  { index: 1, href: '/treinos',      label: 'Treinos',      Icon: Barbell,          IconFill: Barbell          },
  // index 2 = botão central
  { index: 3, href: '/dieta',        label: 'Dieta',        Icon: BowlFood,         IconFill: BowlFood         },
  { index: 4, href: '/profissionais',label: 'Profissionais',Icon: UserCircleCheck,  IconFill: UserCircleCheck  },
];

/* ─────────────────────────────────────────────
   NavItem — item individual de navegação
───────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  label: string;
  Icon: React.ComponentType<any>;
  IconFill: React.ComponentType<any>;
  isActive: boolean;
}

function NavItem({ href, label, Icon, IconFill, isActive }: NavItemProps) {
  const color = isActive ? COLORS.active : COLORS.inactive;

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        minWidth: 48,
        minHeight: 48,
        textDecoration: 'none',
        padding: '8px 4px',
        gap: 2,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Ícone com transição suave */}
      <motion.div
        whileTap={{ scale: 0.88 }}
        transition={{ duration: 0.12 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isActive
          ? <IconFill size={24} weight="fill" color={color} />
          : <Icon      size={24} weight="regular" color={color} />
        }
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

      {/* Indicador ativo — linha 20px × 3px */}
      <motion.div
        animate={{ width: isActive ? 20 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{
          height: 3,
          borderRadius: 1.5,
          background: COLORS.active,
          overflow: 'hidden',
        }}
      />
    </Link>
  );
}

/* ─────────────────────────────────────────────
   CenterButton — botão flutuante central (+)
───────────────────────────────────────────── */
interface CenterButtonProps {
  onPress: () => void;
}

function CenterButton({ onPress }: CenterButtonProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 48,
      }}
    >
      <motion.button
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.12 }}
        onClick={onPress}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${COLORS.gradStart} 0%, ${COLORS.gradEnd} 100%)`,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: 8,
          outline: 'none',
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 4px 12px rgba(47,128,237,0.25)',
        }}
      >
        <Plus size={26} weight="bold" color="#fff" />
      </motion.button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PremiumBottomNavBar — componente principal
───────────────────────────────────────────── */
export default function BottomTabBar() {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isInProfessionalChat = location.startsWith('/profissionais/chat/');
  const isInWorkoutMode      = location.startsWith('/treino-ativo/');

  if (isInProfessionalChat || isInWorkoutMode) return null;

  const isTabActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  const openQuickActions = () => setMenuOpen(true);

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
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9998,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />

            {/* Sheet */}
            <motion.aside
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
                background: 'linear-gradient(180deg, #141820 0%, #0B0F1A 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderBottom: 'none',
                maxWidth: 480,
                margin: '0 auto',
                overflow: 'hidden',
              }}
            >
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
              </div>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                    Ações rápidas
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

              {/* Grid de itens */}
              <div style={{ padding: '0 16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {quickActionItems.map(({ path, Icon, label, description }, idx) => {
                  const active = location === path;
                  return (
                    <motion.button
                      key={path}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
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
                        background: active ? 'rgba(47,128,237,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(47,128,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        overflow: 'hidden',
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
                          background: active ? COLORS.active : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: active ? COLORS.active : 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.3 }}>
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

      {/* ── BARRA INFERIOR FIXA ── */}
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
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            padding: '0 12px 10px',
          }}
        >
          {/* Container principal — rounded, background #0B0F1A */}
          <nav
            style={{
              position: 'relative',
              borderRadius: 30,
              background: COLORS.bg,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              overflow: 'visible',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            {NAV_ITEMS.slice(0, 2).map(({ index, href, label, Icon, IconFill }) => (
              <NavItem
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                IconFill={IconFill}
                isActive={isTabActive(href)}
              />
            ))}

            <CenterButton onPress={openQuickActions} />

            {NAV_ITEMS.slice(2).map(({ index, href, label, Icon, IconFill }) => (
              <NavItem
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                IconFill={IconFill}
                isActive={isTabActive(href)}
              />
            ))}
          </nav>

          {/* Safe area para iPhone */}
          <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
      </div>
    </>
  );
}
