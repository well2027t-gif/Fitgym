import type { Express, Request, Response } from "express";
import { z } from "zod";
import { invokeLLM, type Message } from "./_core/llm";

const objectiveSchema = z.enum(["hipertrofia", "emagrecimento", "definicao"]);
const levelSchema = z.enum(["iniciante", "intermediario", "avancado"]);

const personalUserSchema = z.object({
  idade: z.number().int().min(12).max(100),
  peso: z.number().min(30).max(350),
  altura: z.number().min(120).max(240),
  objetivo: objectiveSchema,
  nivel: levelSchema,
  frequencia: z.number().int().min(1).max(7),
  restricoes: z.string().max(1200).default(""),
  historico: z.array(z.string()).default([]),
  fotos: z.array(z.string()).default([]),
});

const exerciseSchema = z.object({
  nome: z.string().min(1),
  series: z.number().int().min(3).max(5),
  repeticoes: z.string().min(1),
  descanso: z.string().min(1),
  observacao: z.string().min(1),
});

const generatedPlanSchema = z.object({
  treino: z.object({
    divisao: z.string().min(1),
    nivel_intensidade: z.string().min(1),
    dias: z.array(z.object({
      dia: z.string().min(1),
      foco: z.string().min(1),
      exercicios: z.array(exerciseSchema).min(1).max(6),
    })).min(1).max(7),
  }),
  dieta: z.object({
    calorias_estimadas: z.number().min(1200).max(8000),
    macros: z.object({
      proteina: z.string().min(1),
      carboidrato: z.string().min(1),
      gordura: z.string().min(1),
    }),
    refeicoes: z.array(z.union([
      z.string().min(1),
      z.object({
        nome: z.string().min(1),
        alimentos: z.array(z.string()).default([]),
        observacao: z.string().optional(),
      }),
    ])).min(1),
  }),
  progresso: z.record(z.string(), z.any()).default({}),
  observacoes_gerais: z.array(z.string()).default([]),
});

const photoAnalysisSchema = z.object({
  analise: z.object({
    gordura_corporal: z.string().min(1),
    massa_muscular: z.string().min(1),
    pontos_fortes: z.array(z.string()).default([]),
    pontos_fracos: z.array(z.string()).default([]),
  }),
  recomendacoes: z.array(z.string()).default([]),
  observacao: z.string().min(1),
});

const progressEvaluationSchema = z.object({
  status: z.enum(["evoluindo", "estagnado", "regredindo"]),
  ajustes: z.object({
    carga: z.string().min(1),
    intensidade: z.string().min(1),
    cardio: z.string().min(1),
  }),
  recomendacoes: z.array(z.string()).default([]),
  necessita_novo_plano: z.boolean(),
});

const generatePlanInputSchema = z.object({
  usuario: personalUserSchema,
});

const adjustPlanInputSchema = z.object({
  usuario: personalUserSchema,
  planoAtual: generatedPlanSchema,
  feedback: z.string().min(3).max(2500),
});

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(12000),
});

const chatInputSchema = z.object({
  usuario: personalUserSchema,
  historico: z.array(chatMessageSchema).max(30).default([]),
  mensagem: z.string().min(1).max(4000),
  planoAtual: generatedPlanSchema.optional(),
  imageDataUrl: z.string().optional(),
});

const analyzePhotoInputSchema = z.object({
  usuario: personalUserSchema,
  imageDataUrl: z.string().min(32),
});

const workoutHistoryItemSchema = z.object({
  date: z.string().min(1),
  workoutName: z.string().min(1),
  durationSeconds: z.number().min(0),
  completedExercises: z.number().int().min(0),
});

const progressInputSchema = z.object({
  usuario: personalUserSchema,
  historicoTreinos: z.array(workoutHistoryItemSchema).default([]),
  pesoAtual: z.number().min(30).max(350),
  feedback: z.string().min(3).max(2500),
});

function jsonResponse(res: Response, status: number, body: unknown) {
  res.status(status).json(body);
}

function sanitizeJsonString(content: string): string {
  const trimmed = content.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function extractAssistantText(result: Awaited<ReturnType<typeof invokeLLM>>) {
  const content = result.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(part => (part.type === "text" ? part.text : ""))
      .join("\n")
      .trim();
  }
  return "";
}

