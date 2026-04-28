import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, UserProfile, CheckResult, ThemeMode, WeeklyReview } from '../types';
import {
  getTodayString,
  getCurrentWeekKey,
  getPreviousWeekKey,
  getCurrentWeekDates,
} from '../utils/dates';
import {
  calculateLevel,
  XP_PER_HABIT_CHECK,
  getCurrentLevelXP,
  MAX_FREE_HABITS,
} from '../utils/levels';

interface AppState {
  habits: Habit[];
  profile: UserProfile;
  themeMode: ThemeMode;
  isPremium: boolean;
  isLoading: boolean;
  weeklyReviews: WeeklyReview[];
  hasOnboarded: boolean;
  notificationsEnabled: boolean;
  viewMode: 'card' | 'grid';

  loadData: () => Promise<void>;
  setViewMode: (mode: 'card' | 'grid') => Promise<void>;
  addHabit: (name: string, emoji: string, weeklyGoal: number) => Promise<void>;
  editHabit: (id: string, name: string, emoji: string, weeklyGoal: number) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  checkHabit: (id: string) => Promise<CheckResult>;
  uncheckHabit: (id: string) => Promise<void>;
  toggleTheme: () => void;
  updateProfile: (name: string, avatar: string, photoUri?: string | null) => Promise<void>;
  saveWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'createdAt'>) => Promise<void>;
  updateWeeklyReview: (id: string, data: { wentWell: string; toImprove: string }) => Promise<void>;
  deleteWeeklyReview: (id: string) => Promise<void>;
  completeOnboarding: (name: string, avatar: string, notificationsEnabled: boolean, photoUri?: string | null) => Promise<void>;
  setPremium: (value: boolean) => Promise<void>;
}

const STORAGE_KEYS = {
  HABITS: '@levelup:habits',
  PROFILE: '@levelup:profile',
  THEME: '@levelup:theme',
  PREMIUM: '@levelup:premium',
  WEEKLY_REVIEWS: '@levelup:weeklyReviews',
  ONBOARDED: '@levelup:onboarded',
  NOTIFICATIONS: '@levelup:notifications',
  VIEW_MODE: '@levelup:viewMode',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Usuário',
  avatar: '',
  photoUri: null,
  level: 1,
  xp: 0,
  totalXP: 0,
};

/** Verifica e redefine o streak se a semana anterior não atingiu a meta */
function recalcStreakOnLoad(habit: Habit): Habit {
  if (!habit.lastStreakWeekKey) return habit;

  const currentWeek = getCurrentWeekKey();
  const previousWeek = getPreviousWeekKey();

  // Se a última semana contada foi a atual ou a anterior, streak está válido
  if (
    habit.lastStreakWeekKey === currentWeek ||
    habit.lastStreakWeekKey === previousWeek
  ) {
    return habit;
  }

  // Mais de uma semana sem atingir a meta → reset
  return { ...habit, streak: 0, lastStreakWeekKey: null };
}

/** Conta quantas vezes um hábito foi completado em uma determinada semana (por datas) */
function countCompletionsInWeek(habit: Habit, weekDates: string[]): number {
  return habit.completedDates.filter(d => weekDates.includes(d)).length;
}

