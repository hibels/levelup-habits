import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Achievement } from '../types';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getTranslations } from '../i18n';
import { resolveAchievementTitle } from '../utils/achievements';

const AUTO_DISMISS_MS = 4000;

interface Props {
  achievement: Achievement | null;
  onPress?: () => void;
  onDismiss: () => void;
}

export const AchievementBanner: React.FC<Props> = ({ achievement, onPress, onDismiss }) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = getTranslations() as Record<string, unknown>;
  const ach = (t as Record<string, Record<string, string>>).achievements ?? {};

  useEffect(() => {
    if (!achievement) return;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    timer.current = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement]);

  const handleDismiss = () => {
    if (timer.current) clearTimeout(timer.current);
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onDismiss();
    });
  };

  if (!achievement) return null;

  const title = resolveAchievementTitle(achievement, t);
  const label = ach.recentBadgeLabel ?? (t as Record<string, Record<string, string>>).achievements?.unlockModalTitle ?? 'Nova conquista!';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: insets.top + spacing.s, transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={() => { handleDismiss(); onPress?.(); }}
        activeOpacity={0.92}
      >
        {/* Icon badge */}
        <View style={styles.iconBadge}>
          <Ionicons name={achievement.icon as never} size={22} color={colors.secondary.main} />
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.labelText}>{label}</Text>
          <Text style={styles.nameText} numberOfLines={1}>{title}</Text>
        </View>

        {/* Dismiss */}
        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.m,
    right: spacing.m,
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: borderRadius.m,
    borderWidth: 1,
    borderColor: colors.secondary.main,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
    gap: spacing.s,
    ...shadows.medium,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,193,7,0.12)',
    borderWidth: 1.5,
    borderColor: colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
  },
  labelText: {
    ...typography.caption,
    color: colors.secondary.main,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nameText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  closeBtn: {
    padding: spacing.xxs,
  },
});