async function invokeStructuredJson<T>(messages: Message[], schema: z.ZodType<T>): Promise<T> {
  const result = await invokeLLM({
    messages,
    responseFormat: { type: "json_object" },
  });
  const text = extractAssistantText(result);
  const parsed = JSON.parse(sanitizeJsonString(text));
  return schema.parse(parsed);
}

function buildCoreSystemPrompt() {
  return [
    "Você é uma IA profissional que atua como PERSONAL TRAINER, NUTRICIONISTA ESPORTIVO e COACH DE EVOLUÇÃO.",
    "Seja profissional, direta, motivadora, objetiva e adaptável ao usuário.",
    "Nunca recomende substâncias, anabolizantes, hormônios ou condutas ilegais.",
    "Nunca dê diagnóstico médico e nunca trate análise visual como certeza absoluta.",
    "Evite extremos, respeite o nível do usuário e reduza risco de overtraining.",
    "Toda resposta estruturada deve ser JSON puro, válido, sem markdown e sem texto fora do JSON.",
    "Treino: máximo de 6 exercícios por treino, entre 3 e 5 séries, incluir descanso e progressão de carga.",
    "Dieta: nunca abaixo de 1200 kcal, usar alimentos simples, distribuição equilibrada e adequada ao objetivo.",
  ].join(" ");
}

function buildPlanPrompt(usuario: z.infer<typeof personalUserSchema>) {
  return [
    "Gere um plano inicial completo de treino e dieta seguindo estritamente o formato solicitado.",
    "Mantenha linguagem técnica, porém simples.",
    "No campo progresso, traga metas práticas para 4 semanas.",
    "Nas observacoes_gerais, liste alertas de execução, hidratação, sono e recuperação.",
    `Dados do usuário: ${JSON.stringify(usuario)}`,
    "Formato obrigatório:",
    JSON.stringify({
      treino: {
        divisao: "",
        nivel_intensidade: "",
        dias: [
          {
            dia: "",
            foco: "",
            exercicios: [
              {
                nome: "",
                series: 3,
                repeticoes: "",
                descanso: "",
                observacao: "",
              },
            ],
          },
        ],
      },
      dieta: {
        calorias_estimadas: 0,
        macros: {
          proteina: "",
          carboidrato: "",
          gordura: "",
        },
        refeicoes: [],
      },
      progresso: {},
      observacoes_gerais: [],
    }),
  ].join("\n");
}

function buildAdjustmentPrompt(input: z.infer<typeof adjustPlanInputSchema>) {
  return [
    "Ajuste o plano atual usando o feedback recebido.",
    "Mantenha o mesmo formato JSON obrigatório.",
    "Se o feedback indicar dificuldade, reduza volume, intensidade ou complexidade quando apropriado.",
    `Usuário: ${JSON.stringify(input.usuario)}`,
    `Plano atual: ${JSON.stringify(input.planoAtual)}`,
    `Feedback: ${input.feedback}`,
  ].join("\n");
}

function buildChatPrompt(input: z.infer<typeof chatInputSchema>) {
  const planContext = input.planoAtual ? `Plano atual: ${JSON.stringify(input.planoAtual)}` : "Plano atual: ainda não gerado.";
  return [
    buildCoreSystemPrompt(),
    "Responda em português do Brasil.",
    "Se houver imagem, use-a apenas como apoio contextual e deixe claro que qualquer percepção visual é estimativa.",
    "Responda de forma objetiva, útil e humana, em no máximo 8 parágrafos curtos.",
    `Dados do usuário: ${JSON.stringify(input.usuario)}`,
    planContext,
  ].join("\n");
}

function buildPhotoPrompt(usuario: z.infer<typeof personalUserSchema>) {
  return [
    "Analise visualmente a foto corporal com cautela e sempre em linguagem de estimativa.",
    "Não afirme diagnósticos, não use certeza absoluta e não invente medições clínicas.",
    "Retorne JSON puro exatamente no formato solicitado com estimativas prudentes.",
    `Dados do usuário: ${JSON.stringify(usuario)}`,
    "Observação obrigatória: deixar claro que a análise é baseada em estimativa visual.",
  ].join("\n");
}

