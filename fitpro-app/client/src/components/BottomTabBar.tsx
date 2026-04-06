/**
 * FitPro — BottomTabBar
 * Design: Exato conforme referência — barra escura arredondada, borda azul neon,
 * botão central azul gradiente com glow, fixo no rodapé sem se mover.
 */

import { useEffect, useState } from 'react';
import { Link, useLocation } from '@/lib/router';
import {
  Home,
  Dumbbell,
  Salad,
  Users,
  Plus,
  TrendingUp,
  User,
  Droplets,
  Calculator,
  Share2,
  X,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Itens do menu expandido (+) ── */
const menuItems = [
  { path: '/perfil', icon: User, label: 'Perfil', description: 'Dados pessoais e preferências' },
  { path: '/progresso', icon: TrendingUp, label: 'Progresso', description: 'Evolução e resultados' },
  { path: '/ciclo', icon: Droplets, label: 'Saúde Feminina', description: 'Acompanhamento de ciclo menstrual' },
  { path: '/historico', icon: TrendingUp, label: 'Histórico', description: 'Ver registros e evolução' },
  { path: '/1rm', icon: Calculator, label: 'Calculadora 1RM', description: 'Estimativa de carga máxima' },
  { path: '/compartilhar', icon: Share2, label: 'Compartilhar', description: 'Enviar resultados e progresso' },
];

/* ── Componente de aba individual ── */
function TabItem({ href, icon: Icon, label, isActive, filled }: {
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  isActive: boolean;
  filled?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        flex: 1,
        textDecoration: 'none',
        paddingTop: '10px',
        paddingBottom: '10px',
        position: 'relative',
      }}
    >
      <Icon
        size={24}
        fill={filled && isActive ? '#3b82f6' : 'none'}
        color={isActive ? '#3b82f6' : 'rgba(255,255,255,0.4)'}
        strokeWidth={isActive ? 2.5 : 1.8}
      />
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: isActive ? '#3b82f6' : 'rgba(255,255,255,0.4)',
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      {/* Indicador azul embaixo do ativo */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '22px',
            height: '3px',
            borderRadius: '2px',
            background: '#3b82f6',
            boxShadow: '0 0 8px rgba(59,130,246,0.6)',
          }}
        />
      )}
    </Link>
  );
}

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

  /* Detectar aba ativa */
  const isTabActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <>
      {/* ── BOTTOM SHEET DO BOTÃO + ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />
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
                zIndex: 50,
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                background: 'linear-gradient(180deg, #16161a 0%, #0d0d0f 100%)',
                border: '1px solid rgba(59,130,246,0.18)',
                borderBottom: 'none',
                maxWidth: '480px',
                margin: '0 auto',
                overflow: 'hidden',
              }}
            >
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
                <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
              </div>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Mais opções
                  </h3>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>
                    Acesse recursos adicionais
                  </p>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  style={{
                    width: '36px',
                    height: '36px',
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
              <div style={{ padding: '0 16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {menuItems.map(({ path, icon: Icon, label, description }, idx) => {
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
                        gap: '8px',
                        padding: '16px',
                        borderRadius: '16px',
                        textAlign: 'left',
                        overflow: 'hidden',
                        background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${active ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: active ? '#3b82f6' : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: active ? '#3b82f6' : 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.3 }}>
                          {label}
                        </p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', margin: '2px 0 0', lineHeight: 1.3 }}>
                          {description}
                        </p>
                      </div>
                      <ChevronRight
                        size={14}
                        color="rgba(255,255,255,0.2)"
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
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
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          maxWidth: '480px',
          margin: '0 auto',
          /* Fixar sem mover */
          transform: 'translateZ(0)',
          willChange: 'auto',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            margin: '0 10px 10px',
            borderRadius: '22px',
            background: 'rgba(10,10,14,0.96)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(59,130,246,0.22)',
            boxShadow: '0 0 30px rgba(59,130,246,0.08), 0 0 60px rgba(59,130,246,0.04), 0 -4px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: '72px',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            overflow: 'visible',
            pointerEvents: 'auto',
          }}
        >
          {/* Aba Início */}
          <TabItem href="/" icon={Home} label="Início" isActive={isTabActive('/')} filled />

          {/* Aba Treinos */}
          <TabItem href="/treinos" icon={Dumbbell} label="Treinos" isActive={isTabActive('/treinos')} />

          {/* Botão Central (+) */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                position: 'relative',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, #3b82f6 0%, #6366f1 50%, #7c3aed 100%)',
                border: '3.5px solid rgba(10,10,14,0.95)',
                boxShadow: '0 0 28px rgba(59,130,246,0.55), 0 0 70px rgba(59,130,246,0.15), 0 6px 20px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginTop: '-22px',
                outline: 'none',
                padding: 0,
              }}
            >
              {/* Anel externo azul */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  border: '2px solid rgba(59,130,246,0.28)',
                  pointerEvents: 'none',
                }}
              />
              <Plus size={28} color="#fff" strokeWidth={2.5} />
            </button>
          </div>

          {/* Aba Dieta */}
          <TabItem href="/dieta" icon={Salad} label="Dieta" isActive={isTabActive('/dieta')} />

          {/* Aba Profissionais */}
          <TabItem href="/profissionais" icon={Users} label="Profissionais" isActive={isTabActive('/profissionais')} />
        </div>
      </nav>
    </>
  );
}
