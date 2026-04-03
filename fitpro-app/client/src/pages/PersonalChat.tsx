import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Trash2, MessageSquareText } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { usePersonalTrainer } from '@/contexts/PersonalTrainerContext';
import { AIChatBox, type Message } from '@/components/AIChatBox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildPersonalApiUserPayload } from '@/lib/personalMappers';
import { chatPersonal, toChatHistoryPayload } from '@/lib/personalApi';

export default function PersonalChat() {
  const { state: appState } = useApp();
  const { state, replaceChatHistory } = usePersonalTrainer();
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();

  const usuario = useMemo(() => buildPersonalApiUserPayload({
    profile: appState.profile,
    nivel: state.preferences.nivel,
    frequencia: state.preferences.frequencia,
    restricoes: state.preferences.restricoes,
    historico: state.preferences.historico,
    fotos: appState.progressPhotos,
  }), [appState.profile, appState.progressPhotos, state.preferences]);

  const messages = useMemo<Message[]>(() => [
    {
      role: 'system',
      content: 'Você é o personal trainer inteligente do FitPro.',
    },
    ...state.chatHistory.map(message => ({
      role: message.role,
      content: message.content,
    })),
  ], [state.chatHistory]);

  const handleImageChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      toast.success('Imagem anexada ao próximo envio.');
    };
    reader.onerror = () => {
      toast.error('Não foi possível carregar a imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (content: string) => {
    try {
      setIsLoading(true);
      const response = await chatPersonal({
        usuario,
        historico: [
          { role: 'system', content: 'Você é o personal trainer inteligente do FitPro.' },
          ...toChatHistoryPayload(state.chatHistory),
        ],
        mensagem: content,
        planoAtual: state.currentPlan ?? state.pendingPlan ?? undefined,
        imageDataUrl,
      });

      replaceChatHistory(
        response.historico.map(message => ({
          role: message.role,
          content: message.content,
          createdAt: new Date().toISOString(),
        })),
      );
      setImageDataUrl(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar mensagem.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    replaceChatHistory([]);
    toast.success('Histórico do chat limpo.');
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <MessageSquareText className="size-5 text-primary" />
                  Chat Personal
                </CardTitle>
                <CardDescription>
                  Tire dúvidas sobre treino, dieta e evolução. Você também pode enviar uma imagem como contexto.
                </CardDescription>
              </div>
              <Button variant="outline" onClick={clearHistory}>
                <Trash2 className="mr-2 size-4" />
                Limpar histórico
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
                <ImagePlus className="size-4" />
                Enviar imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageChange(e.target.files?.[0])}
                />
              </label>

              {imageDataUrl && (
                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 px-3 py-2">
                  <img src={imageDataUrl} alt="Prévia" className="h-12 w-12 rounded object-cover" />
                  <p className="text-sm text-muted-foreground">A imagem será enviada na próxima mensagem.</p>
                  <Button variant="ghost" size="sm" onClick={() => setImageDataUrl(undefined)}>
                    Remover
                  </Button>
                </div>
              )}
            </div>

            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={isLoading}
              height="68vh"
              placeholder="Pergunte sobre treino, dieta, execução, evolução ou ajuste do plano..."
              emptyStateMessage="Comece uma conversa com seu personal inteligente."
              suggestedPrompts={[
                'Como adaptar meu treino para hipertrofia com 45 minutos por sessão?',
                'Analise meu plano atual e diga o que devo priorizar nesta semana.',
                'Com base no meu objetivo, o que ajustar na dieta hoje?',
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
