/**
 * FitPro — App.tsx
 * Design: Premium Dark Fitness
 * Routes, providers, and global layout.
 */

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/AppLayout';
import { AppProvider, useApp } from './contexts/AppContext';
import { PersonalTrainerProvider } from './contexts/PersonalTrainerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useThemeManager } from './hooks/useThemeManager';

// Pages
import History from './pages/History';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import OneRM from './pages/OneRM';
import PersonalChat from './pages/PersonalChat';
import PersonalEvolution from './pages/PersonalEvolution';
import PersonalPlan from './pages/PersonalPlan';
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Share from './pages/Share';
import Themes from './pages/Themes';
import Diet from './pages/Diet';
import WorkoutActive from './pages/WorkoutActive';
import WorkoutPlans from './pages/WorkoutPlans';
import Workouts from './pages/Workouts';
import Cycle from './pages/Cycle';

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/treinos" component={Workouts} />
        <Route path="/dieta" component={Diet} />
        <Route path="/progresso" component={Progress} />
        <Route path="/perfil" component={Profile} />
        <Route path="/treino-ativo/:id" component={WorkoutActive} />
        <Route path="/historico" component={History} />
        <Route path="/planos" component={WorkoutPlans} />
        <Route path="/1rm" component={OneRM} />
        <Route path="/temas" component={Themes} />
        <Route path="/compartilhar" component={Share} />
        <Route path="/personal/plano" component={PersonalPlan} />
        <Route path="/personal/chat" component={PersonalChat} />
        <Route path="/personal/evolucao" component={PersonalEvolution} />
        <Route path="/ciclo" component={Cycle} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function AppContent() {
  const { state } = useApp();
  useThemeManager(state.preferences.theme);

  return (
    <TooltipProvider>
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#1c1c20',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          },
        }}
      />
      <Router />
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AppProvider>
          <PersonalTrainerProvider>
            <AppContent />
          </PersonalTrainerProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
