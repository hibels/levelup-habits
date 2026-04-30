import { Achievement, Habit, UserProfile } from '../types';
import { getWeekKey } from './dates';

export const ACHIEVEMENT_CATALOG: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_habit', titleKey: 'achievements.firstHabit.title', descriptionKey: 'achievements.firstHabit.description', icon: 'add-circle', tier: 'free' },
  { id: 'first_week', titleKey: 'achievements.firstWeek.title', descriptionKey: 'achievements.firstWeek.description', icon: 'calendar', tier: 'free' },
  { id: 'level_3', titleKey: 'achievements.level3.title', descriptionKey: 'achievements.level3.description', icon: 'trending-up', tier: 'free' },
  { id: 'streak_10', titleKey: 'achievements.streak10.title', descriptionKey: 'achievements.streak10.description', icon: 'flame', tier: 'premium' },
  { id: 'streak_20', titleKey: 'achievements.streak20.title', descriptionKey: 'achievements.streak20.description', icon: 'bonfire', tier: 'premium' },
  { id: 'level_5', titleKey: 'achievements.level5.title', descriptionKey: 'achievements.level5.description', icon: 'ribbon', tier: 'premium' },
  { id: 'level_10', titleKey: 'achievements.level10.title', descriptionKey: 'achievements.level10.description', icon: 'trophy', tier: 'premium' },
  { id: 'checks_100', titleKey: 'achievements.checks100.title', descriptionKey: 'achievements.checks100.description', icon: 'checkmark-done-circle', tier: 'premium' },
  { id: 'days_365', titleKey: 'achievements.days365.title', descriptionKey: 'achievements.days365.description', icon: 'earth', tier: 'premium' },
  { id: 'perfect_habit', titleKey: 'achievements.perfectHabit.title', descriptionKey: 'achievements.perfectHabit.description', icon: 'star', tier: 'premium' },
];

export function buildInitialAchievements(): Achievement[] {
  return ACHIEVEMENT_CATALOG.map(a => ({ ...a, unlockedAt: null }));
}

function hasPerfectWeek(habits: Habit[]): boolean {
  for (const habit of habits) {
    const weekCounts: Record<string, number> = {};
    for (const date of habit.completedDates) {
      const key = getWeekKey(new Date(date));
      weekCounts[key] = (weekCounts[key] || 0) + 1;
    }
    if (Object.values(weekCounts).some(c => c >= 7)) return true;
  }
  return false;
}

function daysSinceFirstHabit(habits: Habit[]): number {
  if (habits.length === 0) return 0;
  const oldest = habits.reduce((min, h) => (h.createdAt < min ? h.createdAt : min), habits[0].createdAt);
  return Math.floor((Date.now() - new Date(oldest).getTime()) / 86400000);
}

export function checkAchievementCondition(id: string, habits: Habit[], profile: UserProfile): boolean {
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  switch (id) {
    case 'first_habit': return habits.length >= 1;
    case 'first_week': return habits.some(h => h.streak >= 1);
    case 'level_3': return profile.level >= 3;
    case 'streak_10': return habits.some(h => h.streak >= 10);
    case 'streak_20': return habits.some(h => h.streak >= 20);
    case 'level_5': return profile.level >= 5;
    case 'level_10': return profile.level >= 10;
    case 'checks_100': return totalCompletions >= 100;
    case 'days_365': return daysSinceFirstHabit(habits) >= 365;
    case 'perfect_habit': return hasPerfectWeek(habits);
    default: return false;
  }
}

export function resolveAchievementTitle(achievement: Achievement, t: Record<string, unknown>): string {
  const parts = achievement.titleKey.split('.');
  // e.g. achievements.firstHabit.title → t.achievements.firstHabit.title
  let node: unknown = t;
  for (const part of parts) {
    if (node && typeof node === 'object') {
      node = (node as Record<string, unknown>)[part];
    } else {
      return achievement.titleKey;
    }
  }
  return typeof node === 'string' ? node : achievement.titleKey;
}

export function resolveAchievementDescription(achievement: Achievement, t: Record<string, unknown>): string {
  const parts = achievement.descriptionKey.split('.');
  let node: unknown = t;
  for (const part of parts) {
    if (node && typeof node === 'object') {
      node = (node as Record<string, unknown>)[part];
    } else {
      return achievement.descriptionKey;
    }
  }
  return typeof node === 'string' ? node : achievement.descriptionKey;
}

export function getRecentAchievement(achievements: Achievement[]): Achievement | null {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = achievements
    .filter(a => a.unlockedAt !== null && new Date(a.unlockedAt).getTime() >= sevenDaysAgo)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime());
  return recent[0] ?? null;
}
