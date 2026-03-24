import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, UserProfile, CheckResult, ThemeMode } from '../types';
import { getTodayString, isToday, isYesterday } from '../utils/dates';
import {
  calculateLevel,
  XP_PER_HABIT_CHECK,
  getCurrentLevelXP,
  getXPForCurrentLevel,
} from '../utils/levels';

interface AppState {
  // State
  habits: Habit[];
  profile: UserProfile;
  themeMode: ThemeMode;
  isPremium: boolean;
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;
  addHabit: (name: string, emoji: string) => Promise<void>;
  editHabit: (id: string, name: string, emoji: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  checkHabit: (id: string) => Promise<CheckResult>;
  toggleTheme: () => void;
  updateProfile: (name: string, avatar: string) => Promise<void>;
}

const STORAGE_KEYS = {
  HABITS: '@levelup:habits',
  PROFILE: '@levelup:profile',
  THEME: '@levelup:theme',
  PREMIUM: '@levelup:premium',
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Gusthawo',
  avatar: '🚀',
  level: 1,
  xp: 0,
  totalXP: 0,
};

export const useStore = create<AppState>((set, get) => ({
  habits: [],
  profile: DEFAULT_PROFILE,
  themeMode: 'light',
  isPremium: false,
  isLoading: true,

  loadData: async () => {
    try {
      const [habitsData, profileData, themeData, premiumData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HABITS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.THEME).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PREMIUM).catch(() => null),
      ]);

      const habits: Habit[] = habitsData ? JSON.parse(habitsData) : [];
      const profile: UserProfile = profileData ? JSON.parse(profileData) : DEFAULT_PROFILE;
      const themeMode: ThemeMode = (themeData as ThemeMode) || 'light';
      const isPremium: boolean = premiumData === 'true';

      // Resetar streaks se necessário
      const updatedHabits = habits.map(habit => {
        if (!habit.lastCompletedDate) return habit;

        const isCompletedToday = isToday(habit.lastCompletedDate);
        const wasCompletedYesterday = isYesterday(habit.lastCompletedDate);

        // Se não completou hoje nem ontem, reseta o streak
        if (!isCompletedToday && !wasCompletedYesterday) {
          return { ...habit, streak: 0 };
        }

        return habit;
      });

      set({
        habits: updatedHabits,
        profile,
        themeMode,
        isPremium,
        isLoading: false,
      });

      // Salva os hábitos atualizados se houve mudança
      if (JSON.stringify(habits) !== JSON.stringify(updatedHabits)) {
        await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits)).catch(() => {
          console.log('Could not save updated habits');
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values even if storage fails
      set({
        habits: [],
        profile: DEFAULT_PROFILE,
        themeMode: 'light',
        isPremium: false,
        isLoading: false,
      });
    }
  },

  addHabit: async (name: string, emoji: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      emoji,
      createdAt: new Date().toISOString(),
      streak: 0,
      lastCompletedDate: null,
      completedDates: [],
    };

    const habits = [...get().habits, newHabit];
    set({ habits });
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch((error) => {
      console.error('Failed to save habit:', error);
    });
  },

  editHabit: async (id: string, name: string, emoji: string) => {
    const habits = get().habits.map(habit =>
      habit.id === id ? { ...habit, name, emoji } : habit
    );
    set({ habits });
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch((error) => {
      console.error('Failed to update habit:', error);
    });
  },

  deleteHabit: async (id: string) => {
    const habits = get().habits.filter(habit => habit.id !== id);
    set({ habits });
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits)).catch((error) => {
      console.error('Failed to delete habit:', error);
    });
  },

  checkHabit: async (id: string): Promise<CheckResult> => {
    const today = getTodayString();
    const { habits, profile } = get();
    const habit = habits.find(h => h.id === id);

    if (!habit) {
      throw new Error('Habit not found');
    }

    // Verifica se já foi completado hoje
    if (habit.completedDates.includes(today)) {
      throw new Error('Already completed today');
    }

    // Calcula novo streak
    const wasCompletedYesterday = habit.lastCompletedDate
      ? isYesterday(habit.lastCompletedDate)
      : false;
    const newStreak = wasCompletedYesterday ? habit.streak + 1 : 1;

    // Atualiza hábito
    const updatedHabit: Habit = {
      ...habit,
      streak: newStreak,
      lastCompletedDate: today,
      completedDates: [...habit.completedDates, today],
    };

    // Calcula XP
    const newTotalXP = profile.totalXP + XP_PER_HABIT_CHECK;
    const oldLevel = profile.level;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Calcula XP atual para a barra de progresso
    const currentXP = getCurrentLevelXP(newTotalXP);
    const xpForLevel = getXPForCurrentLevel(newTotalXP);

    const updatedProfile: UserProfile = {
      ...profile,
      totalXP: newTotalXP,
      level: newLevel,
      xp: currentXP,
    };

    const updatedHabits = habits.map(h => (h.id === id ? updatedHabit : h));

    set({ habits: updatedHabits, profile: updatedProfile });

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits)).catch(() => { }),
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile)).catch(() => { }),
    ]);

    return {
      xpGained: XP_PER_HABIT_CHECK,
      newLevel: leveledUp ? newLevel : null,
      newStreak,
    };
  },

  toggleTheme: () => {
    const newTheme = get().themeMode === 'light' ? 'dark' : 'light';
    set({ themeMode: newTheme });
    AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme).catch(() => { });
  },

  updateProfile: async (name: string, avatar: string) => {
    const profile = { ...get().profile, name, avatar };
    set({ profile });
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)).catch((error) => {
      console.error('Failed to update profile:', error);
    });
  },
}));
