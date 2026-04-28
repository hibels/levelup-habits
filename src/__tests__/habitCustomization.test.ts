import { HABIT_COLORS } from '../screens/EditHabitScreen';

describe('HABIT_COLORS', () => {
  it('has exactly 12 colors', () => {
    expect(HABIT_COLORS).toHaveLength(12);
  });

  it('all colors are valid hex values', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    HABIT_COLORS.forEach(color => {
      expect(color).toMatch(hexRegex);
    });
  });

  it('colors are unique', () => {
    const unique = new Set(HABIT_COLORS);
    expect(unique.size).toBe(HABIT_COLORS.length);
  });
});

describe('Habit type color/iconName fields', () => {
  it('Habit type accepts optional color and iconName', () => {
    const habit = {
      id: '1',
      name: 'Test',
      emoji: '💪',
      weeklyGoal: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      streak: 0,
      lastStreakWeekKey: null,
      completedDates: [],
      color: '#8B5CF6',
      iconName: 'barbell-outline',
    };
    expect(habit.color).toBe('#8B5CF6');
    expect(habit.iconName).toBe('barbell-outline');
  });

  it('Habit type works without optional color and iconName', () => {
    const habit = {
      id: '1',
      name: 'Test',
      emoji: '💪',
      weeklyGoal: 3,
      createdAt: '2026-01-01T00:00:00.000Z',
      streak: 0,
      lastStreakWeekKey: null,
      completedDates: [],
    };
    expect(habit.color).toBeUndefined();
    expect(habit.iconName).toBeUndefined();
  });
});
