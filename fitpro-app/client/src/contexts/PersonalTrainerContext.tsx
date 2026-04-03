import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type PersonalObjective = 'hipertrofia' | 'emagrecimento' | 'definicao';
export type PersonalLevel = 'iniciante' | 'intermediario' | 'avancado';

export interface PersonalExercise {
  nome: string;
  series: number;
  repeticoes: string;
  descanso: string;
  observacao: string;
}

export interface PersonalWorkoutDay {
  dia: string;
  foco: string;
  exercicios: PersonalExercise[];
}

export interface GeneratedPlan {
  treino: {
    divisao: string;
    nivel_intensidade: string;
    dias: PersonalWorkoutDay[];
  };
  dieta: {
    calorias_estimadas: number;
    macros: {
      proteina: string;
      carboidrato: string;
      gordura: string;
    };
    refeicoes: Array<
      string | {
        nome: string;
        alimentos: string[];
        observacao?: string;
      }
    >;
  };
  progresso: Record<string, unknown>;
  observacoes_gerais: string[];
}

export interface PersonalChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface PhotoAnalysis {
  analise: {
    gordura_corporal: string;
    massa_muscular: string;
    pontos_fortes: string[];
    pontos_fracos: string[];
  };
  recomendacoes: string[];
  observacao: string;
}

export interface ProgressEvaluation {
  status: 'evoluindo' | 'estagnado' | 'regredindo';
  ajustes: {
    carga: string;
    intensidade: string;
    cardio: string;
  };
  recomendacoes: string[];
  necessita_novo_plano: boolean;
}

export interface PersonalPreferences {
  nivel: PersonalLevel;
  frequencia: number;
  restricoes: string;
  historico: string[];
}

export interface PersonalTrainerState {
  preferences: PersonalPreferences;
  pendingPlan: GeneratedPlan | null;
  currentPlan: GeneratedPlan | null;
  acceptedPlanAt?: string;
  chatHistory: PersonalChatMessage[];
  latestPhotoAnalysis: PhotoAnalysis | null;
  progressEvaluations: Array<{
    createdAt: string;
    data: ProgressEvaluation;
  }>;
}

interface PersonalTrainerContextValue {
  state: PersonalTrainerState;
  updatePreferences: (next: Partial<PersonalPreferences>) => void;
  setPendingPlan: (plan: GeneratedPlan | null) => void;
  acceptPlan: (plan?: GeneratedPlan) => void;
  replaceChatHistory: (messages: PersonalChatMessage[]) => void;
  setLatestPhotoAnalysis: (analysis: PhotoAnalysis | null) => void;
  addProgressEvaluation: (evaluation: ProgressEvaluation) => void;
  clearPersonalData: () => void;
}

const STORAGE_KEY = 'fitpro_personal_trainer_v1';

const defaultState: PersonalTrainerState = {
  preferences: {
    nivel: 'intermediario',
    frequencia: 4,
    restricoes: '',
    historico: [],
  },
  pendingPlan: null,
  currentPlan: null,
  chatHistory: [],
  latestPhotoAnalysis: null,
  progressEvaluations: [],
};

const PersonalTrainerContext = createContext<PersonalTrainerContextValue | null>(null);

function loadState(): PersonalTrainerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<PersonalTrainerState>;
    return {
      ...defaultState,
      ...parsed,
      preferences: {
        ...defaultState.preferences,
        ...(parsed.preferences ?? {}),
        historico: parsed.preferences?.historico ?? [],
      },
      chatHistory: parsed.chatHistory ?? [],
      progressEvaluations: parsed.progressEvaluations ?? [],
    };
  } catch (error) {
    console.error('Falha ao carregar personal trainer:', error);
    return defaultState;
  }
}

export function PersonalTrainerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersonalTrainerState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Falha ao salvar personal trainer:', error);
    }
  }, [state]);

  const value = useMemo<PersonalTrainerContextValue>(() => ({
    state,
    updatePreferences(next) {
      setState(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          ...next,
          historico: next.historico ?? prev.preferences.historico,
        },
      }));
    },
    setPendingPlan(plan) {
      setState(prev => ({ ...prev, pendingPlan: plan }));
    },
    acceptPlan(plan) {
      setState(prev => {
        const accepted = plan ?? prev.pendingPlan;
        if (!accepted) return prev;
        return {
          ...prev,
          currentPlan: accepted,
          pendingPlan: null,
          acceptedPlanAt: new Date().toISOString(),
        };
      });
    },
    replaceChatHistory(messages) {
      setState(prev => ({ ...prev, chatHistory: messages }));
    },
    setLatestPhotoAnalysis(analysis) {
      setState(prev => ({ ...prev, latestPhotoAnalysis: analysis }));
    },
    addProgressEvaluation(evaluation) {
      setState(prev => ({
        ...prev,
        progressEvaluations: [
          { createdAt: new Date().toISOString(), data: evaluation },
          ...prev.progressEvaluations,
        ].slice(0, 20),
      }));
    },
    clearPersonalData() {
      setState(defaultState);
    },
  }), [state]);

  return (
    <PersonalTrainerContext.Provider value={value}>
      {children}
    </PersonalTrainerContext.Provider>
  );
}

export function usePersonalTrainer() {
  const ctx = useContext(PersonalTrainerContext);
  if (!ctx) {
    throw new Error('usePersonalTrainer must be used within PersonalTrainerProvider');
  }
  return ctx;
}
