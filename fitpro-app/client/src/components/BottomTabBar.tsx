/**
 * FitPro — PremiumBottomNavBar v2
 *
 * Barra de navegação inferior premium — full-width, de borda a borda.
 * Ícones com container visual, clean, minimal, high-end.
 *
 * - Background: #0B0F1A — ocupa 100% da largura da tela
 * - Cor ativa: #2F80ED | Inativa: #6B7280
 * - Ícone ativo: container pill com fundo azul translúcido
 * - Indicador ativo: linha 28px × 3px no topo da barra
 * - Botão central: gradiente #2F80ED → #1E5EFF, 58×58px flutuante
 * - Animações suaves 200ms
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
  User,
  ChartLineUp,
  Drop,
  Calculator,
  ShareNetwork,
} from '@phosphor-icons/react';
import { X, ChevronRight } from 'lucide-react';

/* ─────────────────────────────────────────────
   Paleta
───────────────────────────────────────────── */
const C = {
  bg:         '#0B0F1A',
  active:     '#2F80ED',
  inactive:   '#6B7280',
  activeBg:   'rgba(47,128,237,0.14)',
  gradStart:  '#2F80ED',
  gradEnd:    '#1E5EFF',
};

/* ─────────────────────────────────────────────
   Itens do quick-actions sheet
───────────────────────────────────────────── */
const QUICK_ITEMS = [
  { path: '/perfil',       Icon: User,          label: 'Perfil',          description: 'Dados pessoais e preferências' },
  { path: '/progresso',    Icon: ChartLineUp,   label: 'Progresso',       description: 'Evolução e resultados' },
  { path: '/ciclo',        Icon: Drop,          label: 'Saúde Feminina',  description: 'Ciclo menstrual' },
  { path: '/historico',    Icon: ChartLineUp,   label: 'Histórico',       description: 'Registros e evolução' },
  { path: '/1rm',          Icon: Calculator,    label: 'Calculadora 1RM', description: 'Estimativa de carga máxima' },
  { path: '/compartilhar', Icon: ShareNetwork,  label: 'Compartilhar',    description: 'Enviar resultados' },
];

/* ─────────────────────────────────────────────
   Itens de navegação principal
───────────────────────────────────────────── */
const NAV_ITEMS = [
  { href: '/',              label: 'Início',       Icon: House,           IconFill: House           },
  { href: '/treinos',       label: 'Treinos',      Icon: Barbell,         IconFill: Barbell         },
  // slot central = botão +
  { href: '/dieta',         label: 'Dieta',        Icon: BowlFood,        IconFill: BowlFood        },
  { href: '/profissionais', label: 'Profissionais',Icon: UserCircleCheck, IconFill: UserCircleCheck },
];

/* ─────────────────────────────────────────────
   NavItem
───────────────────────────────────────────── */
interface NavItemProps {
  href: string;
  label: string;
  Icon: React.ComponentType<any>;
  IconFill: React.ComponentType<any>;
  isActive: boolean;
}

function NavItem({ href, label, Icon, IconFill, isActive }: NavItemProps) {
  const color = isActive ? C.active : C.inactive;

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
        minWidth: 48,
        minHeight: 56,
        textDecoration: 'none',
        paddingBottom: 10,
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
      }}
    >
      {/* Indicador superior — linha no topo da barra */}
      <motion.div
        animate={{ width: isActive ? 28 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: 0,
          height: 3,
          borderRadius: '0 0 3px 3px',
          background: C.active,
        }}
      />

      {/* Container do ícone com pill ativo */}
      <motion.div
        whileTap={{ scale: 0.84 }}
        transition={{ duration: 0.12 }}
        style={{
          width: 44,
          height: 30,
          borderRadius: 15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isActive ? C.activeBg : 'transparent',
          transition: 'background 200ms ease',
          marginBottom: 4,
        }}
      >
        {isActive
          ? <IconFill size={22} weight="fill" color={color} />
          : <Icon     size={22} weight="regular" color={color} />
        }
      </motion.div>

      {/* Label */}
      <span
        style={{
          fontSize: 10.5,
          fontWeight: isActive ? 700 : 400,
          color,
          lineHeight: 1,
          letterSpacing: '0.02em',
          transition: 'color 200ms ease, font-weight 200ms ease',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   CenterButton
───────────────────────────────────────────── */
function CenterButton({ onPress }: { onPress: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 64,
        paddingBottom: 6,
      }}
    >
      <motion.button
        whileTap={{ scale: 0.90 }}
        transition={{ duration: 0.12 }}
        onClick={onPress}
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: `linear-gradient(145deg, ${C.gradStart} 0%, ${C.gradEnd} 100%)`,
          border: `3px solid ${C.bg}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginTop: -22,
          outline: 'none',
          padding: 0,
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 6px 20px rgba(47,128,237,0.30)',
        }}
      >
        <Plus size={26} weight="bold" color="#fff" />
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
                background: 'rgba(0,0,0,0.68)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
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
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                background: 'linear-gradient(180deg, #141820 0%, #0B0F1A 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>
                    Ações rápidas
                  </h3>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>
                    Acesse recursos adicionais
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={15} color="#fff" />
                </button>
              </div>

              {/* Grid */}
              <div style={{ padding: '0 14px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {QUICK_ITEMS.map(({ path, Icon, label, description }, idx) => {
                  const active = location === path;
                  return (
                    <motion.button
                      key={path}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => handleMenuNavigate(path)}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 8,
                        padding: 14,
                        borderRadius: 16,
                        textAlign: 'left',
                        background: active ? 'rgba(47,128,237,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(47,128,237,0.28)' : 'rgba(255,255,255,0.06)'}`,
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: active ? C.active : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon size={17} weight={active ? 'fill' : 'regular'} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: active ? C.active : 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.3 }}>
                          {label}
                        </p>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', margin: '2px 0 0', lineHeight: 1.3 }}>
                          {description}
                        </p>
                      </div>
                      <ChevronRight
                        size={13}
                        color="rgba(255,255,255,0.18)"
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
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

      {/* ── BARRA INFERIOR — FULL WIDTH, DE BORDA A BORDA ── */}
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
        {/* Sem margin, sem padding lateral — ocupa 100% da tela */}
        <nav
          style={{
            width: '100%',
            background: C.bg,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'space-evenly',
            height: 72,
            overflow: 'visible',
            /* Sombra sutil no topo */
            boxShadow: '0 -1px 0 rgba(255,255,255,0.05), 0 -8px 24px rgba(0,0,0,0.30)',
          }}
        >
          {/* Início + Treinos */}
          {NAV_ITEMS.slice(0, 2).map(({ href, label, Icon, IconFill }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              IconFill={IconFill}
              isActive={isTabActive(href)}
            />
          ))}

          {/* Botão central (+) */}
          <CenterButton onPress={() => setMenuOpen(true)} />

          {/* Dieta + Profissionais */}
          {NAV_ITEMS.slice(2).map(({ href, label, Icon, IconFill }) => (
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

        {/* Safe area iPhone */}
        <div
          style={{
            background: C.bg,
            height: 'env(safe-area-inset-bottom, 0px)',
          }}
        />
      </div>
    </>
  );
}
