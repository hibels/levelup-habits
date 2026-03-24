import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getXPForNextLevel, getLevelTitle } from '../utils/levels';

interface ProfileHeaderProps {
  profile: UserProfile;
  isDarkMode: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isDarkMode }) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const xpForNext = getXPForNextLevel(profile.level);
  const progressPercent = (profile.totalXP / xpForNext) * 100;
  const levelTitle = getLevelTitle(profile.level);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{profile.avatar}</Text>
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
          {profile.totalXP}/{xpForNext} XP
        </Text>
      </View>
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
    borderRadius: borderRadius.xxs,
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
});
