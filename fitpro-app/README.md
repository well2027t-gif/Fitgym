# 🏋️ FitPro — Academia & Dieta

**Aplicativo Premium PWA de Academia e Dieta com Visual Moderno e Experiência Premium**

Versão: 3.0  
Status: ✅ Completo e Funcional  
Tipo: PWA (Progressive Web App) — Pronto para conversão em App Mobile (iOS/Android)

---

## 📋 Visão Geral

FitPro é um aplicativo completo para gerenciamento de treinos, dieta e progresso físico. Todos os dados são salvos localmente no dispositivo (localStorage), permitindo uso offline total. O app possui visual premium com dark mode obrigatório, temas customizáveis e animações suaves.

---

## ✨ Funcionalidades Principais

### 🏠 Dashboard (Home)

**O que aparece:**
- **Hero Section**: Saudação personalizada (Bom dia/tarde/noite), nome do usuário, objetivo e peso atual
- **Menu de Tema**: Dropdown no header para selecionar cores (Verde, Azul, Rosa) — muda todo o app em tempo real
- **Card de Calorias**: Anel circular animado mostrando % de calorias consumidas vs meta diária
  - Barras de macros (Proteína, Carboidrato, Gordura) com cores dinâmicas
  - Calorias restantes para o dia
- **Treino do Dia**: Exibe o treino selecionado com grupos musculares e botão "Iniciar Treino"
- **Resumo da Dieta**: Grid com 4 refeições (Café, Almoço, Lanche, Janta) mostrando calorias de cada uma
- **Card de Gamificação**: Pontos totais, sequência de dias (streak), recorde de sequência e 8 badges desbloqueáveis
  - Badges: Primeiro Treino, Semana de Fogo, Mês Implacável, Meta Atingida, Fotógrafo, Nutricionista, Recorde Pessoal, Consistência
- **Fotos de Evolução**: Grid 3x1 com as 3 últimas fotos de evolução corporal (clique para ir para Progresso)
- **Gráfico de Peso Semanal**: Área chart com evolução de peso dos últimos 7 dias
- **Stats Row**: 3 cards mostrando Meta Calórica, Total de Treinos e Peso Atual

**Funcionalidades Ocultas:**
- Dados são salvos automaticamente no localStorage
- Streak é calculado automaticamente baseado em treinos realizados
- Pontos são acumulados por: treinos (100 pts), fotos (50 pts), badges (200 pts)

---

### 💪 Treinos

**Página de Treinos:**
- **Lista de Treinos**: Cards com gradientes baseados no grupo muscular principal
  - Exibe: Nome, grupos musculares, número de exercícios, volume total (séries × reps × carga)
  - Badge "Treino do Dia" destacado em verde
- **Criar Novo Treino**: Modal com swipe-to-close e scroll suave
  - Seleção de grupos musculares (Peito, Costas, Ombro, Bíceps, Tríceps, Antebraço, Perna, Glúteo)
  - Adição de exercícios com séries, repetições, carga e tempo de descanso
- **Editar/Deletar Treinos**: Botões em cada card
- **Selecionar Treino do Dia**: Clique em um treino para defini-lo como treino de hoje

**Modo Ativo (Treino em Andamento):**
- **Exercício em Destaque**: Card grande com nome, séries, reps, carga e descanso
- **Timer de Descanso**: Círculo animado com progresso visual
  - Controles: Play/Pause, Pular, Resetar
  - Animação de escala no countdown
- **Lista de Exercícios**: Numeração visual (1, 2, 3...) com checkboxes
  - Marcar como concluído com animação
  - Progresso geral na barra do header
- **Tela de Conclusão**: Ao terminar todos os exercícios, exibe mensagem de parabéns com opção de voltar

**Funcionalidades Ocultas:**
- Volume total é calculado automaticamente (séries × reps × carga)
- Duração estimada do treino é calculada
- Treinos são salvos com ID único
- Histórico de treinos realizados é mantido

---

### 🍽️ Dieta

**Página de Dieta:**
- **4 Refeições**: Café da Manhã, Almoço, Lanche, Janta
- **Adicionar Alimentos**: Modal para cada refeição
  - Nome do alimento, calorias, proteína, carboidrato, gordura
  - Atalhos de alimentos rápidos (pré-configurados)
- **Soma Automática**: Totais de calorias e macros são calculados em tempo real
- **Meta Calórica**: Editável no card principal
  - Mostra calorias consumidas vs meta
  - Barra de progresso visual
