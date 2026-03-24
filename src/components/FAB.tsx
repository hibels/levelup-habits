import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface FABProps {
  onPress: () => void;
  disabled?: boolean;
}

export const FAB: React.FC<FABProps> = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        disabled && styles.disabled,
        !disabled && shadows.large,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: spacing.l,
    right: spacing.l,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  disabled: {
    backgroundColor: colors.light.disabled,
  },
  icon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