export const useStore = create<AppState>((set, get) => ({
  habits: [],
  profile: DEFAULT_PROFILE,
  themeMode: 'light',
  isPremium: false,
  isLoading: true,
  weeklyReviews: [],
  hasOnboarded: false,
  notificationsEnabled: false,
  viewMode: 'card',

  loadData: async () => {
    try {
      const [habitsData, profileData, themeData, premiumData, reviewsData, onboardedData, notificationsData, viewModeData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HABITS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.THEME).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PREMIUM).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_REVIEWS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.VIEW_MODE).catch(() => null),
      ]);

      const rawHabits: Habit[] = habitsData ? JSON.parse(habitsData) : [];
      const profile: UserProfile = profileData
        ? { ...DEFAULT_PROFILE, ...JSON.parse(profileData) }
        : DEFAULT_PROFILE;
      const themeMode: ThemeMode = (themeData as ThemeMode) || 'light';
      const isPremium: boolean = premiumData === 'true';
      const weeklyReviews: WeeklyReview[] = reviewsData ? JSON.parse(reviewsData) : [];
      const hasOnboarded: boolean = onboardedData === 'true';
      const notificationsEnabled: boolean = notificationsData === 'true';
      const viewMode: 'card' | 'grid' = (viewModeData === 'grid' ? 'grid' : 'card');

      // Migra hábitos antigos (sem weeklyGoal / lastStreakWeekKey) e recalcula streak
      const habits = rawHabits.map(h => {
        const migrated: Habit = {
          ...h,
          weeklyGoal: h.weeklyGoal ?? 7,
          lastStreakWeekKey: h.lastStreakWeekKey ?? null,
        };
        return recalcStreakOnLoad(migrated);
      });

      set({ habits, profile, themeMode, isPremium, isLoading: false, weeklyReviews, hasOnboarded, notificationsEnabled, viewMode });

      // Persiste se houve mudança por migração/streak reset
      if (JSON.stringify(rawHabits) !== JSON.stringify(habits)) {
        await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch(() => {});
      }
    } catch {
      set({
        habits: [],
        profile: DEFAULT_PROFILE,
        themeMode: 'light',
        isPremium: false,
        isLoading: false,
        weeklyReviews: [],
        hasOnboarded: false,
        notificationsEnabled: false,
        viewMode: 'card',
      });
    }
  },

  addHabit: async (name, emoji, weeklyGoal) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      emoji,
      weeklyGoal,
      createdAt: new Date().toISOString(),
      streak: 0,
      lastStreakWeekKey: null,
      completedDates: [],
    };
    const habits = [...get().habits, newHabit];
    set({ habits });
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch(() => {});
  },

  editHabit: async (id, name, emoji, weeklyGoal) => {
    const habits = get().habits.map(h =>
      h.id === id ? { ...h, name, emoji, weeklyGoal } : h
    );
    set({ habits });
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch(() => {});
  },

  deleteHabit: async (id) => {
    const habits = get().habits.filter(h => h.id !== id);
    set({ habits });
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch(() => {});
  },

  checkHabit: async (id): Promise<CheckResult> => {
    const today = getTodayString();
    const { habits, profile, isPremium } = get();
    const habit = habits.find(h => h.id === id);

    if (!habit) throw new Error('Habit not found');
    if (!isPremium && habits.indexOf(habit) >= MAX_FREE_HABITS) throw new Error('Habit locked');
    if (habit.completedDates.includes(today)) throw new Error('Already completed today');

    const weekDates = getCurrentWeekDates();
    const completionsBeforeToday = countCompletionsInWeek(habit, weekDates);
    const completionsAfterToday = completionsBeforeToday + 1;

    // Calcula streak semanal: atingiu a meta esta semana?
    const currentWeek = getCurrentWeekKey();
    const previousWeek = getPreviousWeekKey();
    let newStreak = habit.streak;
    let newLastStreakWeekKey = habit.lastStreakWeekKey;
    let weekGoalReached = false;

    if (completionsAfterToday === habit.weeklyGoal) {
      weekGoalReached = true;
      if (habit.lastStreakWeekKey === previousWeek) {
        newStreak = habit.streak + 1;
      } else {
        newStreak = 1;
      }
      newLastStreakWeekKey = currentWeek;
    }

    const updatedHabit: Habit = {
      ...habit,
      streak: newStreak,
      lastStreakWeekKey: newLastStreakWeekKey,
      completedDates: [...habit.completedDates, today],
    };

    // XP e level
    const newTotalXP = profile.totalXP + XP_PER_HABIT_CHECK;
    const oldLevel = profile.level;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;
    const currentXP = getCurrentLevelXP(newTotalXP);

    const updatedProfile: UserProfile = {
      ...profile,
      totalXP: newTotalXP,
      level: newLevel,
      xp: currentXP,
    };

    const updatedHabits = habits.map(h => (h.id === id ? updatedHabit : h));
    set({ habits: updatedHabits, profile: updatedProfile });

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits)).catch(() => {}),
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile)).catch(() => {}),
    ]);

    return {
      xpGained: XP_PER_HABIT_CHECK,
      newLevel: leveledUp ? newLevel : null,
      newTotalXP: newTotalXP,
      newStreak,
      weekGoalReached,
    };
  },

  uncheckHabit: async (id) => {
    const today = getTodayString();
    const { habits, profile, isPremium } = get();
    const habit = habits.find(h => h.id === id);
    if (!habit || !habit.completedDates.includes(today)) return;
    if (!isPremium && habits.indexOf(habit) >= MAX_FREE_HABITS) return;

    const weekDates = getCurrentWeekDates();
    const completionsAfterUncheck = countCompletionsInWeek(
      { ...habit, completedDates: habit.completedDates.filter(d => d !== today) },
      weekDates
    );

    // Se a meta semanal estava atingida e agora não está mais, reverte o streak
    const currentWeek = getCurrentWeekKey();
    let newStreak = habit.streak;
    let newLastStreakWeekKey = habit.lastStreakWeekKey;

    if (
      habit.lastStreakWeekKey === currentWeek &&
      completionsAfterUncheck < habit.weeklyGoal
    ) {
      newStreak = Math.max(0, habit.streak - 1);
      newLastStreakWeekKey = newStreak > 0 ? getPreviousWeekKey() : null;
    }

    const updatedHabit: Habit = {
      ...habit,
      streak: newStreak,
      lastStreakWeekKey: newLastStreakWeekKey,
      completedDates: habit.completedDates.filter(d => d !== today),
    };

    // Remove o XP ganho ao marcar
    const newTotalXP = Math.max(0, profile.totalXP - XP_PER_HABIT_CHECK);
    const newLevel = calculateLevel(newTotalXP);
    const updatedProfile: UserProfile = {
      ...profile,
      totalXP: newTotalXP,
      level: newLevel,
      xp: getCurrentLevelXP(newTotalXP),
    };

    const updatedHabits = habits.map(h => (h.id === id ? updatedHabit : h));
    set({ habits: updatedHabits, profile: updatedProfile });
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits)).catch(() => {}),
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile)).catch(() => {}),
    ]);
  },

  setViewMode: async (mode) => {
    set({ viewMode: mode });
    await AsyncStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode).catch(() => {});
  },

  toggleTheme: () => {
    const newTheme = get().themeMode === 'light' ? 'dark' : 'light';
    set({ themeMode: newTheme });
    AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme).catch(() => {});
  },

  updateProfile: async (name, avatar, photoUri = null) => {
    const profile = { ...get().profile, name, avatar, photoUri };
    set({ profile });
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)).catch(() => {});
  },

  saveWeeklyReview: async (reviewData) => {
    const review: WeeklyReview = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const weeklyReviews = [review, ...get().weeklyReviews];
    set({ weeklyReviews });
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, JSON.stringify(weeklyReviews)).catch(() => {});
  },

  updateWeeklyReview: async (id, data) => {
    const weeklyReviews = get().weeklyReviews.map(r =>
      r.id === id ? { ...r, ...data } : r
    );
    set({ weeklyReviews });
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, JSON.stringify(weeklyReviews)).catch(() => {});
  },

  deleteWeeklyReview: async (id) => {
    const weeklyReviews = get().weeklyReviews.filter(r => r.id !== id);
    set({ weeklyReviews });
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, JSON.stringify(weeklyReviews)).catch(() => {});
  },

  setPremium: async (value) => {
    set({ isPremium: value });
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM, value ? 'true' : 'false').catch(() => {});
  },

  completeOnboarding: async (name, avatar, notificationsEnabled, photoUri = null) => {
    const profile = { ...get().profile, name, avatar, photoUri };
    set({ profile, hasOnboarded: true, notificationsEnabled });
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)).catch(() => {}),
      AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true').catch(() => {}),
      AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, notificationsEnabled ? 'true' : 'false').catch(() => {}),
    ]);
  },
}));
