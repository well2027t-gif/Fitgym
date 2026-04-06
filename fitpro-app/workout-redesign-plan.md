# Redesenho do Sistema de Treinos — FitGym

## Decisão de arquitetura

O novo sistema de treinos será construído em cima do `AppContext` como fonte principal de verdade do aplicativo, aproveitando o `PersonalTrainerContext` apenas como apoio para preferências já existentes de geração inteligente. A lógica central de treino, execução, histórico e integração com perfil ficará no estado global principal para evitar duplicidade entre telas.

## Expansão do perfil do usuário

O `UserProfile` passará a contemplar os dados exigidos pelo sistema de treinos:

- `sex`
- `level`
- `trainingFrequency`
- `trainingLocation`
- `availableEquipment`
- `limitations`

Esses dados serão editáveis na tela de perfil e usados automaticamente ao entrar em `Treinos`.

## Modelo funcional de treinos

Os treinos passarão a ter origem e modo explícitos:

- `origin`: `auto` | `manual`
- `dayKey`: identificador do dia/ordem dentro da divisão semanal
- `videoUrl` por exercício
- `muscleGroup` por exercício
- `instructions` opcionais por exercício

Além disso, o estado global ganhará uma configuração de planejamento de treino:

- `workoutMode`: `auto` | `manual` | `unset`
- `lastAutoProfileSignature`: hash/string derivada do perfil para detectar mudanças relevantes
- `lastGeneratedAt`
- `autoPlanSummary`

## Fluxo da aba Treinos

A tela `Workouts.tsx` será transformada em um hub com quatro áreas:

1. **Visão geral do plano atual** com resumo de perfil usado, divisão semanal e CTA principal.
2. **Escolha inicial do tipo de treino** quando `workoutMode` estiver como `unset`.
3. **Modo automático** com geração local baseada nas regras de frequência, nível, local e limitações.
4. **Modo manual** com construtor de treinos por dia, biblioteca de exercícios e edição rápida.

## Regras de geração automática

A geração automática inicial será local e determinística, sem depender de backend:

- 2–3 dias: `Full Body`
- 4 dias: `Upper / Lower`
- 5–6 dias: divisão por grupos musculares

As listas de exercícios serão filtradas/adaptadas por:

- nível do usuário
- local de treino (`academia` ou `casa`)
- equipamentos disponíveis
- limitações/lesões
- objetivo principal

## Biblioteca de exercícios

Será criada uma biblioteca local com metadados padronizados:

- nome
- grupo muscular
- nível recomendado
- local compatível
- equipamentos necessários
- restrições comuns
- vídeo demonstrativo
- séries/repetições/descanso sugeridos

Essa biblioteca abastecerá tanto o modo automático quanto o modo manual.

## Execução do treino

A tela `WorkoutActive.tsx` será expandida para suportar:

- registro de carga por exercício
- progresso por exercício e por séries
- cronômetro de descanso com acionamento contextual
- ação de pular exercício
- finalização com persistência de detalhes reais executados

## Histórico e evolução

O salvamento de sessão será enriquecido com:

- carga usada por exercício
- séries concluídas por exercício
- exercícios pulados
- progresso percentual
- duração total

Esses dados alimentarão a tela de histórico existente e também cartões resumidos dentro da área de treinos.

## Atualização automática com base no perfil

Quando o perfil for alterado em campos relevantes para treino, a aba `Treinos` exibirá um aviso com CTA:

> Atualizar treino automaticamente

Ao confirmar, o app substitui o plano automático anterior por um novo conjunto coerente com o perfil atualizado. No modo manual, o sistema apenas sugere regeneração, sem sobrescrever automaticamente.

## Estratégia de implementação

1. Ampliar tipos e estado no `AppContext`.
2. Adicionar utilitários e biblioteca local de exercícios.
3. Reescrever `Workouts.tsx` como hub do sistema.
4. Expandir `WorkoutActive.tsx` para execução rica.
5. Estender `Profile.tsx` com campos de treino ausentes.
6. Ajustar rotas auxiliares e persistência/histórico.
