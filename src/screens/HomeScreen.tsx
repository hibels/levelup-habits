import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useStore } from '../store';
import { ProfileHeader } from '../components/ProfileHeader';
import { HabitCard } from '../components/HabitCard';
import { EmptyState } from '../components/EmptyState';
import { FAB } from '../components/FAB';
import { colors, spacing } from '../theme';
import { MAX_FREE_HABITS } from '../utils/levels';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { habits, profile, themeMode, isPremium, isLoading, loadData } = useStore();
  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;
  const canAddHabit = isPremium || habits.length < MAX_FREE_HABITS;

  useEffect(() => {
    loadData();
  }, []);

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

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

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
        <FAB onPress={handleAddHabit} disabled={!canAddHabit} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
