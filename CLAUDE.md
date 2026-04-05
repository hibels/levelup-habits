# Guia de Desenvolvimento — LevelUp Habits

Leia este arquivo antes de qualquer tarefa neste projeto. Ele descreve o produto, as regras de negócio, as convenções técnicas e os padrões de código que devem ser seguidos.

---

## O que é o app

LevelUp Habits é um tracker de hábitos gamificado em React Native (Expo). O usuário cria hábitos, define uma meta semanal para cada um, marca os dias que completou e acumula XP e streaks. A referência de produto é o Duolingo.

**Princípio de design:** quanto mais simples, melhor. Menos fricção = mais uso diário.

---

## Modelo de dados

### Habit

```ts
interface Habit {
  id: string;
  name: string;
  emoji: string;
  weeklyGoal: number;        // 1–7: quantas vezes por semana
  createdAt: string;         // ISO string
  streak: number;            // semanas consecutivas atingindo a meta
  lastStreakWeekKey: string | null; // "YYYY-Www" da última semana contada
  completedDates: string[];  // datas no formato "YYYY-MM-DD"
}
```

### UserProfile

```ts
interface UserProfile {
  name: string;
  avatar: string;       // emoji (fallback quando não há foto)
  photoUri: string | null;
  level: number;
  xp: number;           // XP dentro do nível atual (para a barra de progresso)
  totalXP: number;      // XP acumulado total
}
```

### WeeklyReview

```ts
interface WeeklyReview {
  id: string;
  weekKey: string;      // "YYYY-Www"
  wentWell: string;
  toImprove: string;
  habitResults: { habitId: string; completed: number; goal: number }[];
  createdAt: string;
}
```

---

## Regras de negócio

### XP e níveis
- Cada check de hábito concede **+10 XP** (`XP_PER_HABIT_CHECK` em `src/utils/levels.ts`)
- Desmarcar o hábito do dia remove **-10 XP** (nunca vai abaixo de 0)
- Ao desmarcar, o nível é recalculado via `calculateLevel(newTotalXP)`
- 10 níveis no total (Iniciante → Imortal), configurados em `LEVELS[]`

### Streak semanal
- Streak = número de **semanas consecutivas** em que `completedDates` naquela semana >= `weeklyGoal`
- Incrementa quando o usuário atinge `weeklyGoal` pela primeira vez na semana corrente
- Se `lastStreakWeekKey` for da semana anterior → `streak + 1`, senão → `streak = 1`
- Ao abrir o app (`loadData`), se `lastStreakWeekKey` não é a semana atual nem a anterior → `streak = 0`
- Ao desmarcar: se a meta deixa de ser atingida na semana atual, reverte o streak

### Freemium
- **Grátis:** até 3 hábitos (`MAX_FREE_HABITS = 3` em `src/utils/levels.ts`)
- **Premium:** hábitos ilimitados + dashboard completo + retrospectiva ilimitada + histórico de streaks
- O pagamento **não está implementado** — apenas a UI do `PaywallScreen` existe
- `isPremium` no store está sempre `false` por enquanto

### Check / uncheck
- Apenas o **dia atual** pode ser marcado ou desmarcado
- Dias passados são somente leitura (exibição visual)
- Dias futuros aparecem como vazios e não são interativos

### Semana
- A semana começa na **segunda-feira** (padrão ISO 8601)
- `getCurrentWeekDates()` retorna os 7 dias de seg a dom da semana atual
- `getWeekKey(date)` retorna `"YYYY-Www"` para qualquer data

---

## Arquitetura

### State management
Zustand (`src/store/index.ts`). Um único store global com persistência via AsyncStorage.

**Chaves de storage:**
- `@levelup:habits`
- `@levelup:profile`
- `@levelup:theme`
- `@levelup:premium`
- `@levelup:weeklyReviews`

**Actions disponíveis:**
- `loadData()` — carrega tudo do storage, migra hábitos antigos, recalcula streaks
- `addHabit(name, emoji, weeklyGoal)`
- `editHabit(id, name, emoji, weeklyGoal)`
- `deleteHabit(id)`
- `checkHabit(id)` → retorna `CheckResult`
- `uncheckHabit(id)` — remove o check do dia, reverte XP e streak se necessário
- `toggleTheme()`
- `updateProfile(name, avatar, photoUri?)`
- `saveWeeklyReview(data)`

### Navegação
React Navigation 6. Estrutura:

```
RootNavigator (Stack)
├── MainTabs (Bottom Tabs)
│   ├── HomeScreen
│   └── ProfileScreen
├── EditHabitScreen  (modal)
├── PaywallScreen    (modal, headerShown: false)
└── WeeklyReviewScreen (modal, headerShown: false)
```

