import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Habit } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { useStore } from '../store';
import { getTodayString } from '../utils/dates';

interface HabitCardProps {
  habit: Habit;
  isDarkMode: boolean;
  onCheckComplete?: (xpGained: number, newLevel: number | null, newStreak: number) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isDarkMode, onCheckComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const checkHabit = useStore(state => state.checkHabit);

  const today = getTodayString();
  const isCompleted = habit.completedDates.includes(today);

  const theme = isDarkMode ? colors.dark : colors.light;

  const handleCheck = async () => {
    if (isCompleted || isLoading) return;

    setIsLoading(true);
    try {
      const result = await checkHabit(habit.id);
      onCheckComplete?.(result.xpGained, result.newLevel, result.newStreak);
    } catch (error) {
      console.error('Error checking habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: isCompleted ? 0.6 : 1,
        },
        !isDarkMode && styles.shadow,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>{habit.emoji}</Text>
          <Text
            style={[styles.name, { color: theme.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {habit.name}
          </Text>
        </View>
        {habit.streak > 0 && (
          <View
            style={[
              styles.streakBadge,
              { backgroundColor: `${colors.accent.main}1A` },
            ]}
          >
            <Text style={styles.streakText}>🔥 {habit.streak}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          isCompleted
            ? { backgroundColor: colors.semantic.success }
            : {
                borderColor: colors.primary.main,
                borderWidth: 2,
              },
        ]}
        onPress={handleCheck}
        disabled={isCompleted || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary.main} />
        ) : (
          <Text
            style={[
              styles.buttonText,
              { color: isCompleted ? '#FFFFFF' : colors.primary.main },
            ]}
          >
            {isCompleted ? '✓ Concluído' : 'Marcar como concluído'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    ...typography.bodyLarge,
    marginLeft: spacing.s,
    flex: 1,
  },
  streakBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.s,
  },
  streakText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.accent.main,
  },
  button: {
    height: 44,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    fontWeight: '500',
  },
});
