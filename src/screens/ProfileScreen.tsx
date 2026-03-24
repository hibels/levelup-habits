import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getLevelTitle } from '../utils/levels';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, habits, themeMode } = useStore();

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;
  const levelTitle = getLevelTitle(profile.level);

  // Calcular estatísticas
  const totalHabits = habits.length;
  const maxStreak = Math.max(...habits.map(h => h.streak), 0);

  // Taxa de conclusão da semana (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const completedInLast7Days = habits.reduce((acc, habit) => {
    const completedDays = habit.completedDates.filter(date => last7Days.includes(date));
    return acc + completedDays.length;
  }, 0);

  const possibleCompletions = totalHabits * 7;
  const weeklyRate = possibleCompletions > 0
    ? Math.round((completedInLast7Days / possibleCompletions) * 100)
    : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
        </View>
        <Text style={styles.heroName}>{profile.name}</Text>
        <Text style={styles.heroLevel}>Nível {profile.level}</Text>
        <View style={styles.titleBadge}>
          <Text style={styles.titleText}>"{levelTitle}"</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          📊 Estatísticas
        </Text>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary.main }]}>
              {profile.totalXP.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>XP Total</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary.main }]}>
              {totalHabits}/{totalHabits}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Hábitos</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary.main }]}>
              🔥 {maxStreak}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Maior Streak</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary.main }]}>
              {weeklyRate}%
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Taxa Semana</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  hero: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
    backgroundColor: colors.primary.main,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 64,
  },
  heroName: {
    ...typography.h2,
    color: '#FFFFFF',
    marginTop: spacing.m,
  },
  heroLevel: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xxs,
  },
  titleBadge: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.m,
  },
  titleText: {
    ...typography.caption,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  section: {
    padding: spacing.m,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  statCard: {
    width: '48%',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.numberLarge,
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
});