Tipos em `src/navigation/index.tsx`:
- `RootStackParamList` — rotas do Stack
- `TabParamList` — abas do Bottom Tab

Para navegar de uma tela de tab para um modal, use `CompositeScreenProps`.

---

## Convenções de código

### Tema
Nunca use cores hardcoded. Use sempre o design system:

```ts
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const theme = isDarkMode ? colors.dark : colors.light;
// theme.background, theme.card, theme.border, theme.textPrimary, theme.textSecondary, theme.disabled
// colors.primary.main, colors.secondary.main, colors.accent.main
// colors.semantic.success / error / warning / info
```

### Ícones
Use sempre `@expo/vector-icons`. Preferência por `Ionicons`. Para ícones específicos de plataforma ou variações, use `MaterialCommunityIcons`.

```ts
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
<Ionicons name="checkmark-circle" size={20} color={colors.primary.main} />
```

Nunca use emojis no lugar de ícones de UI (emojis são aceitos apenas como avatar do usuário e no campo `habit.emoji`).

### Espaçamento
Use o grid de 8pt do design system:
```ts
spacing.xxs = 4   spacing.xs = 8   spacing.s = 12
spacing.m = 16    spacing.l = 24   spacing.xl = 32
spacing.xxl = 48  spacing.xxxl = 64
```

### Tipografia
```ts
typography.h1 / h2 / h3
typography.bodyLarge / body / caption / label
typography.numberLarge / numberMedium / numberSmall
```

### Datas
Sempre use as funções de `src/utils/dates.ts`. Nunca construa strings de data manualmente.
- `getTodayString()` → `"YYYY-MM-DD"`
- `formatDate(date)` → `"YYYY-MM-DD"`
- `getCurrentWeekDates()` → array de 7 strings (seg–dom)
- `getCurrentWeekKey()` → `"YYYY-Www"`
- `getWeekKey(date)` → `"YYYY-Www"`
- `getPreviousWeekKey()` → semana anterior
- `getMonthDates(year, month)` → todos os dias do mês

### Props de tema
Componentes e telas recebem `isDarkMode: boolean` e derivam `theme` localmente:
```ts
const theme = isDarkMode ? colors.dark : colors.light;
```

### Edição de hábito via long press
Na `HomeScreen`, pressionar e segurar um `HabitCard` abre o `EditHabitScreen` passando o `habitId`. O `HabitCard` recebe `onLongPress?: () => void`.

---

## Estrutura de pastas

```
src/
├── components/
│   ├── HabitCard.tsx          # Card com checkboxes semanais + streak + progresso
│   ├── ProfileHeader.tsx      # Header compacto (Home) com avatar, nome, XP bar
│   ├── EmptyState.tsx         # Estado vazio na Home
│   ├── FAB.tsx                # Floating Action Button
│   └── MotivationalMessage.tsx # Frase do dia (muda por dayOfYear % total)
├── screens/
│   ├── HomeScreen.tsx         # Lista de hábitos, frase motivacional, banner de review
│   ├── EditHabitScreen.tsx    # Criar/editar hábito (nome, emoji, meta semanal)
│   ├── ProfileScreen.tsx      # Foto, stats, calendário mensal, lista de hábitos
│   ├── PaywallScreen.tsx      # UI de upgrade premium
│   └── WeeklyReviewScreen.tsx # Retrospectiva semanal (score + reflexão)
├── navigation/index.tsx
├── store/index.ts
├── utils/
│   ├── levels.ts              # XP_PER_HABIT_CHECK, MAX_FREE_HABITS, calculateLevel, etc.
│   ├── dates.ts               # Todas as funções de data e semana
│   └── validators.ts          # Validação de forms com Zod
├── types/index.ts
└── theme/index.ts
```

---

## O que não está implementado

- Pagamento real (apenas UI do paywall)
- Notificações push
- Backend / autenticação
- Ranking online
- Backup em nuvem
- Temas visuais customizados

Não implemente essas features sem alinhamento explícito com o usuário.

---

## O que evitar

- Não adicione lógica de streak diário — o streak é **semanal**.
- Não use `lastCompletedDate` — essa propriedade foi removida. Use `completedDates[]`.
- Não hardcode cores ou tamanhos — sempre use o design system.
- Não crie telas novas sem adicionar à navegação em `src/navigation/index.tsx`.
- Não altere o `UserProfile.xp` diretamente — use `getCurrentLevelXP(totalXP)` para derivá-lo.
- Não marque dias que não sejam hoje como completos/incompletos.
