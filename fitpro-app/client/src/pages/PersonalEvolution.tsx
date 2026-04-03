import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Camera, LineChart, RefreshCcw, ShieldAlert } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { usePersonalTrainer } from '@/contexts/PersonalTrainerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { analisarFoto, avaliarProgresso } from '@/lib/personalApi';
import { buildPersonalApiUserPayload, buildWorkoutHistoryPayload } from '@/lib/personalMappers';

export default function PersonalEvolution() {
  const { state: appState } = useApp();
  const { state, setLatestPhotoAnalysis, addProgressEvaluation } = usePersonalTrainer();
  const [feedback, setFeedback] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const usuario = useMemo(() => buildPersonalApiUserPayload({
    profile: appState.profile,
    nivel: state.preferences.nivel,
    frequencia: state.preferences.frequencia,
    restricoes: state.preferences.restricoes,
    historico: state.preferences.historico,
    fotos: appState.progressPhotos,
  }), [appState.profile, appState.progressPhotos, state.preferences]);

  const workoutsById = useMemo(
    () => Object.fromEntries(appState.workouts.map(workout => [workout.id, workout.name])),
    [appState.workouts],
  );

  const workoutHistory = useMemo(
    () => buildWorkoutHistoryPayload(appState.workoutSessions, workoutsById),
    [appState.workoutSessions, workoutsById],
  );

  const latestWeight = appState.weightEntries.at(-1)?.weight ?? appState.profile.weight;

  const handleImageChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(String(reader.result));
    reader.onerror = () => toast.error('Não foi possível carregar a imagem.');
    reader.readAsDataURL(file);
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      toast.error('Selecione uma imagem corporal para análise.');
      return;
    }

    try {
      setIsAnalyzingPhoto(true);
      const analysis = await analisarFoto({
        usuario,
        imageDataUrl: selectedImage,
      });
      setLatestPhotoAnalysis(analysis);
      toast.success('Análise de foto concluída.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao analisar foto.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleEvaluateProgress = async () => {
    try {
      setIsEvaluating(true);
      const evaluation = await avaliarProgresso({
        usuario,
        historicoTreinos: workoutHistory,
        pesoAtual: latestWeight,
        feedback: feedback.trim() || 'Sem observações adicionais.',
      });
      addProgressEvaluation(evaluation);
      toast.success('Avaliação de progresso gerada com sucesso.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao avaliar progresso.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const latestEvaluation = state.progressEvaluations[0]?.data;

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <LineChart className="size-5 text-primary" />
              Evolução Inteligente
            </CardTitle>
            <CardDescription>
              Analise sua evolução com base no peso, histórico de treinos, feedback e fotos corporais.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="size-4 text-primary" />
                Analisar foto
              </CardTitle>
              <CardDescription>
                A análise usa estimativa visual e não substitui avaliação física ou médica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">
                Selecionar foto corporal
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageChange(e.target.files?.[0])}
                />
              </label>

              {selectedImage && (
                <img src={selectedImage} alt="Prévia da análise corporal" className="max-h-80 w-full rounded-lg object-cover" />
              )}

              <Button onClick={handleAnalyzePhoto} disabled={isAnalyzingPhoto || !selectedImage}>
                {isAnalyzingPhoto ? 'Analisando foto...' : 'Analisar foto'}
              </Button>

              {state.latestPhotoAnalysis && (
                <div className="space-y-3 rounded-lg border border-border p-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-muted-foreground">Gordura corporal</p>
                      <p className="font-semibold">{state.latestPhotoAnalysis.analise.gordura_corporal}</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-muted-foreground">Massa muscular</p>
                      <p className="font-semibold">{state.latestPhotoAnalysis.analise.massa_muscular}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-semibold">Pontos fortes</p>
                    <div className="flex flex-wrap gap-2">
                      {state.latestPhotoAnalysis.analise.pontos_fortes.map(item => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-semibold">Pontos fracos</p>
                    <div className="flex flex-wrap gap-2">
                      {state.latestPhotoAnalysis.analise.pontos_fracos.map(item => (
                        <Badge key={item} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-semibold">Recomendações</p>
                    <div className="space-y-1 text-muted-foreground">
                      {state.latestPhotoAnalysis.recomendacoes.map(item => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md bg-amber-500/10 p-3 text-amber-200">
                    {state.latestPhotoAnalysis.observacao}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCcw className="size-4 text-primary" />
                Avaliar progresso
              </CardTitle>
              <CardDescription>
                Combine dados do app com a sua percepção da semana para receber um diagnóstico de evolução e próximos ajustes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3 text-sm">
                  <p className="text-muted-foreground">Peso atual</p>
                  <p className="text-lg font-semibold">{latestWeight} kg</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-sm">
                  <p className="text-muted-foreground">Treinos registrados</p>
                  <p className="text-lg font-semibold">{appState.workoutSessions.length}</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-sm">
                  <p className="text-muted-foreground">Fotos salvas</p>
                  <p className="text-lg font-semibold">{appState.progressPhotos.length}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-evolucao">Feedback do usuário</Label>
                <Textarea
                  id="feedback-evolucao"
                  className="min-h-28"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Ex.: tive dificuldade em aumentar carga no supino, dormi mal nesta semana e falhei na dieta duas vezes."
                />
              </div>

              <Button onClick={handleEvaluateProgress} disabled={isEvaluating}>
                {isEvaluating ? 'Avaliando progresso...' : 'Avaliar progresso'}
              </Button>

              {latestEvaluation && (
                <div className="space-y-4 rounded-lg border border-border p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{latestEvaluation.status}</Badge>
                    <Badge variant={latestEvaluation.necessita_novo_plano ? 'destructive' : 'secondary'}>
                      {latestEvaluation.necessita_novo_plano ? 'Novo plano recomendado' : 'Manter plano atual'}
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-muted-foreground">Carga</p>
                      <p className="font-medium">{latestEvaluation.ajustes.carga}</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-muted-foreground">Intensidade</p>
                      <p className="font-medium">{latestEvaluation.ajustes.intensidade}</p>
                    </div>
                    <div className="rounded-md bg-muted/50 p-3">
                      <p className="text-muted-foreground">Cardio</p>
                      <p className="font-medium">{latestEvaluation.ajustes.cardio}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-semibold">Recomendações</p>
                    <div className="space-y-1 text-muted-foreground">
                      {latestEvaluation.recomendacoes.map(item => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="mt-0.5 size-4 text-amber-400" />
                  <p>
                    O sistema evita diagnósticos médicos e trabalha com orientação fitness e estimativas visuais, conforme boas práticas de segurança.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
