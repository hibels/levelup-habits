export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
  streak: number;
  lastCompletedDate: string | null;
  completedDates: string[]; // Array de dates no formato YYYY-MM-DD
}

export interface UserProfile {
  name: string;
  avatar: string; // Emoji
  level: number;
  xp: number;
  totalXP: number;
}

export interface LevelConfig {
  level: number;
  xpRequired: number;
  title: string;
}

export interface CheckResult {
  xpGained: number;
  newLevel: number | null; // Null se não subiu de nível
  newStreak: number;
}

export type ThemeMode = 'light' | 'dark';
