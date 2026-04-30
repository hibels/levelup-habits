import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, Achievement } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getLevelTitle, getCurrentLevelXP, getXPForCurrentLevel } from '../utils/levels';
import { getTranslations } from '../i18n';
import { resolveAchievementTitle } from '../utils/achievements';

interface ProfileHeaderProps {
  profile: UserProfile;
  isDarkMode: boolean;
  recentAchievement?: Achievement | null;
  onRecentAchievementPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isDarkMode,
  recentAchievement,
  onRecentAchievementPress,
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const currentLevelXP = getCurrentLevelXP(profile.totalXP);
  const xpForCurrentLevel = getXPForCurrentLevel(profile.totalXP);
  const progressPercent = (currentLevelXP / xpForCurrentLevel) * 100;
  const levelTitle = getLevelTitle(profile.level);
  const t = getTranslations() as Record<string, unknown>;
  const ach = (t as Record<string, Record<string, string>>).achievements ?? {};
  const recentTitle = recentAchievement ? resolveAchievementTitle(recentAchievement, t) : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          {profile.avatar ? (
            <Text style={styles.avatar}>{profile.avatar}</Text>
          ) : (
            <Ionicons name="person" size={18} color={colors.primary.main} />
          )}
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{profile.name}</Text>
          <Text style={[styles.levelTitle, { color: theme.textSecondary }]}>{levelTitle}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>NÍVEL {profile.level}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progressPercent, 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={[styles.xpText, { color: theme.textSecondary }]}>
          {currentLevelXP}/{xpForCurrentLevel} XP
        </Text>
      </View>

      {recentAchievement && recentTitle && (
        <TouchableOpacity
          style={[styles.recentBadge, { backgroundColor: `${colors.secondary.main}26` }]}
          onPress={onRecentAchievementPress}
          activeOpacity={0.7}
        >
          <Ionicons name="trophy" size={14} color={colors.secondary.main} />
          <Text style={[styles.recentBadgeText, { color: theme.textPrimary }]} numberOfLines={1}>
            {(ach.recentBadge ?? 'Desbloqueaste: {name}').replace('{name}', recentTitle)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary.main}33`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 18,
  },
  nameContainer: {
    marginLeft: spacing.s,
    flex: 1,
  },
  name: {
    ...typography.bodyLarge,
  },
  levelTitle: {
    ...typography.caption,
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: `${colors.primary.main}1A`,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.m,
  },
  levelBadgeText: {
    ...typography.label,
    color: colors.primary.main,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary.main,
    borderRadius: 4,
  },
  xpText: {
    ...typography.caption,
    marginTop: 4,
  },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.m,
    marginTop: spacing.xs,
  },
  recentBadgeText: {
    ...typography.caption,
    flex: 1,
  },
});