function buildProgressPrompt(input: z.infer<typeof progressInputSchema>) {
  return [
    "Avalie a evolução do usuário com base no histórico, peso atual e feedback informado.",
    "Classifique como evoluindo, estagnado ou regredindo.",
    "Proponha ajustes práticos em carga, intensidade e cardio.",
    "Indique se necessita_novo_plano deve ser true ou false.",
    `Dados do usuário: ${JSON.stringify(input.usuario)}`,
    `Histórico de treinos: ${JSON.stringify(input.historicoTreinos)}`,
    `Peso atual: ${input.pesoAtual}`,
    `Feedback: ${input.feedback}`,
  ].join("\n");
}

async function handleGeneratePlan(req: Request, res: Response) {
  try {
    const input = generatePlanInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        { role: "user", content: buildPlanPrompt(input.usuario) },
      ],
      generatedPlanSchema,
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}

async function handleAdjustPlan(req: Request, res: Response) {
  try {
    const input = adjustPlanInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        { role: "user", content: buildAdjustmentPrompt(input) },
      ],
      generatedPlanSchema,
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}

async function handleChatPersonal(req: Request, res: Response) {
  try {
    const input = chatInputSchema.parse(req.body);
    const messages: Message[] = [
      { role: "system", content: buildChatPrompt(input) },
      ...input.historico.map(message => ({ role: message.role, content: message.content })),
      input.imageDataUrl
        ? {
            role: "user",
            content: [
              { type: "text", text: input.mensagem },
              { type: "image_url", image_url: { url: input.imageDataUrl, detail: "low" } },
            ],
          }
        : { role: "user", content: input.mensagem },
    ];

    const result = await invokeLLM({ messages });
    const resposta = extractAssistantText(result).trim();

    jsonResponse(res, 200, {
      resposta,
      historico: [
        ...input.historico,
        { role: "user", content: input.imageDataUrl ? `${input.mensagem}\n[imagem enviada]` : input.mensagem },
        { role: "assistant", content: resposta },
      ],
    });
  } catch (error) {
    handleError(res, error);
  }
}

async function handleAnalyzePhoto(req: Request, res: Response) {
  try {
    const input = analyzePhotoInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        {
          role: "user",
          content: [
            { type: "text", text: buildPhotoPrompt(input.usuario) },
            { type: "image_url", image_url: { url: input.imageDataUrl, detail: "high" } },
          ],
        },
      ],
      photoAnalysisSchema,
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}

async function handleEvaluateProgress(req: Request, res: Response) {
  try {
    const input = progressInputSchema.parse(req.body);
    const data = await invokeStructuredJson(
      [
        { role: "system", content: buildCoreSystemPrompt() },
        { role: "user", content: buildProgressPrompt(input) },
      ],
      progressEvaluationSchema,
    );
    jsonResponse(res, 200, data);
  } catch (error) {
    handleError(res, error);
  }
}

function handleError(res: Response, error: unknown) {
  console.error("[Personal API]", error);
  if (error instanceof z.ZodError) {
    return jsonResponse(res, 400, {
      error: "Dados inválidos",
      details: error.flatten(),
    });
  }
  if (error instanceof SyntaxError) {
    return jsonResponse(res, 502, {
      error: "A IA retornou um JSON inválido. Tente novamente.",
    });
  }
  return jsonResponse(res, 500, {
    error: error instanceof Error ? error.message : "Falha interna ao processar a solicitação.",
  });
}

export function registerPersonalRoutes(app: Express) {
  const routes: Array<[string, (req: Request, res: Response) => Promise<void>]> = [
    ["/api/gerar-plano", handleGeneratePlan],
    ["/api/ajustar-plano", handleAdjustPlan],
    ["/api/chat-personal", handleChatPersonal],
    ["/api/analisar-foto", handleAnalyzePhoto],
    ["/api/avaliar-progresso", handleEvaluateProgress],
    ["/gerar-plano", handleGeneratePlan],
    ["/ajustar-plano", handleAdjustPlan],
    ["/chat-personal", handleChatPersonal],
    ["/analisar-foto", handleAnalyzePhoto],
    ["/avaliar-progresso", handleEvaluateProgress],
  ];

  routes.forEach(([path, handler]) => {
    app.post(path, (req, res) => {
      void handler(req, res);
    });
  });
}

export type PersonalUserInput = z.infer<typeof personalUserSchema>;
export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
export type PhotoAnalysis = z.infer<typeof photoAnalysisSchema>;
export type ProgressEvaluation = z.infer<typeof progressEvaluationSchema>;
export type ChatHistoryMessage = z.infer<typeof chatMessageSchema>;
