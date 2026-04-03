# FitPro — Ideias de Design

## Abordagem 1: "Athletic Noir"
<response>
<text>
**Design Movement:** Neo-Brutalism Fitness / Athletic Noir
**Core Principles:**
- Contraste extremo: preto profundo vs verde neon vibrante
- Tipografia pesada e assertiva (display bold para métricas)
- Cards com bordas sutis e efeito de vidro (glassmorphism leve)
- Hierarquia visual clara por tamanho e peso tipográfico

**Color Philosophy:**
- Background: #0A0A0A (preto absoluto)
- Surface: #111111 / #1A1A1A (cinza carbono)
- Primary: #00FF87 (verde neon / lima elétrico)
- Secondary: #00C96B (verde médio)
- Text: #FFFFFF / #A0A0A0
- Accent: #FF6B35 (laranja para alertas/PRs)

**Layout Paradigm:**
- Mobile-first com bottom tab bar fixa
- Cards assimétricos com métricas grandes em destaque
- Números de progresso em tipografia display gigante
- Seções com separação por espaçamento generoso, não por linhas

**Signature Elements:**
- Números de calorias/peso em fonte display bold ~72px
- Barras de progresso com gradiente verde neon
- Ícones minimalistas monocromáticos

**Interaction Philosophy:**
- Tap feedback com scale(0.97) suave
- Swipe para deletar/completar itens
- Timer de descanso com anel circular animado

**Animation:**
- Entrada de cards com slide-up + fade (stagger 50ms)
- Números contam de 0 até o valor ao entrar na tela
- Transições de página com slide horizontal suave

**Typography System:**
- Display: Space Grotesk Bold (métricas, títulos)
- Body: Inter Regular/Medium (descrições, labels)
</text>
<probability>0.08</probability>
</response>

## Abordagem 2: "Premium Dark Fitness" ← SELECIONADA
<response>
<text>
**Design Movement:** Premium Dark Fitness / Luxury Sports
**Core Principles:**
- Dark mode profundo com gradientes sutis de profundidade
- Verde vibrante como cor de ação e progresso
- Cards com glassmorphism e sombras coloridas
- Tipografia moderna com hierarquia forte

**Color Philosophy:**
- Background: #0D0D0F (quase preto com toque azulado)
- Surface: #161618 / #1E1E22 (superfícies elevadas)
- Card: #1C1C20 com borda rgba(255,255,255,0.06)
- Primary: #22C55E (verde vibrante — tailwind green-500)
- Primary Dark: #16A34A (green-600)
- Primary Glow: rgba(34,197,94,0.15) (sombra colorida)
- Text Primary: #F8F8F8
- Text Secondary: #9CA3AF (gray-400)
- Accent: #F59E0B (âmbar para destaques secundários)

**Layout Paradigm:**
- Bottom tab bar com 5 itens, ícones + labels
- Dashboard com hero section personalizada (nome + saudação)
- Grid de cards 2 colunas para métricas rápidas
- Listas com separadores sutis e swipe actions

**Signature Elements:**
- Sombra colorida verde em cards de destaque (box-shadow com primary color)
- Barra de progresso circular (SVG) para calorias
- Gradiente sutil de background: do topo escuro para levemente mais claro

**Interaction Philosophy:**
- Feedback háptico simulado via vibration API
- Botões com ripple effect sutil
- Modais com backdrop blur e slide-up

**Animation:**
- Framer Motion para transições de página
- Cards entram com spring animation
- Números animados com counter

**Typography System:**
- Display: Space Grotesk (700) para números e títulos
- UI: Outfit (400/500/600) para labels e body
</text>
<probability>0.09</probability>
</response>

## Abordagem 3: "Minimal Performance"
<response>
<text>
**Design Movement:** Minimal Performance / Swiss Fitness
**Core Principles:**
- Grid rigoroso, espaçamento matemático
- Tipografia como elemento visual principal
- Cor usada com extrema parcimônia
- Dados em primeiro plano, decoração em segundo

**Color Philosophy:**
- Background: #0F0F0F
- Surface: #1A1A1A
- Primary: #4ADE80 (verde claro)
- Text: #EFEFEF / #666666
- Accent: apenas para estados ativos

**Layout Paradigm:**
- Lista-first, sem cards elaborados
- Números grandes como âncoras visuais
- Separadores tipográficos ao invés de cards

**Typography System:**
- Mono: JetBrains Mono para dados/métricas
- Sans: DM Sans para UI
</text>
<probability>0.05</probability>
</response>

---

## Design Selecionado: **"Premium Dark Fitness"**

Escolhido por equilibrar premium visual com usabilidade mobile-first.
Cores verde + preto profundo + glassmorphism criam a sensação de app fitness de alto nível.
