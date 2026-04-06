/**
 * FitPro — Professional Chat Page
 * Design: Estilo WhatsApp — Premium Dark Fitness
 * Tela fixa com header compacto, mensagens com scroll interno,
 * input + áudio sempre visíveis acima do BottomTabBar.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Send, Mic, Trash2, Loader2,
  User, Sparkles, Square, Phone, Video, MoreVertical
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

  useEffect(() => {
    if (professionalId) setCurrentSession(professionalId);
  }, [professionalId, setCurrentSession]);

  const session = professionalId ? (sessions[professionalId] ?? null) : null;

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // ---- Handlers ----

  const handleSend = async (content: string) => {
    if (!content.trim() || !professionalId || !session) return;
    addMessage(professionalId, { role: 'user', content: content.trim(), createdAt: new Date().toISOString() });
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }

    try {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 1200));
      addMessage(professionalId, {
        role: 'assistant',
        content: `Obrigado pela sua mensagem! Como ${session.professional.type === 'personal' ? 'seu personal trainer' : 'sua nutricionista'}, estou aqui para ajudar. Sobre: "${content.trim()}" — vou analisar e fornecer a melhor orientação.`,
        createdAt: new Date().toISOString(),
      });
    } catch { toast.error('Falha ao enviar mensagem.'); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSend(input); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }
  };

  // ---- Audio ----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (audioChunksRef.current.length > 0) {
          const s = recordingTime;
          handleSend(`🎤 Áudio (${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')})`);
        }
        setRecordingTime(0);
      };
      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch { toast.error('Não foi possível acessar o microfone.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    audioChunksRef.current = [];
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.onstop = () => setRecordingTime(0);
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ---- Fallback ----
  if (!session?.professional) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#0d0d0f' }}>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>Selecione um profissional para iniciar o chat.</p>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/profissionais')}
          className="px-6 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: 'var(--theme-accent)', color: '#0d0d0f', fontFamily: 'Space Grotesk' }}>
          Voltar aos Profissionais
        </motion.button>
      </div>
    );
  }

  const prof = session.professional;
  const messages = session.messages;

  const SUGGESTIONS = [
    'Oi, tudo bem? Quero ajustar meu cronograma. Você pode avaliar meus planos?',
    'Como posso melhorar meu desempenho nos treinos?',
    'Qual a melhor estratégia para meu objetivo?',
  ];

  return (
    <div className="flex flex-col" style={{
      background: '#0d0d0f',
      height: '100dvh',
      maxWidth: '32rem',
      margin: '0 auto',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ===== HEADER ESTILO WHATSAPP ===== */}
      <div className="flex-shrink-0 flex items-center gap-2 px-2 py-2" style={{
        background: '#111114',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Voltar */}
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/profissionais')}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
          <ChevronLeft size={22} style={{ color: 'rgba(255,255,255,0.8)' }} />
        </motion.button>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(var(--theme-accent-rgb), 0.15)', border: '2px solid rgba(var(--theme-accent-rgb), 0.25)' }}>
          {prof.avatar}
        </div>

        {/* Nome + status */}
        <div className="flex-1 min-w-0 ml-1">
          <h1 className="text-[15px] font-bold text-white truncate" style={{ fontFamily: 'Space Grotesk' }}>
            {prof.name}
          </h1>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--theme-accent)', boxShadow: '0 0 4px var(--theme-accent)' }} />
            <span className="text-[11px]" style={{ color: 'var(--theme-accent)', fontFamily: 'Outfit' }}>online</span>
          </div>
        </div>

        {/* Ações do header */}
        <motion.button whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center">
          <Phone size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center">
          <Video size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
          if (professionalId) { clearChat(professionalId); toast.success('Chat limpo.'); }
        }} className="w-8 h-8 rounded-full flex items-center justify-center">
          <MoreVertical size={18} style={{ color: 'rgba(255,255,255,0.6)' }} />
        </motion.button>
      </div>

      {/* ===== ÁREA DE MENSAGENS ===== */}
      <div className="flex-1 overflow-y-auto px-3 py-3" style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(var(--theme-accent-rgb), 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(var(--theme-accent-rgb), 0.02) 0%, transparent 40%)',
        WebkitOverflowScrolling: 'touch',
      }}>
        {messages.length === 0 ? (
          /* Estado vazio com sugestões */
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(var(--theme-accent-rgb), 0.1)' }}>
              <Sparkles size={28} style={{ color: 'var(--theme-accent)', opacity: 0.6 }} />
            </div>
            <h2 className="text-sm font-bold text-white mb-1" style={{ fontFamily: 'Space Grotesk' }}>
              Inicie uma conversa
            </h2>
            <p className="text-[11px] mb-5 text-center px-8" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
              Escolha uma sugestão ou digite sua mensagem abaixo.
            </p>
            <div className="w-full space-y-2 px-2">
              {SUGGESTIONS.map((sug, i) => (
                <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={() => handleSend(sug)}
                  className="w-full text-left rounded-2xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[13px] text-white leading-snug" style={{ fontFamily: 'Outfit' }}>{sug}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Lista de mensagens */
          <div className="space-y-1.5">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const time = new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              // Tail WhatsApp style
              return (
                <motion.div key={idx}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[82%] rounded-xl px-3 py-2 relative" style={{
                    background: isUser
                      ? 'rgba(var(--theme-accent-rgb), 0.25)'
                      : 'rgba(255,255,255,0.07)',
                    borderTopRightRadius: isUser ? '4px' : '12px',
                    borderTopLeftRadius: isUser ? '12px' : '4px',
                  }}>
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap"
                      style={{ color: 'rgba(255,255,255,0.92)', fontFamily: 'Outfit' }}>
                      {msg.content}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Outfit' }}>
                        {time}
                      </span>
                      {isUser && (
                        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ opacity: 0.5 }}>
                          <path d="M1 5.5L4 8.5L11 1.5" stroke="var(--theme-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5 5.5L8 8.5L15 1.5" stroke="var(--theme-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="rounded-xl px-4 py-3" style={{
                  background: 'rgba(255,255,255,0.07)',
                  borderTopLeftRadius: '4px',
                }}>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--theme-accent)', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--theme-accent)', animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--theme-accent)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ===== INPUT BAR (estilo WhatsApp) — sempre visível ===== */}
      <div className="flex-shrink-0 px-2 py-2" style={{
        background: '#111114',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'calc(0.5rem + 4.5rem + env(safe-area-inset-bottom, 0px))',
      }}>
        <AnimatePresence mode="wait">
          {isRecording ? (
            /* Gravando áudio */
            <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-full px-3 py-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444', animation: 'pulse-ring 1.5s ease-out infinite' }} />
              <span className="text-sm font-semibold flex-1" style={{ color: '#ef4444', fontFamily: 'Outfit' }}>
                {fmtTime(recordingTime)}
              </span>
              <motion.button whileTap={{ scale: 0.9 }} onClick={cancelRecording}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Trash2 size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={stopRecording}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'var(--theme-accent)' }}>
                <Send size={18} style={{ color: '#0d0d0f' }} />
              </motion.button>
            </motion.div>
          ) : (
            /* Input normal */
            <motion.form key="inp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={handleSubmit} className="flex items-end gap-2">

              {/* Campo de texto estilo WhatsApp */}
              <div className="flex-1 flex items-end rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <textarea ref={textareaRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 pl-4 pr-2 py-2.5 resize-none outline-none"
                  style={{ fontFamily: 'Outfit', maxHeight: '100px', minHeight: '40px', lineHeight: '1.4' }}
                />
              </div>

              {/* Botão: Mic quando vazio, Send quando tem texto */}
              {input.trim() ? (
                <motion.button key="send-btn" type="submit"
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isLoading}
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--theme-accent)' }}>
                  {isLoading
                    ? <Loader2 size={20} className="animate-spin" style={{ color: '#0d0d0f' }} />
                    : <Send size={20} style={{ color: '#0d0d0f' }} />
                  }
                </motion.button>
              ) : (
                <motion.button key="mic-btn" type="button"
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startRecording}
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--theme-accent)' }}>
                  <Mic size={20} style={{ color: '#0d0d0f' }} />
                </motion.button>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
