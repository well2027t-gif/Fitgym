/**
 * FitPro Preview — Professional Chat Page
 * Direção visual: luxo técnico escuro, estabilidade visual e foco integral na conversa.
 * Esta tela reproduz exatamente o comportamento central que estava sendo ajustado: header fixo,
 * área de mensagens com scroll interno e input sempre visível sem a barra inferior.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ChevronLeft,
  ImagePlus,
  Loader2,
  MessageCircle,
  Mic,
  MoreVertical,
  Phone,
  Send,
  Sparkles,
  Trash2,
  Video,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProfessionalChat } from '@/contexts/ProfessionalChatContext';
import { useLocation, useParams } from '@/lib/router';

export default function ProfessionalChat() {
  const { id: professionalId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { sessions, setCurrentSession, addMessage, clearChat } = useProfessionalChat();
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (professionalId) setCurrentSession(professionalId);
  }, [professionalId, setCurrentSession]);

  const session = professionalId ? (sessions[professionalId] ?? null) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const handleSend = async (content: string) => {
    if (!content.trim() || !professionalId || !session) return;

    addMessage(professionalId, {
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    });

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1100));
      addMessage(professionalId, {
        role: 'assistant',
        content:
          session.professional.type === 'personal'
            ? `Recebi sua mensagem sobre "${content.trim()}". Vamos ajustar sua estratégia de treino com base no seu objetivo e na sua rotina atual.`
            : `Recebi sua mensagem sobre "${content.trim()}". Vou organizar uma orientação nutricional prática para você seguir a partir daqui.`,
        createdAt: new Date().toISOString(),
      });
    } catch {
      toast.error('Falha ao enviar mensagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(input);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (audioChunksRef.current.length > 0) {
          const seconds = recordingTime;
          void handleSend(`🎤 Áudio (${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')})`);
        }
        setRecordingTime(0);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime((previous) => previous + 1), 1000);
    } catch {
      toast.error('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    audioChunksRef.current = [];
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.onstop = () => setRecordingTime(0);
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  if (!session?.professional) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d0f] px-6 text-center">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(64,208,160,0.1)', border: '1px solid rgba(64,208,160,0.16)' }}
        >
          <MessageCircle size={26} style={{ color: '#40d0a0' }} />
        </div>
        <p className="mb-4 text-sm" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Outfit, sans-serif' }}>
          Selecione um profissional para iniciar o chat.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profissionais')}
          className="rounded-2xl px-6 py-3 text-sm font-bold"
          style={{ background: '#40d0a0', color: '#08110e', fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Voltar aos profissionais
        </motion.button>
      </div>
    );
  }

  const professional = session.professional;
  const messages = session.messages;
  const suggestions = [
    'Quero ajustar meu cronograma de treino desta semana.',
    'Como posso melhorar meu desempenho mantendo consistência?',
    'Você pode revisar minha estratégia para o meu objetivo atual?',
  ];

  return (
    <div
      className="flex flex-col"
      style={{
        background: '#0d0d0f',
        height: '100dvh',
        maxWidth: '32rem',
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="flex flex-shrink-0 items-center gap-2 px-2 py-2"
        style={{
          background: 'rgba(17,17,20,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/profissionais')}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
        >
          <ChevronLeft size={22} style={{ color: 'rgba(255,255,255,0.8)' }} />
        </motion.button>

        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl"
          style={{
            background: 'rgba(64,208,160,0.14)',
            border: '2px solid rgba(64,208,160,0.2)',
          }}
        >
          {professional.avatar}
        </div>

        <div className="ml-1 min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {professional.name}
          </h1>
          <div className="flex items-center gap-1">
            <div
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ background: '#40d0a0', boxShadow: '0 0 8px rgba(64,208,160,0.8)' }}
            />
            <span className="text-[11px]" style={{ color: '#75efc7', fontFamily: 'Outfit, sans-serif' }}>
              online
            </span>
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.9 }} className="flex h-8 w-8 items-center justify-center rounded-full">
          <Phone size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} className="flex h-8 w-8 items-center justify-center rounded-full">
          <Video size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (professionalId) {
              clearChat(professionalId);
              toast.success('Chat limpo.');
            }
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full"
        >
          <MoreVertical size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-3 py-3"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(64,208,160,0.055) 0%, transparent 34%), radial-gradient(circle at 80% 10%, rgba(64,208,160,0.03) 0%, transparent 28%)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: 'rgba(64,208,160,0.1)' }}
            >
              <Sparkles size={28} style={{ color: '#40d0a0', opacity: 0.7 }} />
            </div>
            <h2 className="mb-1 text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Inicie uma conversa
            </h2>
            <p
              className="mb-5 px-8 text-center text-[11px]"
              style={{ color: 'rgba(255,255,255,0.36)', fontFamily: 'Outfit, sans-serif' }}
            >
              Escolha uma sugestão ou digite sua mensagem abaixo.
            </p>
            <div className="w-full space-y-2 px-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => void handleSend(suggestion)}
                  className="w-full rounded-2xl px-4 py-3 text-left"
                  style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-[13px] leading-snug text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {suggestion}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';
              const time = new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="relative max-w-[82%] rounded-xl px-3 py-2"
                    style={{
                      background: isUser ? 'rgba(64,208,160,0.22)' : 'rgba(255,255,255,0.07)',
                      borderTopRightRadius: isUser ? '4px' : '12px',
                      borderTopLeftRadius: isUser ? '12px' : '4px',
                    }}
                  >
                    <p
                      className="whitespace-pre-wrap text-[14px] leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'Outfit, sans-serif' }}
                    >
                      {message.content}
                    </p>
                    <div className="mt-0.5 flex items-center justify-end gap-1">
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit, sans-serif' }}>
                        {time}
                      </span>
                      {isUser && (
                        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ opacity: 0.5 }}>
                          <path d="M1 5.5L4 8.5L11 1.5" stroke="#40d0a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M5 5.5L8 8.5L15 1.5" stroke="#40d0a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div
                  className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.07)', borderTopLeftRadius: '4px' }}
                >
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full" style={{ background: '#40d0a0', animationDelay: '0ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full" style={{ background: '#40d0a0', animationDelay: '150ms' }} />
                    <span className="h-2 w-2 animate-bounce rounded-full" style={{ background: '#40d0a0', animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div
        className="flex-shrink-0 px-2 py-3"
        style={{
          background: '#111114',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-full px-3 py-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="flex-1 text-sm font-semibold" style={{ color: '#ef4444', fontFamily: 'Outfit, sans-serif' }}>
                {formatTime(recordingTime)}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={cancelRecording}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <Trash2 size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={stopRecording}
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: '#40d0a0' }}
              >
                <Send size={18} style={{ color: '#0d0d0f' }} />
              </motion.button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              <motion.form
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex items-end gap-2"
              >
                <div className="mb-0.5 flex items-center gap-1">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toast.success('Foto selecionada para envio!')}
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <ImagePlus size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigate('/progresso')}
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <BarChart3 size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  </motion.button>
                </div>

                <div
                  className="flex flex-1 items-end rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Mensagem..."
                    rows={1}
                    className="min-h-[40px] flex-1 resize-none bg-transparent py-2.5 pl-4 pr-2 text-[14px] text-white outline-none placeholder:text-white/30"
                    style={{ fontFamily: 'Outfit, sans-serif', maxHeight: '100px', lineHeight: '1.4' }}
                  />
                </div>

                {input.trim() ? (
                  <motion.button
                    key="send"
                    type="submit"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isLoading}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: '#40d0a0' }}
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" style={{ color: '#0d0d0f' }} />
                    ) : (
                      <Send size={20} style={{ color: '#0d0d0f' }} />
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    key="mic"
                    type="button"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={startRecording}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                    style={{ background: '#40d0a0' }}
                  >
                    <Mic size={20} style={{ color: '#0d0d0f' }} />
                  </motion.button>
                )}
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
