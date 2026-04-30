import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getTranslations } from '../i18n';
import { resolveAchievementTitle, resolveAchievementDescription } from '../utils/achievements';


interface AchievementCardProps {
  achievement: Achievement;
  isDarkMode: boolean;
  isPremium: boolean;
  onPremiumPress?: () => void;
}

export const AchievementCard = React.memo<AchievementCardProps>(
  ({ achievement, isDarkMode, isPremium, onPremiumPress }) => {
    const theme = isDarkMode ? colors.dark : colors.light;
    const t = getTranslations() as Record<string, unknown>;
    const title = resolveAchievementTitle(achievement, t);
    const description = resolveAchievementDescription(achievement, t);
    const isUnlocked = achievement.unlockedAt !== null;
    const isLockedPremium = !isUnlocked && achievement.tier === 'premium' && !isPremium;

    const handlePress = () => {
      if (isLockedPremium) onPremiumPress?.();
    };

    const unlockedDate = achievement.unlockedAt
      ? new Date(achievement.unlockedAt).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null;

    const cardOpacity = isUnlocked ? 1 : isDarkMode ? 0.5 : 0.6;

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={isLockedPremium ? 0.7 : 1}
        disabled={!isLockedPremium}
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: isUnlocked ? colors.primary.main : theme.border,
            borderWidth: isUnlocked ? 1.5 : 1,
            opacity: cardOpacity,
          },
        ]}
      >
        {/* Crown badge for locked premium */}
        {isLockedPremium && (
          <View style={styles.crownBadge}>
            <Ionicons name="star" size={10} color="#FFFFFF" />
          </View>
        )}

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={achievement.icon as never}
            size={36}
            color={isUnlocked ? colors.secondary.main : theme.disabled}
            style={{ opacity: isUnlocked ? 1 : 0.3 }}
          />
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: theme.textPrimary, opacity: isLockedPremium ? 0.5 : 1 },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Status label */}
        {isUnlocked ? (
          <>
            <Text style={[styles.unlockedLabel, { color: colors.semantic.success }]}>
              {(t as Record<string, Record<string, string>>).achievements?.unlockedLabel ?? 'Conquistado!'}
            </Text>
            {unlockedDate && (
              <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>
                {unlockedDate}
              </Text>
            )}
          </>
        ) : isLockedPremium ? (
          <>
            <Text style={[styles.premiumLabel, { color: colors.secondary.main }]}>
              {(t as Record<string, Record<string, string>>).achievements?.lockedLabel ?? 'Premium'}
            </Text>
            <Text style={[styles.criteriaLabel, { color: theme.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="lock-closed" size={12} color={theme.disabled} style={styles.lockIcon} />
            <Text style={[styles.criteriaLabel, { color: theme.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.s,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    minHeight: 140,
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: spacing.s,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.label,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  unlockedLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  dateLabel: {
    ...typography.caption,
    marginTop: 2,
    textAlign: 'center',
  },
  premiumLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  lockIcon: {
    marginTop: 2,
    marginBottom: spacing.xxs,
  },
  criteriaLabel: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xxs,
    opacity: 0.75,
  },
});
