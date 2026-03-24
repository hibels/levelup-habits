import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useStore } from '../store';
import { ProfileHeader } from '../components/ProfileHeader';
import { HabitCard } from '../components/HabitCard';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { colors, spacing } from '../theme';
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
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);

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

  const handleCheckComplete = (xpGained: number, newLevel: number | null, newStreak: number) => {
    // Aqui você pode adicionar animações de confete, XP flutuante, etc.
    if (newLevel) {
      setShowLevelUp(newLevel);
      setTimeout(() => {
        Alert.alert(
          '⭐ Level Up! 🎉',
          `Você alcançou o Nível ${newLevel}!`,
          [{ text: 'Continuar', onPress: () => setShowLevelUp(null) }]
        );
      }, 500);
    }

    // Streak milestone
    if (newStreak === 7 || newStreak === 30 || newStreak === 100) {
      setTimeout(() => {
        Alert.alert(
          '🔥 Streak Incrível!',
          `${newStreak} dias de sequência! Continue assim!`,
          [{ text: 'OK' }]
        );
      }, 1000);
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
        {habits.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} onAddHabit={handleAddHabit} />
        ) : (
          <>
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isDarkMode={isDarkMode}
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
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.m,
  },
  bottomPadding: {
    height: 100, // Espaço para o FAB
  },
});
