import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Dumbbell, Utensils, CheckCircle2, RefreshCcw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { usePersonalTrainer } from '@/contexts/PersonalTrainerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { gerarPlano, ajustarPlano } from '@/lib/personalApi';
import {
  buildDietImport,
  buildPersonalApiUserPayload,
  buildWorkoutImport,
  buildWorkoutPlanSummary,
  mapGoalToObjective,
} from '@/lib/personalMappers';

export default function PersonalPlan() {
  const { state: appState, addWorkout, addWorkoutPlan, addFoodToMeal, updateProfile } = useApp();
  const {
    state,
    updatePreferences,
    setPendingPlan,
    acceptPlan,
  } = usePersonalTrainer();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const activePlan = state.pendingPlan ?? state.currentPlan;

  const personalPayload = useMemo(() => buildPersonalApiUserPayload({
    profile: appState.profile,
    nivel: state.preferences.nivel,
    frequencia: state.preferences.frequencia,
    restricoes: state.preferences.restricoes,
    historico: state.preferences.historico,
    fotos: appState.progressPhotos,
  }), [appState.profile, appState.progressPhotos, state.preferences]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const plan = await gerarPlano(personalPayload);
      setPendingPlan(plan);
      toast.success('Plano gerado com sucesso. Revise o preview antes de aceitar.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível gerar o plano.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdjust = async () => {
    if (!activePlan) {
      toast.error('Gere ou selecione um plano antes de pedir ajustes.');
      return;
    }

    if (!feedback.trim()) {
      toast.error('Escreva um feedback para ajustar o plano.');
      return;
    }

    try {
      setIsAdjusting(true);
      const adjusted = await ajustarPlano(personalPayload, activePlan, feedback.trim());
      setPendingPlan(adjusted);
      toast.success('Plano ajustado com base no seu feedback.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível ajustar o plano.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleAccept = () => {
    const plan = state.pendingPlan ?? state.currentPlan;
    if (!plan) {
      toast.error('Nenhum plano disponível para aceitar.');
      return;
    }

    const workouts = buildWorkoutImport(plan);
    workouts.forEach(workout => addWorkout(workout));

    const summary = buildWorkoutPlanSummary(
      plan,
      mapGoalToObjective(appState.profile.goal),
      state.preferences.nivel,
    );
    addWorkoutPlan(summary);

    buildDietImport(plan).forEach(item => {
      addFoodToMeal(item.mealType, item.food);
    });

    updateProfile({
      calorieGoal: plan.dieta.calorias_estimadas,
    });

    acceptPlan(plan);
    setPendingPlan(null);
    toast.success('Plano aceito e salvo no aplicativo.');
  };

  return (
    <div className="min-h-screen bg-background px-4 pb-24 pt-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Card className="border-primary/20 bg-card/90">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Sparkles className="size-5 text-primary" />
                  Personal Trainer Inteligente
                </CardTitle>
                <CardDescription>
                  Gere treino, dieta e acompanhamento personalizado com base no seu perfil atual.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                API segura no backend
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nivel">Nível</Label>
              <select
                id="nivel"
                value={state.preferences.nivel}
                onChange={e => updatePreferences({ nivel: e.target.value as typeof state.preferences.nivel })}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencia">Frequência semanal de treino</Label>
              <Input
                id="frequencia"
                type="number"
                min={1}
                max={7}
                value={state.preferences.frequencia}
                onChange={e => updatePreferences({ frequencia: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="restricoes">Restrições, lesões, limitações ou preferências</Label>
              <Textarea
                id="restricoes"
                value={state.preferences.restricoes}
                onChange={e => updatePreferences({ restricoes: e.target.value })}
                placeholder="Ex.: dor no ombro, intolerância à lactose, pouco tempo por sessão..."
                className="min-h-24"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? 'Gerando plano...' : 'Gerar plano'}
              </Button>
              <Button variant="outline" onClick={handleAdjust} disabled={isAdjusting || !activePlan}>
                <RefreshCcw className="mr-2 size-4" />
                {isAdjusting ? 'Ajustando...' : 'Ajustar plano'}
              </Button>
              <Button variant="secondary" onClick={handleAccept} disabled={!activePlan}>
                <CheckCircle2 className="mr-2 size-4" />
                ACEITAR PLANO
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback para ajuste</CardTitle>
            <CardDescription>
              Use este campo para pedir mudanças como volume menor, foco em hipertrofia, menos cardio ou refeições mais simples.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="min-h-24"
              placeholder="Ex.: quero treinos de até 45 minutos e dieta com alimentos mais baratos."
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="size-4 text-primary" />
                Preview do treino
              </CardTitle>
              <CardDescription>
                Visualize a divisão, os focos por dia e os exercícios antes de aceitar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activePlan ? (
                <p className="text-sm text-muted-foreground">
                  Gere um plano para visualizar o preview do treino e da dieta.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{activePlan.treino.divisao}</Badge>
                    <Badge variant="outline">{activePlan.treino.nivel_intensidade}</Badge>
                    <Badge variant="secondary">{activePlan.treino.dias.length} dias</Badge>
                  </div>
                  {activePlan.treino.dias.map(day => (
                    <div key={`${day.dia}-${day.foco}`} className="rounded-lg border border-border p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="font-semibold">{day.dia}</h3>
                        <Badge variant="outline">{day.foco}</Badge>
                      </div>
                      <div className="space-y-3">
                        {day.exercicios.map(exercise => (
                          <div key={`${day.dia}-${exercise.nome}`} className="rounded-md bg-muted/50 p-3 text-sm">
                            <div className="font-medium text-foreground">{exercise.nome}</div>
                            <div className="mt-1 text-muted-foreground">
                              {exercise.series} séries • {exercise.repeticoes} • descanso {exercise.descanso}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{exercise.observacao}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="size-4 text-primary" />
                Preview da dieta
              </CardTitle>
              <CardDescription>
                O plano alimentar é salvo junto com o treino quando você aceita o plano.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activePlan ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma dieta gerada ainda.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-muted-foreground">Calorias</p>
                      <p className="text-lg font-semibold">{activePlan.dieta.calorias_estimadas} kcal</p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-muted-foreground">Macros</p>
                      <p className="text-sm font-medium">P {activePlan.dieta.macros.proteina}</p>
                      <p className="text-sm font-medium">C {activePlan.dieta.macros.carboidrato}</p>
                      <p className="text-sm font-medium">G {activePlan.dieta.macros.gordura}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activePlan.dieta.refeicoes.map((meal, index) => (
                      <div key={index} className="rounded-lg border border-border p-3 text-sm">
                        {typeof meal === 'string' ? (
                          <p>{meal}</p>
                        ) : (
                          <>
                            <p className="font-semibold">{meal.nome}</p>
                            <div className="mt-2 space-y-1 text-muted-foreground">
                              {meal.alimentos.map(food => (
                                <p key={food}>{food}</p>
                              ))}
                              {meal.observacao && <p>{meal.observacao}</p>}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {activePlan.observacoes_gerais.length > 0 && (
                    <div className="rounded-lg bg-primary/5 p-3 text-sm">
                      <p className="mb-2 font-semibold">Observações gerais</p>
                      <div className="space-y-1 text-muted-foreground">
                        {activePlan.observacoes_gerais.map(note => (
                          <p key={note}>{note}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
