# LevelUp Habits

Um app de rastreamento de hábitos com mecânicas de gamificação. A ideia é simples: construa consistência, ganhe XP, suba de nível.

---

## Sobre o Projeto

LevelUp Habits é um app mobile em React Native (Expo) focado em ajudar o usuário a criar e manter hábitos de forma leve e visual. O design é intencionalmente simples — quanto menos fricção, maior a chance de uso diário.

Referência de produto: Duolingo (streaks, XP, progressão de nível aplicados a hábitos pessoais).

---

## Funcionalidades

### Grátis (sempre)

- Criar até **3 hábitos**
- Definir **meta semanal** por hábito (de 1× até todos os dias)
- **Checkboxes visuais** dos 7 dias da semana em cada hábito
- **Marcar e desmarcar** o hábito do dia corrente
- **Sistema de XP**: +10 XP por check, -10 XP ao desmarcar
- **Streak semanal**: contador de semanas consecutivas com a meta atingida
- **Barra de progresso** da meta semanal por hábito
- **Tela de perfil** com foto real, nível, XP e calendário mensal de atividade (estilo GitHub contributions)
- **Retrospectiva semanal**: escrever o que foi bom e o que melhorar a cada semana
- **Frases motivacionais** diárias na tela principal
- Suporte a **tema claro e escuro**
- Funciona **offline** (dados salvos localmente com AsyncStorage)

### Premium (pago)

- Hábitos **ilimitados** (acima de 3)
- **Dashboard semanal completo** com visão detalhada por hábito
- **Retrospectiva semanal ilimitada** (no plano gratuito, futuramente será limitada)
- **Histórico de streaks completo**

> Planos: R$ 8,90/mês ou R$ 59,90/ano (aprox. R$ 4,99/mês).
> A integração com pagamento real ainda não está implementada — apenas a UI do paywall está pronta.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React Native (Expo ~55) |
| Linguagem | TypeScript 5 (strict) |
| Navegação | React Navigation 6 |
| State | Zustand 5 |
| Formulários | React Hook Form + Zod |
| Storage | AsyncStorage |
| Ícones | @expo/vector-icons (Ionicons / MaterialCommunityIcons) |
| Foto de perfil | expo-image-picker |
| Testes | Jest + React Native Testing Library |

---

## Como Rodar

### Pré-requisitos

- Node.js 18+
- Expo CLI
- Expo Go no celular (iOS ou Android)

### Instalação

```bash
git clone <repository-url>
cd levelup-habits
npm install
npm start
```

Escaneie o QR code com o Expo Go para rodar no celular.

### Outros comandos

```bash
npm run android       # emulador Android
npm run ios           # simulador iOS (requer macOS)
npm run web           # navegador
npm test              # testes unitários
npm run test:coverage # coverage report
npm run lint          # ESLint
npm run format        # Prettier
```

---

## Estrutura do Projeto

```
src/
├── components/
│   ├── HabitCard.tsx         # Card com checkboxes semanais
│   ├── ProfileHeader.tsx     # Header compacto com XP bar
│   ├── EmptyState.tsx        # Estado vazio na Home
│   ├── FAB.tsx               # Botão flutuante de adicionar
│   └── MotivationalMessage.tsx # Frase motivacional diária
├── screens/
│   ├── HomeScreen.tsx        # Lista de hábitos + frase + acesso ao review
│   ├── EditHabitScreen.tsx   # Criar / editar hábito (nome, emoji, meta semanal)
│   ├── ProfileScreen.tsx     # Perfil, stats, calendário mensal
│   ├── PaywallScreen.tsx     # Tela de upgrade premium
│   └── WeeklyReviewScreen.tsx# Retrospectiva semanal
├── navigation/
│   └── index.tsx             # Stack + Bottom Tabs
├── store/
│   └── index.ts              # Zustand store (hábitos, perfil, reviews, tema)
├── utils/
│   ├── levels.ts             # XP, níveis, títulos
│   ├── dates.ts              # Datas, semanas ISO, calendário
│   └── validators.ts         # Validação de formulários (Zod)
├── types/
│   └── index.ts              # Habit, UserProfile, WeeklyReview, etc.
└── theme/
    └── index.ts              # Cores, tipografia, espaçamento, sombras
```

---

## Arquitetura

### State Management

