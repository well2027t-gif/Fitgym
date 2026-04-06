/**
 * FitPro — AppLayout
 * Design: Premium Dark Fitness
 * Main layout wrapper with bottom tab bar and page transitions.
 */

import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/lib/router';
import BottomTabBar from './BottomTabBar';

interface AppLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.22,
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  
  // Forçar scroll para o topo ao mudar de rota
  useEffect(() => {
    window.scrollTo(0, 0);
    // Garantir que o body e html também resetem
    document.body.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
  }, [location]);

  // Verificar se estamos na tela de conversa com profissional
  const isInProfessionalChat = location.startsWith('/profissionais/chat/');

  return (
    <div
      className="min-h-screen max-w-lg mx-auto relative"
      style={{ background: '#0d0d0f' }}
    >
      <AnimatePresence mode="wait">
        <motion.main
          key={location}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
          className={isInProfessionalChat ? "min-h-screen" : "page-with-nav min-h-screen"}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomTabBar />
    </div>
  );
}
