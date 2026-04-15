/**
 * Dados fictícios para screenshots do App Store.
 * Ative com DEMO_MODE = true no App.tsx — reverta antes de publicar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, UserProfile, WeeklyReview } from '../types';
import { getCurrentWeekKey, getPreviousWeekKey } from './dates';

const STORAGE_KEYS = {
  HABITS: '@levelup:habits',
  PROFILE: '@levelup:profile',
  THEME: '@levelup:theme',
  PREMIUM: '@levelup:premium',
  WEEKLY_REVIEWS: '@levelup:weeklyReviews',
  ONBOARDED: '@levelup:onboarded',
  NOTIFICATIONS: '@levelup:notifications',
};

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Gera datas dos últimos `days` dias nos dias da semana indicados (0=seg, 6=dom),
 * pulando 1 a cada `skipN` ocorrências para não parecer 100% perfeito.
 */
function genDates(daysOfWeek: number[], days = 91, skipN = 7, skipOffset = 0): string[] {
  const result: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - days);

  const cur = new Date(start);
  let count = skipOffset;

  while (cur <= today) {
    const dow = (cur.getDay() + 6) % 7;
    if (daysOfWeek.includes(dow)) {
      count++;
      if (count % skipN !== 0) result.push(fmt(cur));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function buildHabits(): Habit[] {
  const prevWeek = getPreviousWeekKey();
  const currWeek = getCurrentWeekKey();

  return [
    {
      id: 'demo-1',
      name: 'Correr',
      emoji: '🏃',
      weeklyGoal: 3,
      createdAt: '2025-10-01T00:00:00.000Z',
      streak: 8,
      lastStreakWeekKey: prevWeek,
      // Seg, Qua, Sex — pula 1 a cada 7
      completedDates: genDates([0, 2, 4], 91, 7, 0),
    },
    {
      id: 'demo-2',
      name: 'Leitura',
      emoji: '📚',
      weeklyGoal: 5,
      createdAt: '2025-10-01T00:00:00.000Z',
      streak: 5,
      lastStreakWeekKey: prevWeek,
      // Seg–Sex — pula 1 a cada 8
      completedDates: genDates([0, 1, 2, 3, 4], 91, 8, 2),
    },
    {
      id: 'demo-3',
      name: 'Beber água',
      emoji: '💧',
      weeklyGoal: 7,
      createdAt: '2025-09-01T00:00:00.000Z',
      streak: 12,
      lastStreakWeekKey: currWeek,
      // Todos os dias — pula 1 a cada 10
      completedDates: genDates([0, 1, 2, 3, 4, 5, 6], 91, 10, 1),
    },
    {
      id: 'demo-4',
      name: 'Meditação',
      emoji: '🧘',
      weeklyGoal: 4,
      createdAt: '2025-11-01T00:00:00.000Z',
      streak: 3,
      lastStreakWeekKey: prevWeek,
      // Seg, Qua, Sex, Dom — pula 1 a cada 6
      completedDates: genDates([0, 2, 4, 6], 91, 6, 3),
    },
    {
      id: 'demo-5',
      name: 'Academia',
      emoji: '💪',
      weeklyGoal: 3,
      createdAt: '2025-10-15T00:00:00.000Z',
      streak: 6,
      lastStreakWeekKey: currWeek,
      // Ter, Qui, Sáb — pula 1 a cada 7
      completedDates: genDates([1, 3, 5], 91, 7, 4),
    },
  ];
}

function buildProfile(): UserProfile {
  return {
    name: 'João',
    avatar: '',
    photoUri: null,
    level: 6,
    xp: 40,
    totalXP: 2340,
  };
}

function buildWeeklyReviews(habits: Habit[]): WeeklyReview[] {
  // Usa weekKey das últimas 4 semanas
  const today = new Date();
  function weekKeyOf(weeksAgo: number): string {
    const d = new Date(today);
    d.setDate(today.getDate() - weeksAgo * 7);
    const jan4 = new Date(d.getFullYear(), 0, 4);
    const jan4Day = (jan4.getDay() + 6) % 7;
    const diff = Math.floor(
      ((d.getTime() - jan4.getTime()) / 86400000 + jan4Day) / 7
    );
    return `${d.getFullYear()}-W${String(diff + 1).padStart(2, '0')}`;
  }

  const reviews: WeeklyReview[] = [
    {
      id: 'r1',
      weekKey: weekKeyOf(1),
      wentWell: 'Mantive a sequência de corrida nos 3 dias planejados.',
      toImprove: 'Preciso dormir mais cedo para ter energia de manhã.',
      habitResults: habits.map(h => ({ habitId: h.id, completed: h.weeklyGoal, goal: h.weeklyGoal })),
      createdAt: new Date(today.getTime() - 7 * 86400000).toISOString(),
    },
    {
      id: 'r2',
      weekKey: weekKeyOf(2),
      wentWell: 'Completei todas as metas de leitura pela primeira vez!',
      toImprove: 'Academia ficou em apenas 2 dias, preciso de mais consistência.',
      habitResults: habits.map(h => ({
        habitId: h.id,
        completed: Math.max(h.weeklyGoal - 1, 1),
        goal: h.weeklyGoal,
      })),
      createdAt: new Date(today.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: 'r3',
      weekKey: weekKeyOf(3),
      wentWell: 'Meditação todos os dias planejados, semana tranquila.',
      toImprove: 'Esqueci de registrar a água em 2 dias.',
      habitResults: habits.map(h => ({ habitId: h.id, completed: h.weeklyGoal, goal: h.weeklyGoal })),
      createdAt: new Date(today.getTime() - 21 * 86400000).toISOString(),
    },
    {
      id: 'r4',
      weekKey: weekKeyOf(4),
      wentWell: 'Corrida e academia na mesma semana, ótimo começo.',
      toImprove: 'Leitura foi inconsistente, só 3 de 5 dias.',
      habitResults: habits.map((h, i) => ({
        habitId: h.id,
        completed: i === 1 ? 3 : h.weeklyGoal,
        goal: h.weeklyGoal,
      })),
      createdAt: new Date(today.getTime() - 28 * 86400000).toISOString(),
    },
  ];

  return reviews;
}

export async function seedDemoData(): Promise<void> {
  const habits = buildHabits();
  const profile = buildProfile();
  const weeklyReviews = buildWeeklyReviews(habits);

  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)),
    AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)),
    AsyncStorage.setItem(STORAGE_KEYS.PREMIUM, 'true'),
    AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, JSON.stringify(weeklyReviews)),
    AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true'),
    AsyncStorage.setItem(STORAGE_KEYS.THEME, 'light'),
    AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, 'false'),
  ]);
}
