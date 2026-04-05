import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { ProfileHeader } from '../components/ProfileHeader';
import { HabitCard } from '../components/HabitCard';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { MotivationalMessage } from '../components/MotivationalMessage';
import { colors, spacing, typography, borderRadius } from '../theme';
import { MAX_FREE_HABITS } from '../utils/levels';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { habits, profile, themeMode, isPremium } = useStore();

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;
  const canAddHabit = isPremium || habits.length < MAX_FREE_HABITS;

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
    weekGoalReached: boolean
  ) => {
    if (newLevel) {
      setTimeout(() => {
        Alert.alert(
          'Level Up!',
          `Você alcançou o Nível ${newLevel}!`,
          [{ text: 'Continuar' }]
        );
      }, 300);
    } else if (weekGoalReached) {
      setTimeout(() => {
        Alert.alert(
          'Meta semanal atingida!',
          `Você completou sua meta desta semana. Continue assim!`,
          [{ text: 'Incrível!' }]
        );
      }, 300);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ProfileHeader profile={profile} isDarkMode={isDarkMode} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Frase motivacional */}
        {habits.length > 0 && <MotivationalMessage isDarkMode={isDarkMode} />}

        {/* Banner de review semanal */}
        {habits.length > 0 && (
          <TouchableOpacity
            style={[styles.reviewBanner, { backgroundColor: `${colors.primary.main}12`, borderColor: `${colors.primary.main}30` }]}
            onPress={() => navigation.navigate('WeeklyReview')}
            activeOpacity={0.8}
          >
            <Ionicons name="journal-outline" size={18} color={colors.primary.main} />
            <Text style={[styles.reviewBannerText, { color: colors.primary.dark }]}>
              Retrospectiva semanal
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}

        {habits.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} onAddHabit={handleAddHabit} />
        ) : (
          <>
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isDarkMode={isDarkMode}
                onLongPress={() => handleEditHabit(habit.id)}
                onCheckComplete={handleCheckComplete}
              />
            ))}
            <View style={styles.bottomPadding} />
          </>
        )}
      </ScrollView>

      {habits.length > 0 && (
        <FAB onPress={handleAddHabit} disabled={false} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: spacing.s },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    gap: spacing.xs,
  },
  reviewBannerText: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  bottomPadding: { height: 100 },
});
