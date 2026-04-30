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
import { colors, spacing, typography, borderRadius } from '../theme';
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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = getTranslations() as Record<string, unknown>;
  const ach = (t as Record<string, Record<string, string>>).achievements ?? {};

  useEffect(() => {
    if (!achievement) return;

    Animated.spring(translateY, {
      toValue: 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();

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
    Animated.timing(translateY, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onDismiss();
    });
  };

  if (!achievement) return null;

  const title = resolveAchievementTitle(achievement, t);
  const recentBadgeText = (ach.recentBadge ?? 'Desbloqueaste: {name}').replace('{name}', title);

  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: insets.top + spacing.xs, transform: [{ translateY }] },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => { handleDismiss(); onPress?.(); }}
        activeOpacity={0.9}
      >
        <Ionicons name="trophy" size={18} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.text} numberOfLines={1}>
          {recentBadgeText}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.secondary.main,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
    zIndex: 999,
    borderBottomLeftRadius: borderRadius.s,
    borderBottomRightRadius: borderRadius.s,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    ...typography.label,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
});
