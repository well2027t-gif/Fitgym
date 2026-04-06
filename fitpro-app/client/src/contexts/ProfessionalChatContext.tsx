import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface Professional {
  id: string;
  name: string;
  type: 'personal' | 'nutritionist';
  rating: number;
  availability: string;
  specialties: string[];
  description: string;
  avatar: string;
}

export interface ProfessionalChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ProfessionalChatSession {
  professionalId: string;
  professional: Professional;
  messages: ProfessionalChatMessage[];
  createdAt: string;
}

interface ProfessionalChatContextValue {
  sessions: Record<string, ProfessionalChatSession>;
  currentSessionId: string | null;
  getCurrentSession: () => ProfessionalChatSession | null;
  startChat: (professional: Professional) => void;
  addMessage: (professionalId: string, message: ProfessionalChatMessage) => void;
  setCurrentSession: (professionalId: string) => void;
  clearChat: (professionalId: string) => void;
  clearAllChats: () => void;
}

const STORAGE_KEY = 'fitpro_professional_chats_v1';

const defaultState: Record<string, ProfessionalChatSession> = {};

const ProfessionalChatContext = createContext<ProfessionalChatContextValue | null>(null);

function loadState(): Record<string, ProfessionalChatSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw) as Record<string, ProfessionalChatSession>;
  } catch (error) {
    console.error('Falha ao carregar chats com profissionais:', error);
    return defaultState;
  }
}

export function ProfessionalChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Record<string, ProfessionalChatSession>>(loadState);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Falha ao salvar chats com profissionais:', error);
    }
  }, [sessions]);

  const value = useMemo<ProfessionalChatContextValue>(() => ({
    sessions,
    currentSessionId,
    getCurrentSession() {
      if (!currentSessionId) return null;
      return sessions[currentSessionId] ?? null;
    },
    startChat(professional) {
      setSessions(prev => {
        const existing = prev[professional.id];
        if (existing) {
          setCurrentSessionId(professional.id);
          return prev;
        }

        const newSession: ProfessionalChatSession = {
          professionalId: professional.id,
          professional,
          messages: [],
          createdAt: new Date().toISOString(),
        };

        setCurrentSessionId(professional.id);
        return {
          ...prev,
          [professional.id]: newSession,
        };
      });
    },
    addMessage(professionalId, message) {
      setSessions(prev => {
        const session = prev[professionalId];
        if (!session) return prev;

        return {
          ...prev,
          [professionalId]: {
            ...session,
            messages: [...session.messages, message],
          },
        };
      });
    },
    setCurrentSession(professionalId) {
      setCurrentSessionId(professionalId);
    },
    clearChat(professionalId) {
      setSessions(prev => {
        const session = prev[professionalId];
        if (!session) return prev;

        return {
          ...prev,
          [professionalId]: {
            ...session,
            messages: [],
          },
        };
      });
    },
    clearAllChats() {
      setSessions(defaultState);
      setCurrentSessionId(null);
    },
  }), [sessions, currentSessionId]);

  return (
    <ProfessionalChatContext.Provider value={value}>
      {children}
    </ProfessionalChatContext.Provider>
  );
}

export function useProfessionalChat() {
  const ctx = useContext(ProfessionalChatContext);
  if (!ctx) {
    throw new Error('useProfessionalChat must be used within ProfessionalChatProvider');
  }
  return ctx;
}
