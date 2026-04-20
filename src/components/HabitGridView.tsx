import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useStore } from '../store';
import { getTodayString, getCurrentWeekDates, WEEKDAY_LABELS } from '../utils/dates';
import { MAX_FREE_HABITS } from '../utils/levels';

interface HabitGridViewProps {
  habits: Habit[];
  isDarkMode: boolean;
  isPremium: boolean;
  onCheckComplete?: (
    xpGained: number,
    newLevel: number | null,
    newStreak: number,
    weekGoalReached: boolean,
    habitName: string,
    habitEmoji: string
  ) => void;
}

const CELL_SIZE = 28;
const HABIT_COL_WIDTH = 96;

export const HabitGridView: React.FC<HabitGridViewProps> = ({
  habits,
  isDarkMode,
  isPremium,
  onCheckComplete,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const checkHabit = useStore(state => state.checkHabit);
  const uncheckHabit = useStore(state => state.uncheckHabit);

  const theme = isDarkMode ? colors.dark : colors.light;
  const today = getTodayString();
  const weekDates = getCurrentWeekDates();

  const handleCellPress = async (habit: Habit, habitIndex: number, date: string) => {
    if (date !== today || loadingId) return;
    if (!isPremium && habitIndex >= MAX_FREE_HABITS) return;

    setLoadingId(habit.id);
    try {
      if (habit.completedDates.includes(date)) {
        await uncheckHabit(habit.id);
      } else {
        const result = await checkHabit(habit.id);
        onCheckComplete?.(
          result.xpGained,
          result.newLevel,
          result.newStreak,
          result.weekGoalReached,
          habit.name,
          habit.emoji
        );
      }
    } catch {}
    finally {
      setLoadingId(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.card, borderColor: theme.border },
        !isDarkMode && styles.shadow,
      ]}
    >
      {/* Header row: day labels */}
      <View style={[styles.row, styles.headerRow, { borderBottomColor: theme.border }]}>
        <View style={styles.habitCol} />
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={i} style={styles.dayCol}>
            <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Habit rows */}
      {habits.map((habit, habitIndex) => {
        const isLocked = !isPremium && habitIndex >= MAX_FREE_HABITS;
        const isLastRow = habitIndex === habits.length - 1;

        return (
          <View
            key={habit.id}
            style={[
              styles.row,
              !isLastRow && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            {/* Habit name column */}
            <View style={[styles.habitCol, isLocked && styles.lockedOpacity]}>
              <Text style={styles.habitEmoji}>{habit.emoji}</Text>
              <Text
                style={[styles.habitName, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {habit.name}
              </Text>
              {isLocked && (
                <Ionicons name="lock-closed" size={10} color={colors.secondary.main} style={styles.lockIcon} />
              )}
            </View>

            {/* Day cells */}
            {weekDates.map((date) => {
              const isChecked = habit.completedDates.includes(date);
              const isCurrentDay = date === today;
              const isPast = date < today;
              const isInteractive = isCurrentDay && !isLocked && !loadingId;

              let cellStyle: object = styles.cellFuture;
              if (isCurrentDay && isChecked) {
                cellStyle = styles.cellTodayComplete;
              } else if (isCurrentDay && !isChecked) {
                cellStyle = styles.cellTodayEmpty;
              } else if (isPast && isChecked) {
                cellStyle = styles.cellPastComplete;
              } else if (isPast && !isChecked) {
                cellStyle = { ...styles.cellBase, backgroundColor: theme.disabled, borderColor: 'transparent' };
              }

              return (
                <TouchableOpacity
                  key={date}
                  style={styles.dayCol}
                  onPress={() => handleCellPress(habit, habitIndex, date)}
                  disabled={!isInteractive}
                  activeOpacity={isInteractive ? 0.6 : 1}
                >
                  <View style={[styles.cellBase, cellStyle]}>
                    {isChecked && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
  },
  headerRow: {
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
  },
  habitCol: {
    width: HABIT_COL_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xs,
  },
  lockedOpacity: {
    opacity: 0.5,
  },
  habitEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  habitName: {
    ...typography.caption,
    fontWeight: '600',
    flex: 1,
  },
  lockIcon: {
    marginLeft: 2,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cellBase: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTodayComplete: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  cellTodayEmpty: {
    backgroundColor: 'transparent',
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
  },
  cellPastComplete: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  cellFuture: {
    backgroundColor: 'transparent',
    borderColor: colors.primary.main,
    opacity: 0.25,
  },
});
