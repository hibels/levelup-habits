export interface Habit {
  id: string;
  name: string;
  emoji: string;
  weeklyGoal: number; // quantos dias por semana (1–7)
  createdAt: string;
  streak: number; // semanas consecutivas atingindo a meta
  lastStreakWeekKey: string | null; // "YYYY-Www" da última semana contada
  completedDates: string[]; // YYYY-MM-DD
}

export interface UserProfile {
  name: string;
  avatar: string; // emoji (fallback quando não há foto)
  photoUri: string | null; // URI da foto de perfil
  level: number;
  xp: number;
  totalXP: number;
}

export interface WeeklyReview {
  id: string;
  weekKey: string; // "YYYY-Www"
  wentWell: string;
  toImprove: string;
  habitResults: { habitId: string; completed: number; goal: number }[];
  createdAt: string;
}

export interface LevelConfig {
  level: number;
  xpRequired: number;
  title: string;
}

export interface CheckResult {
  xpGained: number;
  newLevel: number | null;
  newStreak: number;
  weekGoalReached: boolean;
}

export type ThemeMode = 'light' | 'dark';
