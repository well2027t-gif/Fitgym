/**
 * FitPro — NotFound Page
 * Design: Premium Dark Fitness (consistente com o restante do app)
 */

import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0d0d0f' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}
        >
          <AlertCircle size={40} style={{ color: '#ef4444' }} />
        </motion.div>

        <h1
          className="text-5xl font-bold text-white mb-2"
          style={{ fontFamily: 'Space Grotesk' }}
        >
          404
        </h1>

        <h2
          className="text-lg font-semibold mb-3"
          style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Space Grotesk' }}
        >
          Página não encontrada
        </h2>

        <p
          className="text-sm mb-8 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}
        >
          A página que você procura não existe ou foi movida.
        </p>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocation('/')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold btn-glow"
          style={{
            background: 'var(--theme-accent)',
            color: '#0d0d0f',
            fontFamily: 'Space Grotesk',
          }}
        >
          <Home size={16} />
          Voltar ao Início
        </motion.button>
      </motion.div>
    </div>
  );
}
