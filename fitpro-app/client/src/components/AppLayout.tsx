/**
 * FitPro — AppLayout
 * Design: Premium Dark Fitness
 * Main layout wrapper with bottom tab bar and page transitions.
 */

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
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
          className="page-with-nav min-h-screen"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <BottomTabBar />
    </div>
  );
}
