/**
 * FitPro — Workout History & Analytics Page
 * Design: Premium Dark Fitness
 * Gráficos de volume, PRs, histórico de treinos
 */

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Zap, Award } from 'lucide-react';

export default function History() {
  const { state } = useApp();
  const { workoutSessions, stats } = state;

  // Últimos 30 dias de treinos
  const last30Days = useMemo(() => {
    const cutoffDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    return workoutSessions.filter(s => s.date >= cutoffDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [workoutSessions]);

  // Dados para gráfico de treinos por dia
  const workoutChartData = useMemo(() => {
    const data: Record<string, number> = {};
    last30Days.forEach(session => {
      data[session.date] = (data[session.date] || 0) + 1;
    });
    return Object.entries(data).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      treinos: count,
    }));
  }, [last30Days]);

  // Top 5 PRs
  const topPRs = useMemo(() => {
    return Object.entries(stats.personalRecords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([exercise, weight]) => ({ exercise, weight }));
  }, [stats.personalRecords]);

  // Histórico de 1RM
  const oneRMChartData = useMemo(() => {
    return stats.oneRMHistory
      .slice(-10)
      .map(record => ({
        exercise: record.exerciseName.substring(0, 10),
        oneRM: record.estimatedOneRM,
        date: new Date(record.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      }));
  }, [stats.oneRMHistory]);

  const totalVolume = useMemo(() => {
    return stats.volumeHistory.reduce((sum, v) => sum + v.volume, 0);
  }, [stats.volumeHistory]);

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6" style={{ background: 'linear-gradient(to bottom, #161618, #0d0d0f)' }}>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Histórico & Análise</h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>Últimos 30 dias</p>
      </div>

      <div className="px-4 pb-6 space-y-5">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="fitpro-card p-4"
            style={{ background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.1) 0%, rgba(var(--theme-accent-rgb), 0.05) 100%)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} style={{ color: 'var(--theme-accent)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>TREINOS</p>
            </div>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>{last30Days.length}</p>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>últimos 30 dias</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="fitpro-card p-4"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} style={{ color: '#a855f7' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>VOLUME TOTAL</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#a855f7', fontFamily: 'Space Grotesk' }}>{(totalVolume / 1000).toFixed(1)}k</p>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>kg levantados</p>
          </motion.div>
        </div>

        {/* Treinos por Dia */}
        {workoutChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fitpro-card p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={14} style={{ color: '#60a5fa' }} />
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Treinos por Dia</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={workoutChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ background: '#161618', border: '1px solid rgba(var(--theme-accent-rgb), 0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--theme-accent)' }}
                />
                <Bar dataKey="treinos" fill="var(--theme-accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Top PRs */}
        {topPRs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fitpro-card p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award size={14} style={{ color: '#f59e0b' }} />
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Top 5 PRs</h3>
            </div>
            <div className="space-y-2">
              {topPRs.map((pr, idx) => (
                <motion.div
                  key={pr.exercise}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: '#f59e0b', color: '#0d0d0f' }}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-sm text-white" style={{ fontFamily: 'Outfit' }}>{pr.exercise}</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: '#f59e0b', fontFamily: 'Space Grotesk' }}>{pr.weight}kg</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 1RM History */}
        {oneRMChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fitpro-card p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} style={{ color: '#60a5fa' }} />
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>Histórico de 1RM</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={oneRMChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="exercise" stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
                <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{ background: '#161618', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '8px' }}
                  labelStyle={{ color: '#60a5fa' }}
                />
                <Line type="monotone" dataKey="oneRM" stroke="#60a5fa" dot={{ fill: '#60a5fa', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Empty State */}
        {last30Days.length === 0 && (
          <div className="fitpro-card p-8 text-center">
            <Zap size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <p className="text-sm text-white" style={{ fontFamily: 'Space Grotesk' }}>Nenhum treino registrado</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}>Complete treinos para ver análises</p>
          </div>
        )}
      </div>
    </div>
  );
}
