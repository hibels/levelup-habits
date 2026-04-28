import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useStore } from '../store';
import { getTodayString, getCurrentWeekDates, WEEKDAY_LABELS } from '../utils/dates';

interface HabitCardProps {
  habit: Habit;
  isDarkMode: boolean;
  isLocked?: boolean;
  onLongPress?: () => void;
  onStatsPress?: () => void;
  onCheckComplete?: (xpGained: number, newLevel: number | null, newStreak: number, weekGoalReached: boolean, habitName: string, habitEmoji: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isDarkMode,
  isLocked = false,
  onLongPress,
  onStatsPress,
  onCheckComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const checkHabit = useStore(state => state.checkHabit);
  const uncheckHabit = useStore(state => state.uncheckHabit);

  const theme = isDarkMode ? colors.dark : colors.light;
  const today = getTodayString();
  const weekDates = getCurrentWeekDates();
  const isCompletedToday = habit.completedDates.includes(today);

  const completionsThisWeek = weekDates.filter(d => habit.completedDates.includes(d)).length;
  const goalProgress = Math.min(completionsThisWeek, habit.weeklyGoal);
  const goalReached = completionsThisWeek >= habit.weeklyGoal;

  const handleDayPress = async (date: string) => {
    if (date !== today || isLoading || isLocked) return;

    setIsLoading(true);
    try {
      if (isCompletedToday) {
        await uncheckHabit(habit.id);
      } else {
        const result = await checkHabit(habit.id);
        onCheckComplete?.(result.xpGained, result.newLevel, result.newStreak, result.weekGoalReached, habit.name, habit.emoji);
      }
    } catch (error) {
      console.error('Error toggling habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const habitColor = habit.color || colors.primary.main;
  const streakColor = goalReached ? habitColor : colors.secondary.main;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: isLocked ? theme.border : goalReached ? `${habitColor}40` : theme.border,
          opacity: isLocked ? 0.6 : 1,
        },
        !isDarkMode && styles.shadow,
      ]}
      onLongPress={!isLocked ? onLongPress : undefined}
      activeOpacity={0.95}
    >
      <View style={[styles.colorBar, { backgroundColor: isLocked ? theme.disabled : habitColor }]} />
      {/* Banner de bloqueado */}
      {isLocked && (
        <View style={[styles.lockedBanner, { backgroundColor: `${colors.secondary.main}18` }]}>
          <Ionicons name="lock-closed" size={13} color={colors.secondary.main} />
          <Text style={[styles.lockedText, { color: colors.secondary.main }]}>
            Reative o Premium para continuar usando este hábito
          </Text>
        </View>
      )}

      {/* Header: nome + streak */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
          <Text
            style={[styles.name, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {habit.streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: `${streakColor}18` }]}>
              <Ionicons name="flame" size={13} color={streakColor} />
              <Text style={[styles.streakText, { color: streakColor }]}>
                {habit.streak}
              </Text>
            </View>
          )}
          {onStatsPress && (
            <TouchableOpacity
              style={styles.statsBtn}
              onPress={onStatsPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.6}
            >
              <Ionicons name="bar-chart-outline" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Progress bar da meta semanal */}
      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: habitColor,
                opacity: goalReached ? 1 : 0.5,
                width: `${(goalProgress / habit.weeklyGoal) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
          {goalProgress}/{habit.weeklyGoal}
        </Text>
      </View>

      {/* Checkboxes dos 7 dias da semana */}
      <View style={styles.weekRow}>
        {weekDates.map((date, index) => {
          const isChecked = habit.completedDates.includes(date);
          const isCurrentDay = date === today;
          const isFuture = date > today;

          return (
            <TouchableOpacity
              key={date}
              style={styles.dayColumn}
              onPress={() => handleDayPress(date)}
              disabled={!isCurrentDay || isLoading}
              activeOpacity={isCurrentDay ? 0.6 : 1}
            >
              <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>
                {WEEKDAY_LABELS[index]}
              </Text>
              <View
                style={[
                  styles.dayBox,
                  isChecked && { backgroundColor: habitColor, borderColor: habitColor },
                  !isChecked && isCurrentDay && {
                    borderColor: habitColor,
                    borderWidth: 2,
                  },
                  !isChecked && !isCurrentDay && {
                    borderColor: isFuture ? theme.disabled : theme.border,
                    backgroundColor: isFuture ? 'transparent' : `${theme.border}60`,
                  },
                ]}
              >
                {isChecked && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
                {!isChecked && isCurrentDay && isLoading && (
                  <View style={styles.loadingDot} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hint de long press para editar */}
      {onLongPress && (
        <Text style={[styles.hint, { color: theme.disabled }]}>
          Segure para editar
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
    paddingLeft: spacing.m + 4,
    paddingRight: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    overflow: 'hidden',
  },
  colorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  name: {
    ...typography.bodyLarge,
    fontWeight: '600',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statsBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  streakText: {
    ...typography.caption,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.s,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    ...typography.caption,
    fontWeight: '500',
    minWidth: 28,
    textAlign: 'right',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dayBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary.main,
    opacity: 0.5,
  },
  hint: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 10,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.xs,
    marginBottom: spacing.s,
  },
  lockedText: {
    ...typography.caption,
    flex: 1,
    fontWeight: '500',
  },
});
