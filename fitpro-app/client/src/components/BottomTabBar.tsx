/**
 * FitPro — BottomTabBar
 * Design: Premium Dark Fitness
 * Mobile-first bottom navigation with active state animations.
 */

import { Link, useLocation } from 'wouter';
import { Home, Dumbbell, UtensilsCrossed, TrendingUp, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/treinos', icon: Dumbbell, label: 'Treinos' },
  { path: '/dieta', icon: UtensilsCrossed, label: 'Dieta' },
  { path: '/progresso', icon: TrendingUp, label: 'Progresso' },
  { path: '/perfil', icon: User, label: 'Perfil' },
];

export default function BottomTabBar() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bottom-tab-bar"
      style={{
        background: 'linear-gradient(to top, #0d0d0f 80%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location === path || (path !== '/' && location.startsWith(path));

          return (
            <Link key={path} href={path}>
              <motion.div
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl relative"
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(var(--theme-accent-rgb), 0.12)' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{
                    color: isActive ? 'var(--theme-accent)' : 'rgba(255,255,255,0.4)',
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </motion.div>
                <motion.span
                  animate={{
                    color: isActive ? 'var(--theme-accent)' : 'rgba(255,255,255,0.35)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] relative z-10"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {label}
                </motion.span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
