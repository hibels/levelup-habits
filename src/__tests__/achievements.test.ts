import {
  ACHIEVEMENT_CATALOG,
  buildInitialAchievements,
  checkAchievementCondition,
  getRecentAchievement,
  resolveAchievementTitle,
  resolveAchievementDescription,
} from '../utils/achievements';
import { Achievement, Habit, UserProfile } from '../types';

const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: '1',
  name: 'Test',
  emoji: '💪',
  weeklyGoal: 3,
  createdAt: new Date().toISOString(),
  streak: 0,
  lastStreakWeekKey: null,
  completedDates: [],
  ...overrides,
});

const makeProfile = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  name: 'Test',
  avatar: '',
  photoUri: null,
  level: 1,
  xp: 0,
  totalXP: 0,
  ...overrides,
});

describe('ACHIEVEMENT_CATALOG', () => {
  it('has exactly 10 achievements', () => {
    expect(ACHIEVEMENT_CATALOG).toHaveLength(10);
  });

  it('has 3 free and 7 premium achievements', () => {
    const free = ACHIEVEMENT_CATALOG.filter(a => a.tier === 'free');
    const premium = ACHIEVEMENT_CATALOG.filter(a => a.tier === 'premium');
    expect(free).toHaveLength(3);
    expect(premium).toHaveLength(7);
  });

  it('all achievements have required fields', () => {
    for (const a of ACHIEVEMENT_CATALOG) {
      expect(a.id).toBeTruthy();
      expect(a.titleKey).toMatch(/^achievements\./);
      expect(a.descriptionKey).toMatch(/^achievements\./);
      expect(a.icon).toBeTruthy();
      expect(['free', 'premium']).toContain(a.tier);
    }
  });

  it('all achievement IDs are unique', () => {
    const ids = ACHIEVEMENT_CATALOG.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('buildInitialAchievements', () => {
  it('builds achievements with unlockedAt = null', () => {
    const achievements = buildInitialAchievements();
    expect(achievements).toHaveLength(ACHIEVEMENT_CATALOG.length);
    achievements.forEach(a => expect(a.unlockedAt).toBeNull());
  });
});

describe('checkAchievementCondition', () => {
  describe('first_habit', () => {
    it('returns false with no habits', () => {
      expect(checkAchievementCondition('first_habit', [], makeProfile())).toBe(false);
    });
    it('returns true with at least one habit', () => {
      expect(checkAchievementCondition('first_habit', [makeHabit()], makeProfile())).toBe(true);
    });
  });

  describe('first_week', () => {
    it('returns false when no habit has streak', () => {
      expect(checkAchievementCondition('first_week', [makeHabit({ streak: 0 })], makeProfile())).toBe(false);
    });
    it('returns true when any habit has streak >= 1', () => {
      expect(checkAchievementCondition('first_week', [makeHabit({ streak: 1 })], makeProfile())).toBe(true);
    });
  });

  describe('level_3', () => {
    it('returns false below level 3', () => {
      expect(checkAchievementCondition('level_3', [], makeProfile({ level: 2 }))).toBe(false);
    });
    it('returns true at level 3', () => {
      expect(checkAchievementCondition('level_3', [], makeProfile({ level: 3 }))).toBe(true);
    });
    it('returns true above level 3', () => {
      expect(checkAchievementCondition('level_3', [], makeProfile({ level: 5 }))).toBe(true);
    });
  });

  describe('level_5', () => {
    it('returns false below level 5', () => {
      expect(checkAchievementCondition('level_5', [], makeProfile({ level: 4 }))).toBe(false);
    });
    it('returns true at level 5', () => {
      expect(checkAchievementCondition('level_5', [], makeProfile({ level: 5 }))).toBe(true);
    });
  });

  describe('level_10', () => {
    it('returns false below level 10', () => {
      expect(checkAchievementCondition('level_10', [], makeProfile({ level: 9 }))).toBe(false);
    });
    it('returns true at level 10', () => {
      expect(checkAchievementCondition('level_10', [], makeProfile({ level: 10 }))).toBe(true);
    });
  });

  describe('streak_10', () => {
    it('returns false when max streak < 10', () => {
      expect(checkAchievementCondition('streak_10', [makeHabit({ streak: 9 })], makeProfile())).toBe(false);
    });
    it('returns true when any habit has streak >= 10', () => {
      expect(checkAchievementCondition('streak_10', [makeHabit({ streak: 10 })], makeProfile())).toBe(true);
    });
  });

  describe('streak_20', () => {
    it('returns false when max streak < 20', () => {
      expect(checkAchievementCondition('streak_20', [makeHabit({ streak: 19 })], makeProfile())).toBe(false);
    });
    it('returns true when any habit has streak >= 20', () => {
      expect(checkAchievementCondition('streak_20', [makeHabit({ streak: 20 })], makeProfile())).toBe(true);
    });
  });

  describe('checks_100', () => {
    it('returns false with fewer than 100 total completions', () => {
      const habit = makeHabit({ completedDates: Array.from({ length: 50 }, (_, i) => `2026-01-${String(i + 1).padStart(2, '0')}`) });
      expect(checkAchievementCondition('checks_100', [habit], makeProfile())).toBe(false);
    });
    it('returns true with 100+ total completions across habits', () => {
      const dates = Array.from({ length: 60 }, (_, i) => {
        const d = new Date('2026-01-01');
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
      });
      const h1 = makeHabit({ id: '1', completedDates: dates.slice(0, 60) });
      const h2 = makeHabit({ id: '2', completedDates: dates.slice(0, 40) });
      expect(checkAchievementCondition('checks_100', [h1, h2], makeProfile())).toBe(true);
    });
  });

  describe('days_365', () => {
    it('returns false when first habit was created less than 365 days ago', () => {
      const recent = new Date();
      recent.setDate(recent.getDate() - 100);
      const habit = makeHabit({ createdAt: recent.toISOString() });
      expect(checkAchievementCondition('days_365', [habit], makeProfile())).toBe(false);
    });
    it('returns true when first habit was created 365+ days ago', () => {
      const old = new Date();
      old.setDate(old.getDate() - 366);
      const habit = makeHabit({ createdAt: old.toISOString() });
      expect(checkAchievementCondition('days_365', [habit], makeProfile())).toBe(true);
    });
    it('returns false with no habits', () => {
      expect(checkAchievementCondition('days_365', [], makeProfile())).toBe(false);
    });
  });

  describe('perfect_habit', () => {
    it('returns false when no habit has 7 completions in one week', () => {
      // 6 days in the same ISO week (2026-W14: Mon Apr 6 - Sun Apr 12)
      const dates = ['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-11'];
      const habit = makeHabit({ completedDates: dates });
      expect(checkAchievementCondition('perfect_habit', [habit], makeProfile())).toBe(false);
    });
    it('returns true when a habit has 7 completions in one week', () => {
      // Full week: Mon Apr 6 - Sun Apr 12 2026 (W15)
      const dates = ['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-11', '2026-04-12'];
      const habit = makeHabit({ completedDates: dates });
      expect(checkAchievementCondition('perfect_habit', [habit], makeProfile())).toBe(true);
    });
    it('returns false with empty habits', () => {
      expect(checkAchievementCondition('perfect_habit', [], makeProfile())).toBe(false);
    });
  });

  it('returns false for unknown achievement id', () => {
    expect(checkAchievementCondition('nonexistent', [], makeProfile())).toBe(false);
  });
});

describe('getRecentAchievement', () => {
  it('returns null when no achievements are unlocked', () => {
    const achievements = buildInitialAchievements();
    expect(getRecentAchievement(achievements)).toBeNull();
  });

  it('returns null when unlocked achievement is older than 7 days', () => {
    const old = new Date();
    old.setDate(old.getDate() - 8);
    const achievements = buildInitialAchievements().map((a, i) =>
      i === 0 ? { ...a, unlockedAt: old.toISOString() } : a
    );
    expect(getRecentAchievement(achievements)).toBeNull();
  });

  it('returns the most recent achievement within 7 days', () => {
    const recent = new Date().toISOString();
    const older = new Date();
    older.setDate(older.getDate() - 3);
    const achievements = buildInitialAchievements().map((a, i) => {
      if (i === 0) return { ...a, unlockedAt: older.toISOString() };
      if (i === 1) return { ...a, unlockedAt: recent };
      return a;
    });
    const result = getRecentAchievement(achievements);
    expect(result?.unlockedAt).toBe(recent);
  });
});

describe('resolveAchievementTitle', () => {
  const mockTranslations = {
    achievements: {
      firstHabit: { title: 'Primeiro Hábito', description: 'Criou seu primeiro hábito' },
    },
  };

  it('resolves a nested translation key', () => {
    const achievement: Achievement = {
      id: 'first_habit',
      titleKey: 'achievements.firstHabit.title',
      descriptionKey: 'achievements.firstHabit.description',
      icon: 'add-circle',
      tier: 'free',
      unlockedAt: null,
    };
    expect(resolveAchievementTitle(achievement, mockTranslations as Record<string, unknown>)).toBe('Primeiro Hábito');
  });

  it('returns the key itself when translation is missing', () => {
    const achievement: Achievement = {
      id: 'missing',
      titleKey: 'achievements.missing.title',
      descriptionKey: 'achievements.missing.description',
      icon: 'star',
      tier: 'free',
      unlockedAt: null,
    };
    expect(resolveAchievementTitle(achievement, mockTranslations as Record<string, unknown>)).toBe('achievements.missing.title');
  });
});

describe('resolveAchievementDescription', () => {
  const mockTranslations = {
    achievements: {
      firstHabit: { title: 'Primeiro Hábito', description: 'Criou seu primeiro hábito' },
    },
  };

  it('resolves a nested description key', () => {
    const achievement: Achievement = {
      id: 'first_habit',
      titleKey: 'achievements.firstHabit.title',
      descriptionKey: 'achievements.firstHabit.description',
      icon: 'add-circle',
      tier: 'free',
      unlockedAt: null,
    };
    expect(resolveAchievementDescription(achievement, mockTranslations as Record<string, unknown>)).toBe('Criou seu primeiro hábito');
  });
});