- **Gráficos de Macros**: Distribuição visual de proteína, carboidrato e gordura

**Funcionalidades Ocultas:**
- Cálculo automático de calorias por macro (Prot: 4 kcal/g, Carb: 4 kcal/g, Gord: 9 kcal/g)
- Alimentos são salvos por dia
- Histórico de dietas anteriores é mantido

---

### 📊 Progresso

**Página de Progresso:**
- **Gráfico de Peso**: Linha chart com evolução de peso (últimos 30 dias)
  - Mostra tendência de ganho/perda
  - Tooltip com data e peso
- **Registro Manual de Peso**: Formulário para adicionar novo peso
  - Data e valor em kg
  - Histórico completo
- **Fotos de Evolução**: Grid com todas as fotos
  - Upload de fotos via câmera ou galeria
  - Data de cada foto
  - Clique para visualizar em tamanho maior
- **Medidas Corporais**: Campos para registrar
  - Peito, cintura, quadril, coxa, braço, panturrilha
  - Histórico de medidas

**Funcionalidades Ocultas:**
- Fotos são armazenadas como base64 no localStorage
- Gráfico mostra automaticamente tendência (seta para cima/baixo)
- Cálculo automático de diferença de peso

---

### 👤 Perfil

**Dados Pessoais:**
- Nome (editável inline)
- Idade (editável inline)
- Altura (editável inline)
- Peso (editável inline)
- Objetivo (dropdown: Ganhar Massa, Perder Gordura, Manter Peso, Definição, Resistência)

**Metas Nutricionais:**
- Meta Calórica Diária (editável)
- Meta de Proteína (editável)
- Meta de Carboidrato (editável)
- Meta de Gordura (editável)
- IMC Calculado Automaticamente

**Calculador de Gordura Corporal:**
- Método de Pollock (3 medidas)
- Para Homens: Peito, Abdômen, Tríceps
- Para Mulheres: Tríceps, Supra-ilíaca, Abdômen
- Exibe: % de gordura, classificação (essencial, atlético, fitness, aceitável, elevado), peso de gordura, massa magra

