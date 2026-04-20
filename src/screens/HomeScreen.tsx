import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { HabitCard } from '../components/HabitCard';
import { HabitGridView } from '../components/HabitGridView';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { GoalCelebrationModal } from '../components/GoalCelebrationModal';
import { colors, spacing, typography, borderRadius } from '../theme';
import { MAX_FREE_HABITS } from '../utils/levels';
import { getTodayString } from '../utils/dates';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Bom dia, ${name}!`;
  if (hour >= 12 && hour < 18) return `Boa tarde, ${name}!`;
  return `Boa noite, ${name}!`;
}

function formatTodayDate(): string {
  const today = new Date();
  return `${WEEKDAYS[today.getDay()]}, ${today.getDate()} de ${MONTHS[today.getMonth()]}`;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { habits, profile, themeMode, isPremium, viewMode, setViewMode } = useStore();
  const insets = useSafeAreaInsets();

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;
  const canAddHabit = isPremium || habits.length < MAX_FREE_HABITS;

  const [celebration, setCelebration] = useState<{
    visible: boolean;
    habitName: string;
    habitEmoji: string;
    streak: number;
    xpGained: number;
  }>({ visible: false, habitName: '', habitEmoji: '', streak: 0, xpGained: 0 });

  const today = getTodayString();
  const checkableHabits = habits.filter((_, i) => isPremium || i < MAX_FREE_HABITS);
  const completedToday = checkableHabits.filter(h => h.completedDates.includes(today)).length;
  const totalToday = checkableHabits.length;
  const allDoneToday = totalToday > 0 && completedToday === totalToday;
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  const handleAddHabit = () => {
    if (!canAddHabit) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('EditHabit', { habitId: undefined });
  };

  const handleEditHabit = (habitId: string) => {
    navigation.navigate('EditHabit', { habitId });
  };

  const handleCheckComplete = (
    xpGained: number,
    newLevel: number | null,
    newStreak: number,
    weekGoalReached: boolean,
    habitName: string,
    habitEmoji: string
  ) => {
    if (newLevel) {
      setTimeout(() => {
        navigation.navigate('LevelUp', { level: newLevel, totalXP: profile.totalXP });
      }, 300);
    } else if (weekGoalReached) {
      setTimeout(() => {
        setCelebration({
          visible: true,
          habitName,
          habitEmoji,
          streak: newStreak,
          xpGained,
        });
      }, 300);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Custom header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            paddingTop: insets.top + spacing.s,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: theme.textPrimary }]} numberOfLines={1}>
              {getGreeting(profile.name)}
            </Text>
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {formatTodayDate()}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.reviewIconButton, { backgroundColor: `${colors.primary.main}15` }]}
            onPress={() => navigation.navigate('WeeklyReview')}
            activeOpacity={0.7}
          >
            <Ionicons name="journal-outline" size={20} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

        {/* Stats pills */}
        {totalToday > 0 && (
          <View style={styles.statsRow}>
            {bestStreak > 0 && (
              <View style={[styles.pill, { backgroundColor: `${colors.secondary.main}18` }]}>
                <Ionicons name="flame" size={13} color={colors.secondary.main} />
                <Text style={[styles.pillText, { color: colors.secondary.dark }]}>
                  {bestStreak} {bestStreak === 1 ? 'semana' : 'semanas'}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.pill,
                {
                  backgroundColor: allDoneToday
                    ? `${colors.primary.main}18`
                    : `${theme.border}90`,
                },
              ]}
            >
              <Ionicons
                name={allDoneToday ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={13}
                color={allDoneToday ? colors.primary.main : theme.textSecondary}
              />
              <Text
                style={[
                  styles.pillText,
                  { color: allDoneToday ? colors.primary.dark : theme.textSecondary },
                ]}
              >
                {completedToday}/{totalToday} hoje
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* View mode toggle */}
      {habits.length > 0 && (
        <View style={[styles.toggleRow, { backgroundColor: theme.background }]}>
          <View style={[styles.segmentedControl, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.segment,
                viewMode === 'card' && { backgroundColor: colors.primary.main },
              ]}
              onPress={() => setViewMode('card')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="list-outline"
                size={16}
                color={viewMode === 'card' ? '#FFFFFF' : theme.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segment,
                viewMode === 'grid' && { backgroundColor: colors.primary.main },
              ]}
              onPress={() => setViewMode('grid')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="grid-outline"
                size={16}
                color={viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Habit list / grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {habits.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} onAddHabit={handleAddHabit} />
        ) : viewMode === 'grid' ? (
          <HabitGridView
            habits={habits}
            isDarkMode={isDarkMode}
            isPremium={isPremium}
            onCheckComplete={handleCheckComplete}
          />
        ) : (
          habits.map((habit, index) => {
            const isLocked = !isPremium && index >= MAX_FREE_HABITS;
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                isDarkMode={isDarkMode}
                isLocked={isLocked}
                onLongPress={isLocked ? undefined : () => handleEditHabit(habit.id)}
                onStatsPress={() => navigation.navigate('HabitAnalytics', { habitId: habit.id })}
                onCheckComplete={handleCheckComplete}
              />
            );
          })
        )}
      </ScrollView>

      {habits.length > 0 && <FAB onPress={handleAddHabit} disabled={false} />}

      <GoalCelebrationModal
        visible={celebration.visible}
        habitName={celebration.habitName}
        habitEmoji={celebration.habitEmoji}
        streak={celebration.streak}
        xpGained={celebration.xpGained}
        isDarkMode={isDarkMode}
        onClose={() => setCelebration(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.s,
  },
  greeting: {
    ...typography.h2,
    fontWeight: '700',
  },
  dateText: {
    ...typography.body,
    marginTop: 2,
  },
  reviewIconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.s,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.full,
  },
  pillText: {
    ...typography.caption,
    fontWeight: '600',
  },
  toggleRow: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    alignItems: 'flex-end',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: borderRadius.s,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xs,
  },
});
