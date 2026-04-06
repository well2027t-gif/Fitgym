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

const STORAGE_KEY = 'fitpro_professional_chats_v2';

const defaultState: Record<string, ProfessionalChatSession> = {};

const ProfessionalChatContext = createContext<ProfessionalChatContextValue | null>(null);

function isProfessionalType(value: unknown): value is Professional['type'] {
  return value === 'personal' || value === 'nutritionist';
}

function normalizeProfessional(raw: unknown, fallbackId?: string): Professional | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<Professional>;

  if (
    typeof candidate.id !== 'string' && typeof fallbackId !== 'string'
  ) {
    return null;
  }

  if (
    typeof candidate.name !== 'string' ||
    !isProfessionalType(candidate.type) ||
    typeof candidate.rating !== 'number' ||
    typeof candidate.availability !== 'string' ||
    !Array.isArray(candidate.specialties) ||
    candidate.specialties.some((item) => typeof item !== 'string') ||
    typeof candidate.description !== 'string' ||
    typeof candidate.avatar !== 'string'
  ) {
    return null;
  }

  return {
    id: candidate.id ?? fallbackId ?? '',
    name: candidate.name,
    type: candidate.type,
    rating: candidate.rating,
    availability: candidate.availability,
    specialties: candidate.specialties,
    description: candidate.description,
    avatar: candidate.avatar,
  };
}

function normalizeMessage(raw: unknown): ProfessionalChatMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<ProfessionalChatMessage>;

  if (
    (candidate.role !== 'user' && candidate.role !== 'assistant') ||
    typeof candidate.content !== 'string' ||
    typeof candidate.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    role: candidate.role,
    content: candidate.content,
    createdAt: candidate.createdAt,
  };
}

function normalizeSession(raw: unknown, fallbackId: string): ProfessionalChatSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<ProfessionalChatSession>;
  const professional = normalizeProfessional(candidate.professional, fallbackId);
  if (!professional) return null;

  const rawMessages = Array.isArray(candidate.messages) ? candidate.messages : [];
  const messages = rawMessages
    .map(normalizeMessage)
    .filter((message): message is ProfessionalChatMessage => message !== null);

  return {
    professionalId: typeof candidate.professionalId === 'string' ? candidate.professionalId : fallbackId,
    professional,
    messages,
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date().toISOString(),
  };
}

function loadState(): Record<string, ProfessionalChatSession> {
  if (typeof window === 'undefined') return defaultState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return defaultState;

    const normalizedEntries = Object.entries(parsed as Record<string, unknown>)
      .map(([professionalId, session]) => [professionalId, normalizeSession(session, professionalId)] as const)
      .filter((entry): entry is readonly [string, ProfessionalChatSession] => entry[1] !== null);

    return Object.fromEntries(normalizedEntries);
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
      setSessions((prev) => {
        const existing = prev[professional.id];
        const updatedSession: ProfessionalChatSession = {
          professionalId: professional.id,
          professional,
          messages: Array.isArray(existing?.messages) ? existing.messages : [],
          createdAt: typeof existing?.createdAt === 'string' ? existing.createdAt : new Date().toISOString(),
        };

        setCurrentSessionId(professional.id);
        return {
          ...prev,
          [professional.id]: updatedSession,
        };
      });
    },
    addMessage(professionalId, message) {
      setSessions((prev) => {
        const session = prev[professionalId];
        if (!session) return prev;

        const currentMessages = Array.isArray(session.messages) ? session.messages : [];

        return {
          ...prev,
          [professionalId]: {
            ...session,
            messages: [...currentMessages, message],
          },
        };
      });
    },
    setCurrentSession(professionalId) {
      setCurrentSessionId(professionalId);
    },
    clearChat(professionalId) {
      setSessions((prev) => {
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
