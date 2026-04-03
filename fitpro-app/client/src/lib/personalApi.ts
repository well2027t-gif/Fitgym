import type {
  GeneratedPlan,
  PersonalChatMessage,
  PhotoAnalysis,
  ProgressEvaluation,
} from '@/contexts/PersonalTrainerContext';

export type PersonalApiUserPayload = {
  idade: number;
  peso: number;
  altura: number;
  objetivo: 'hipertrofia' | 'emagrecimento' | 'definicao';
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  frequencia: number;
  restricoes: string;
  historico: string[];
  fotos: string[];
};

export type WorkoutHistoryPayload = {
  date: string;
  workoutName: string;
  durationSeconds: number;
  completedExercises: number;
};

async function requestJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = typeof data?.error === 'string'
      ? data.error
      : 'Não foi possível concluir a solicitação.';
    throw new Error(errorMessage);
  }

  return data as T;
}

export function gerarPlano(usuario: PersonalApiUserPayload) {
  return requestJson<GeneratedPlan>('/api/gerar-plano', { usuario });
}

export function ajustarPlano(usuario: PersonalApiUserPayload, planoAtual: GeneratedPlan, feedback: string) {
  return requestJson<GeneratedPlan>('/api/ajustar-plano', {
    usuario,
    planoAtual,
    feedback,
  });
}

export function chatPersonal(params: {
  usuario: PersonalApiUserPayload;
  historico: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  mensagem: string;
  planoAtual?: GeneratedPlan;
  imageDataUrl?: string;
}) {
  return requestJson<{
    resposta: string;
    historico: Array<{ role: 'user' | 'assistant'; content: string }>;
  }>('/api/chat-personal', params);
}

export function analisarFoto(params: {
  usuario: PersonalApiUserPayload;
  imageDataUrl: string;
}) {
  return requestJson<PhotoAnalysis>('/api/analisar-foto', params);
}

export function avaliarProgresso(params: {
  usuario: PersonalApiUserPayload;
  historicoTreinos: WorkoutHistoryPayload[];
  pesoAtual: number;
  feedback: string;
}) {
  return requestJson<ProgressEvaluation>('/api/avaliar-progresso', params);
}

export function toChatHistoryPayload(messages: PersonalChatMessage[]) {
  return messages.map(message => ({
    role: message.role,
    content: message.content,
  }));
}
