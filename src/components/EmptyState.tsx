import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

interface EmptyStateProps {
  isDarkMode: boolean;
  onAddHabit: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isDarkMode, onAddHabit }) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <View style={styles.container}>
      <Text style={styles.illustration}>🎯</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        Crie seu primeiro hábito!
      </Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Comece sua jornada de progresso hoje mesmo
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onAddHabit}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>+ Adicionar Hábito</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
  },
  illustration: {
    fontSize: 64,
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
  },
  description: {
    ...typography.bodyLarge,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.l,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.s,
  },
  buttonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
