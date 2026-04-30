import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../types';
import { AchievementCard } from './AchievementCard';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getTranslations } from '../i18n';
import { ACHIEVEMENT_CATALOG } from '../utils/achievements';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;

interface Props {
  visible: boolean;
  achievements: Achievement[];
  isDarkMode: boolean;
  isPremium: boolean;
  onClose: () => void;
  onPremiumPress: () => void;
}

export const AchievementsSheet: React.FC<Props> = ({
  visible,
  achievements,
  isDarkMode,
  isPremium,
  onClose,
  onPremiumPress,
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const t = getTranslations() as Record<string, unknown>;
  const ach = (t as Record<string, Record<string, string>>).achievements ?? {};

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const unlocked = achievements.filter(a => a.unlockedAt !== null);
  const lockedFree = achievements.filter(a => a.unlockedAt === null && a.tier === 'free');
  const lockedPremium = achievements.filter(a => a.unlockedAt === null && a.tier === 'premium');

  const renderGroup = (label: string, items: Achievement[]) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>{label}</Text>
        <View style={styles.grid}>
          {items.map(a => (
            <View key={a.id} style={styles.gridItem}>
              <AchievementCard
                achievement={a}
                isDarkMode={isDarkMode}
                isPremium={isPremium}
                onPremiumPress={onPremiumPress}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: theme.background, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.handleBar}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {ach.sectionTitle ?? 'Troféus'}
          </Text>
          <Text style={[styles.headerCount, { color: theme.textSecondary }]}>
            {(ach.progress ?? '{unlocked}/{total} conquistados')
              .replace('{unlocked}', String(unlocked.length))
              .replace('{total}', String(ACHIEVEMENT_CATALOG.length))}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderGroup(ach.sheetGroupUnlocked ?? 'CONQUISTADOS', unlocked)}
          {renderGroup(ach.sheetGroupLockedFree ?? 'BLOQUEADOS — FREE', lockedFree)}
          {renderGroup(ach.sheetGroupLockedPrem ?? 'BLOQUEADOS — PREMIUM', lockedPremium)}

          {/* Premium upsell banner for free users */}
          {!isPremium && (
            <TouchableOpacity
              style={[styles.premiumBanner, { borderColor: colors.secondary.main }]}
              onPress={onPremiumPress}
              activeOpacity={0.85}
            >
              <Ionicons name="star" size={20} color={colors.secondary.main} />
              <View style={styles.premiumBannerInfo}>
                <Text style={[styles.premiumBannerTitle, { color: theme.textPrimary }]}>
                  {ach.premiumBannerTitle ?? 'Desbloqueie todos com LevelUp Premium'}
                </Text>
              </View>
              <View style={styles.premiumCta}>
                <Text style={styles.premiumCtaText}>
                  {ach.premiumBannerCta ?? 'Fazer upgrade'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: borderRadius.l,
    borderTopRightRadius: borderRadius.l,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: spacing.s,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '700',
  },
  headerCount: {
    ...typography.caption,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
  },
  content: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.xl,
  },
  group: {
    marginBottom: spacing.l,
  },
  groupLabel: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  gridItem: {
    width: '47.5%',
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1.5,
    borderRadius: borderRadius.m,
    gap: spacing.s,
    marginTop: spacing.s,
  },
  premiumBannerInfo: {
    flex: 1,
  },
  premiumBannerTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  premiumCta: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.s,
  },
  premiumCtaText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