**Seletor de Temas:**
- 3 cores: Verde (#22c55e), Azul (#3b82f6), Rosa (#ec4899)
- Cada cor aparece com sua cor real em um card horizontal
- Círculo colorido, check animado, indicador pulsante quando selecionado
- Muda todo o app em tempo real

**Funcionalidades Ocultas:**
- Todos os dados são salvos no localStorage
- IMC é calculado automaticamente (peso / altura²)
- Gordura corporal é calculada usando fórmula de Pollock

---

### 🎯 Funcionalidades Extras (via FAB)

**FAB (Floating Action Button):**
- Ícone de pezinho + peso (Scale) no canto inferior direito
- Menu expansível com 4 opções:

#### 📈 Histórico
- Gráfico de volume levantado por exercício
- Histórico de treinos realizados
- Estatísticas de força

#### 📖 Planos de Treino Pré-prontos
- Templates por objetivo (Ganhar Massa, Perder Gordura, Força)
- Clique para usar como base e customizar

#### 🧮 Calculadora 1RM
- Estima peso máximo que consegue levantar
- Fórmulas: Epley e Brzycki
- Baseado em peso e repetições

#### 📤 Compartilhamento
- Gera card com suas conquistas
- Pontos, streak, badges
- Copiar para compartilhar em redes sociais

---

## 🎨 Design & Visual

**Tema:**
- Dark Mode Obrigatório (fundo #0d0d0f)
- Cores Dinâmicas: Verde, Azul, Rosa
- Tipografia: Space Grotesk (títulos), Outfit (corpo)
- Glassmorphism nos cards com bordas arredondadas
- Sombras suaves e coloridas

**Animações:**
- Framer Motion para transições suaves
- Ícones giram ao carregar dados
- Cards aparecem com stagger animation
- Botões têm efeito de escala ao clicar
- Checkboxes têm animação de conclusão

**Responsividade:**
- Mobile-first design
- Bottom tab bar com 5 abas (Home, Treinos, Dieta, Progresso, Perfil)
- Tudo adaptado para telas pequenas

---

## 💾 Armazenamento de Dados

**Tudo é salvo no localStorage do navegador:**
- Perfil do usuário
- Treinos e exercícios
- Dieta e alimentos
- Peso e medidas
- Fotos de evolução (base64)
- Preferências (tema, metas)
- Histórico de treinos
- Pontos e badges

**Dados persistem:**
- Entre sessões (recarregar página)
- Offline (sem internet)
- Até limpar cache do navegador

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **Roteamento**: Wouter
- **Ícones**: Lucide React
- **Build**: Vite

---

## 📱 PWA Features

- Instalável em dispositivos (Add to Home Screen)
- Funciona offline
- Ícone e splash screen customizados
- Manifest.json configurado

---

## 🔐 Segurança & Privacidade

- ✅ Sem login/cadastro — dados locais apenas
- ✅ Sem servidor — tudo no dispositivo
- ✅ Sem rastreamento
- ✅ Sem envio de dados para terceiros

---

## 📋 Checklist de Funcionalidades

### Dashboard
- [x] Hero section com saudação
- [x] Menu de tema no header
- [x] Card de calorias com anel animado
- [x] Barras de macros
- [x] Treino do dia
- [x] Resumo da dieta
- [x] Card de gamificação (pontos, streak, badges)
- [x] Fotos de evolução (3 últimas)
- [x] Gráfico de peso semanal
- [x] Stats row

### Treinos
- [x] Lista de treinos com cards premium
- [x] Criar novo treino (modal com swipe-to-close)
- [x] Editar treino
- [x] Deletar treino
- [x] Selecionar treino do dia
- [x] Modo ativo com timer
- [x] Marcar exercícios como concluídos
- [x] Tela de conclusão

### Dieta
- [x] 4 refeições (café, almoço, lanche, janta)
- [x] Adicionar alimentos
- [x] Soma automática de macros
- [x] Meta calórica editável
- [x] Gráficos de macros

### Progresso
- [x] Gráfico de peso (30 dias)
- [x] Registro manual de peso
- [x] Fotos de evolução
- [x] Medidas corporais

### Perfil
- [x] Dados pessoais editáveis
- [x] Metas nutricionais
- [x] Calculador de gordura corporal (Pollock)
- [x] Seletor de temas (Verde, Azul, Rosa)

### Extras (FAB)
- [x] Histórico com gráficos
- [x] Planos pré-prontos
- [x] Calculadora 1RM
- [x] Compartilhamento de conquistas

---

## 🎮 Como Usar

### Primeira Vez
1. Abra o app
2. Vá para **Perfil** e preencha seus dados
3. Selecione seu objetivo e metas
4. Volte para **Home** — tudo já está configurado!

### Criar um Treino
1. Vá para **Treinos**
2. Clique no botão flutuante (pezinho + peso)
3. Preencha nome e grupos musculares
4. Adicione exercícios
5. Salve

### Fazer um Treino
1. Vá para **Treinos**
2. Selecione um treino (clique nele)
3. Clique em "Iniciar Treino"
4. Siga os exercícios com o timer
5. Marque como concluído

### Registrar Dieta
1. Vá para **Dieta**
2. Clique em uma refeição
3. Adicione alimentos
4. Calorias e macros são calculados automaticamente

### Acompanhar Progresso
1. Vá para **Progresso**
2. Registre seu peso
3. Tire fotos de evolução
4. Veja o gráfico de tendência

### Mudar Tema
1. Vá para **Home**
2. Clique no ícone de paleta no header
3. Selecione Verde, Azul ou Rosa
4. Todo o app muda em tempo real

---

## 🔧 Troubleshooting

**Dados sumiram?**
- Limpar cache do navegador apaga tudo
- Use "Exportar" antes de limpar cache

**Tema não muda?**
- Recarregue a página (Ctrl+R)
- Verifique se localStorage está habilitado

**Fotos não aparecem?**
- Certifique-se de ter permissão de câmera/galeria
- Tente recarregar a página

---

## 🚀 Próximos Passos Sugeridos

1. **Integração com API de Alimentos** — Busca automática de macros ao digitar na aba Dieta
2. **Notificações Push** — Lembretes para treino diário, registrar peso, beber água
3. **Exportar Relatório em PDF** — Resumo mensal com gráficos e PRs
4. **Sincronização em Nuvem** — Backup automático dos dados
5. **Conversão para App Mobile** — iOS e Android via React Native ou Flutter

---

## 📞 Suporte

Para dúvidas ou sugestões, consulte esta documentação ou entre em contato.

---

**FitPro v3.0 — Feito com ❤️ para sua jornada fitness**
