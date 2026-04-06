/**
 * FitPro — Professional Chat Page
 * Design: Premium Dark Fitness — estilo chat dedicado
 * Layout fixo (sem scroll da página), com header do profissional,
 * área de mensagens com scroll interno, sugestões e input fixo com áudio.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Send, Mic, MicOff, Trash2, Loader2,
  User, Sparkles, Star, Square
} from 'lucide-react';
import { useLocation, useParams } from '@/lib/router';
import { toast } from 'sonner';
import { useProfessionalChat } from '@/contexts/ProfessionalChatContext';

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

  // Set current session
  useEffect(() => {
    if (professionalId) {
      setCurrentSession(professionalId);
    }
  }, [professionalId, setCurrentSession]);

  const session = professionalId ? (sessions[professionalId] ?? null) : null;

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // ---- Handlers ----

  const handleSend = async (content: string) => {
    if (!content.trim() || !professionalId || !session) return;

    const userMessage = {
      role: 'user' as const,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    addMessage(professionalId, userMessage);
    setInput('');

    try {
      setIsLoading(true);

      // Simular delay de resposta
      await new Promise(resolve => setTimeout(resolve, 1200));

      const assistantMessage = {
        role: 'assistant' as const,
        content: `Obrigado pela sua mensagem! Como ${session.professional.type === 'personal' ? 'seu personal trainer' : 'sua nutricionista'}, estou aqui para ajudar. Sobre: "${content.trim()}" — vou analisar e fornecer a melhor orientação.`,
        createdAt: new Date().toISOString(),
      };
      addMessage(professionalId, assistantMessage);
    } catch (error) {
      toast.error('Falha ao enviar mensagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleSuggestion = (text: string) => {
    handleSend(text);
  };

  // ---- Audio Recording ----

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (audioChunksRef.current.length > 0) {
          const seconds = recordingTime;
          const formattedTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
          handleSend(`🎤 Mensagem de áudio (${formattedTime})`);
        }
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Não foi possível acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    audioChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = () => {
        // Cancelado, não envia nada
        setRecordingTime(0);
      };
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    toast('Gravação cancelada.');
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleClearChat = () => {
    if (professionalId) {
      clearChat(professionalId);
      toast.success('Histórico do chat limpo.');
    }
  };

  // ---- Fallback: session not found ----

  if (!session || !session.professional) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: '#0d0d0f' }}>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Selecione um profissional para iniciar o chat.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profissionais')}
          className="px-6 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}
        >
          Voltar aos Profissionais
        </motion.button>
      </div>
    );
  }

  const prof = session.professional;
  const messages = session.messages;
  const hasMessages = messages.length > 0;

  const SUGGESTIONS = [
    {
      title: 'Oi, tudo bem? Quero ajustar meu cronograma. Você pode avaliar meus planos?',
      subtitle: 'Quero iniciar meu acompanhamento com você.',
    },
    {
      title: 'Como posso melhorar meu desempenho nos treinos?',
      subtitle: 'Preciso de orientação personalizada.',
    },
    {
      title: 'Qual a melhor estratégia para meu objetivo?',
      subtitle: 'Quero atingir meus resultados mais rápido.',
    },
  ];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: '#0d0d0f',
        maxWidth: '32rem',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {/* ===== HEADER: Card do profissional ===== */}
      <div
        className="flex-shrink-0 px-4 pt-3 pb-3"
        style={{
          background: 'linear-gradient(180deg, #111114 0%, #0d0d0f 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(var(--theme-accent-rgb), 0.15)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Botão voltar */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/profissionais')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <ChevronLeft size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </motion.button>

            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                background: 'rgba(var(--theme-accent-rgb), 0.12)',
                border: '2px solid rgba(var(--theme-accent-rgb), 0.2)',
              }}
            >
              {prof.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-white truncate" style={{ fontFamily: 'Space Grotesk' }}>
                {prof.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: 'var(--theme-accent)', boxShadow: '0 0 6px var(--theme-accent)' }}
                />
                <span className="text-[11px] font-semibold" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>
                  Atendimento ativo
                </span>
              </div>
              <p className="text-[11px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                {prof.specialties.join(' · ')} · responde em poucos minutos
              </p>
            </div>

            {/* Ver perfil */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Space Grotesk',
              }}
              onClick={() => navigate('/profissionais')}
            >
              Ver perfil
            </motion.button>
          </div>
        </div>
      </div>

      {/* ===== ÁREA DE MENSAGENS (scroll interno) ===== */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {!hasMessages ? (
          /* Estado vazio: sugestões */
          <div className="flex flex-col items-center justify-center h-full px-5 py-8">
            <div className="text-center mb-6">
              <h2 className="text-base font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
                Inicie uma conversa
              </h2>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                Escolha um modelo para começar no modo automático.
              </p>
            </div>

            <div className="w-full space-y-2.5">
              {SUGGESTIONS.map((sug, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSuggestion(sug.title)}
                  className="w-full text-left rounded-xl p-4"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p className="text-sm font-semibold text-white leading-snug" style={{ fontFamily: 'Space Grotesk' }}>
                    {sug.title}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                    {sug.subtitle}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Mensagens */
          <div className="px-4 py-4 space-y-3">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                    style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}
                  >
                    <Sparkles size={14} style={{ color: 'var(--theme-accent)' }} />
                  </div>
                )}

                <div
                  className="max-w-[78%] rounded-2xl px-4 py-3"
                  style={{
                    background: msg.role === 'user'
                      ? 'var(--theme-accent)'
                      : 'rgba(255,255,255,0.06)',
                    color: msg.role === 'user' ? '#0d0d0f' : 'rgba(255,255,255,0.9)',
                    border: msg.role === 'user'
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Outfit' }}>
                    {msg.content}
                  </p>
                  <p
                    className="text-[10px] mt-1.5 text-right"
                    style={{
                      color: msg.role === 'user' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)',
                      fontFamily: 'Outfit',
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-1"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <User size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1"
                  style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)' }}
                >
                  <Sparkles size={14} style={{ color: 'var(--theme-accent)' }} />
                </div>
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-2"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--theme-accent)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                    Digitando...
                  </span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ===== INPUT FIXO NO RODAPÉ ===== */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          background: '#0d0d0f',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            /* Barra de gravação de áudio */
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              {/* Indicador pulsante */}
              <div className="relative flex items-center justify-center">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: '#ef4444',
                    animation: 'today-pulse 1.5s ease-out infinite',
                  }}
                />
              </div>

              <span className="text-sm font-semibold flex-1" style={{ color: '#ef4444', fontFamily: 'Space Grotesk' }}>
                Gravando {formatRecordingTime(recordingTime)}
              </span>

              {/* Cancelar */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={cancelRecording}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <Trash2 size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </motion.button>

              {/* Parar e enviar */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={stopRecording}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'var(--theme-accent)',
                  boxShadow: '0 0 20px rgba(var(--theme-accent-rgb), 0.3)',
                }}
              >
                <Square size={16} fill="#0d0d0f" style={{ color: '#0d0d0f' }} />
              </motion.button>
            </motion.div>
          ) : (
            /* Input de texto + botões */
            <motion.form
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onSubmit={handleSubmit}
              className="flex items-end gap-2"
            >
              {/* Campo de texto */}
              <div
                className="flex-1 rounded-2xl flex items-end"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 px-4 py-3 resize-none outline-none"
                  style={{
                    fontFamily: 'Outfit',
                    maxHeight: '120px',
                    minHeight: '44px',
                  }}
                />
              </div>

              {/* Botão de áudio (aparece quando input vazio) */}
              {!input.trim() && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startRecording}
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(var(--theme-accent-rgb), 0.15)',
                    border: '1px solid rgba(var(--theme-accent-rgb), 0.2)',
                  }}
                >
                  <Mic size={20} style={{ color: 'var(--theme-accent)' }} />
                </motion.button>
              )}

              {/* Botão de enviar (aparece quando tem texto) */}
              {input.trim() && (
                <motion.button
                  type="submit"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isLoading}
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'var(--theme-accent)',
                    boxShadow: '0 0 20px rgba(var(--theme-accent-rgb), 0.3)',
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" style={{ color: '#0d0d0f' }} />
                  ) : (
                    <Send size={18} style={{ color: '#0d0d0f' }} />
                  )}
                </motion.button>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {/* Limpar chat (só aparece quando tem mensagens) */}
        {hasMessages && !isRecording && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearChat}
            className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-medium text-center"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit' }}
          >
            Limpar conversa
          </motion.button>
        )}
      </div>
    </div>
  );
}
