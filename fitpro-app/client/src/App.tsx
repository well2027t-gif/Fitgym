/**
 * FitPro — App.tsx
 * Design: Premium Dark Fitness
 * Routes, providers, and global layout.
 */

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch } from './lib/router';
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
import Profile from './pages/Profile';
import Progress from './pages/Progress';
import Share from './pages/Share';
import Themes from './pages/Themes';
import Diet from './pages/Diet';
import WorkoutActive from './pages/WorkoutActive';
import WorkoutPlans from './pages/WorkoutPlans';
import Workouts from './pages/Workouts';
import Cycle from './pages/Cycle';
import Hydration from './pages/Hydration';
import Steps from './pages/Steps';
import Professionals from './pages/Professionals';

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
        <Route path="/ciclo" component={Cycle} />
        <Route path="/hidratacao" component={Hydration} />
        <Route path="/passos" component={Steps} />
        <Route path="/profissionais" component={Professionals} />
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