Um único store Zustand em `src/store/index.ts` gerencia todo o estado do app. Não existe estado global fora dele — componentes e telas consomem o store diretamente via `useStore()`.

Persistência é feita via AsyncStorage com chaves prefixadas `@levelup:*`. O carregamento inicial (`loadData`) também faz migração de dados antigos e recalcula streaks.

### Navegação

Estrutura em dois níveis:

```
RootNavigator (Stack)
├── MainTabs (Bottom Tabs)
│   ├── HomeScreen
│   └── ProfileScreen
├── EditHabitScreen   → modal
├── PaywallScreen     → modal (sem header)
└── WeeklyReviewScreen → modal (sem header)
```

Telas que pertencem a uma aba mas precisam navegar para modais do stack raiz usam `CompositeScreenProps`. Os tipos de rota ficam em `src/navigation/index.tsx`.

### Fluxo de dados

```
AsyncStorage → loadData() → Zustand store → componentes/telas
                                  ↑
              actions (checkHabit, addHabit, etc.) persistem de volta
```

---

## Padrões de Código

### Tema

Nunca use cores ou tamanhos hardcoded. Todo valor visual vem do design system em `src/theme/index.ts`:

```ts
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

// Em componentes com suporte a dark mode:
const theme = isDarkMode ? colors.dark : colors.light;
// Use: theme.background, theme.card, theme.border, theme.textPrimary, theme.textSecondary
// Cores de marca: colors.primary.main, colors.secondary.main, colors.accent.main
// Semânticas: colors.semantic.success / error / warning / info
```

O espaçamento segue um grid de 8pt: `spacing.xxs(4)` → `spacing.xs(8)` → `spacing.s(12)` → `spacing.m(16)` → `spacing.l(24)` → `spacing.xl(32)` → `spacing.xxl(48)` → `spacing.xxxl(64)`.

### Ícones

Use sempre `@expo/vector-icons`. Preferência por `Ionicons`; `MaterialCommunityIcons` para variações específicas. Emojis são aceitos apenas como avatar do usuário e no campo `habit.emoji` — nunca como ícones de UI.

```ts
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="checkmark-circle" size={20} color={colors.primary.main} />
```

### Datas

Use exclusivamente as funções de `src/utils/dates.ts`. Nunca construa strings de data manualmente nem use `new Date().toISOString().split('T')[0]` espalhado pelo código.

Funções principais: `getTodayString()`, `getCurrentWeekDates()`, `getCurrentWeekKey()`, `getWeekKey(date)`, `getMonthDates(year, month)`.

### Componentes

- Recebem `isDarkMode: boolean` e derivam `theme` localmente
- Estilos ficam em `StyleSheet.create()` no mesmo arquivo, abaixo do componente
- Valores dinâmicos (cores, opacidade) são aplicados inline via array de estilos

---

## Modelo de Gamificação

### XP e Níveis

Cada check de hábito concede **+10 XP**. Desmarcar remove **-10 XP**. Os níveis são:

| Nível | XP necessário | Título |
|---|---|---|
| 1 | 0 | Iniciante |
| 2 | 100 | Aprendiz |
| 3 | 250 | Dedicado |
| 4 | 500 | Persistente |
| 5 | 1.000 | Determinado |
| 6 | 1.500 | Focado |
| 7 | 2.100 | Disciplinado |
| 8 | 2.800 | Mestre |
| 9 | 3.600 | Lendário |
| 10 | 5.000 | Imortal |

### Streak Semanal

O streak conta **semanas consecutivas** em que o usuário atingiu a meta do hábito (ex: se a meta é 3×/semana, completar 3 ou mais dias naquela semana conta como +1 streak). Se uma semana inteira passa sem atingir a meta, o streak é resetado para 0.

---

## Roadmap

- [ ] Backend + autenticação de usuários
- [ ] Pagamento in-app real (RevenueCat ou similar)
- [ ] Notificações push (lembrete diário e sugestão de review no fim de semana)
- [ ] Ranking online entre usuários
- [ ] Backup em nuvem
- [ ] Temas visuais personalizados (premium)
- [ ] Mais opções de ícone além de emojis

---

## Convenções de Commit

Este projeto segue [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação
style:    formatação
refactor: refatoração sem mudança de comportamento
test:     testes
chore:    manutenção
```

---

**Versão**: 1.1.0
**Status**: MVP completo, em evolução
