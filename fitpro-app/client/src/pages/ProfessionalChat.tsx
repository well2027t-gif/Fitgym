/**
 * FitPro — Professional Chat Page
 * Design: Premium Dark Fitness
 * Chat com profissionais específicos (Personal Trainers, Nutricionistas, etc.)
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trash2, MessageSquareText } from 'lucide-react';
import { useLocation, useParams } from '@/lib/router';
import { toast } from 'sonner';
import { useProfessionalChat } from '@/contexts/ProfessionalChatContext';
import { AIChatBox, type Message } from '@/components/AIChatBox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfessionalChat() {
  const { id: professionalId } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { sessions, currentSessionId, setCurrentSession, getCurrentSession, clearChat } = useProfessionalChat();
  const [isLoading, setIsLoading] = useState(false);

  // Set current session when component mounts or professionalId changes
  useMemo(() => {
    if (professionalId && professionalId !== currentSessionId) {
      setCurrentSession(professionalId);
    }
  }, [professionalId, currentSessionId, setCurrentSession]);

  const session = getCurrentSession();

  if (!session || !session.professional) {
    return (
      <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
        <div className="sticky top-0 z-20 px-4 pt-12 pb-4 flex items-center justify-between" style={{
          background: 'linear-gradient(to bottom, #0d0d0f 70%, transparent)',
          backdropFilter: 'blur(12px)',
        }}>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/profissionais')}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <ChevronLeft size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </motion.button>
            <div>
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Chat não encontrado
              </h1>
            </div>
          </div>
        </div>
        <div className="px-4 py-8 text-center">
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            Selecione um profissional para iniciar o chat.
          </p>
          <Button
            onClick={() => navigate('/profissionais')}
            className="mt-4"
            style={{ background: 'var(--theme-accent)', color: '#0d0d0f' }}
          >
            Voltar aos Profissionais
          </Button>
        </div>
      </div>
    );
  }

  const messages = useMemo<Message[]>(() => [
    {
      role: 'system',
      content: `Você é um ${session.professional.type === 'personal' ? 'personal trainer' : 'nutricionista'} profissional do FitPro. Especialidades: ${session.professional.specialties.join(', ')}. Descrição: ${session.professional.description}`,
    },
    ...session.messages.map(message => ({
      role: message.role,
      content: message.content,
    })),
  ], [session.messages, session.professional]);

  const handleSend = async (content: string) => {
    try {
      setIsLoading(true);
      // TODO: Integrar com API backend para enviar mensagem
      // Por enquanto, apenas simulamos a resposta
      
      // Adicionar mensagem do usuário
      const userMessage = {
        role: 'user' as const,
        content,
        createdAt: new Date().toISOString(),
      };

      // Simular resposta do assistente
      const assistantMessage = {
        role: 'assistant' as const,
        content: `Obrigado por sua mensagem! Como ${session.professional.type === 'personal' ? 'seu personal trainer' : 'sua nutricionista'}, estou aqui para ajudar. Sua pergunta foi: "${content}". Vou analisar e fornecer a melhor orientação em breve.`,
        createdAt: new Date().toISOString(),
      };

      // Aqui você integraria com a API real
      // await chatWithProfessional(professionalId, userMessage);
      
      toast.success('Mensagem enviada!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar mensagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (professionalId) {
      clearChat(professionalId);
      toast.success('Histórico do chat limpo.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0f' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-12 pb-4 flex items-center justify-between" style={{
        background: 'linear-gradient(to bottom, #0d0d0f 70%, transparent)',
        backdropFilter: 'blur(12px)',
      }}>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/profissionais')}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <ChevronLeft size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {session.professional.avatar}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                {session.professional.name}
              </h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }}>
                {session.professional.availability}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 pb-24">
        {/* Professional Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitpro-card p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--theme-accent-rgb), 0.2) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(var(--theme-accent-rgb), 0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(var(--theme-accent-rgb), 0.2)' }}>
              <MessageSquareText size={18} style={{ color: 'var(--theme-accent)' }} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--theme-accent)', fontFamily: 'Space Grotesk' }}>
                Especialidades
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {session.professional.specialties.map(spec => (
                  <span
                    key={spec}
                    className="text-[10px] px-2.5 py-1 rounded-lg font-semibold"
                    style={{
                      background: 'rgba(var(--theme-accent-rgb), 0.1)',
                      color: 'var(--theme-accent)',
                      fontFamily: 'Outfit',
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="fitpro-card p-4"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>
                Conversa com {session.professional.name}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }}>
                Faça suas perguntas e receba orientações personalizadas
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClearChat}
              className="p-2 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              title="Limpar histórico"
            >
              <Trash2 size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </motion.button>
          </div>

          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={isLoading}
            height="60vh"
            placeholder={`Pergunte a ${session.professional.name} sobre suas especialidades...`}
            emptyStateMessage={`Comece uma conversa com ${session.professional.name}.`}
            suggestedPrompts={[
              `Qual é a melhor abordagem para meu objetivo atual?`,
              `Como posso melhorar meu desempenho?`,
              `Que recomendações você tem para mim?`,
            ]}
          />
        </motion.div>
      </div>
    </div>
  );
}
