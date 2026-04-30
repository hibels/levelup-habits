import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getTranslations } from '../i18n';
import { resolveAchievementTitle, resolveAchievementDescription } from '../utils/achievements';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PARTICLE_COUNT = 30;
const AUTO_DISMISS_MS = 3500;

interface ConfettiParticle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
}

const CONFETTI_COLORS = [
  colors.primary.main,
  colors.secondary.main,
  colors.accent.main,
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
];

interface Props {
  achievement: Achievement | null;
  isDarkMode: boolean;
  onClose: () => void;
}

export const AchievementUnlockModal: React.FC<Props> = ({ achievement, isDarkMode, onClose }) => {
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.5)).current;
  const cardTranslateY = useRef(new Animated.Value(80)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progressBorder = useRef(new Animated.Value(0)).current;
  const [particles] = useState<ConfettiParticle[]>(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: new Animated.Value(SCREEN_WIDTH * 0.5 + (Math.random() - 0.5) * 60),
      y: new Animated.Value(SCREEN_HEIGHT * 0.3),
      opacity: new Animated.Value(0),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 4 + Math.random() * 8,
    }))
  );

  const t = getTranslations() as Record<string, unknown>;
  const achievementsT = (t as Record<string, Record<string, string>>).achievements ?? {};

  useEffect(() => {
    if (!achievement) return;

    // Reset animations
    scrimOpacity.setValue(0);
    cardScale.setValue(0.5);
    cardTranslateY.setValue(80);
    textOpacity.setValue(0);
    progressBorder.setValue(0);
    particles.forEach(p => { p.opacity.setValue(0); p.y.setValue(SCREEN_HEIGHT * 0.3); });

    Animated.sequence([
      Animated.timing(scrimOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
        Animated.spring(cardTranslateY, { toValue: 0, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Confetti burst
    InteractionManager.runAfterInteractions(() => {
      const confettiAnims = particles.map(p => {
        const targetX = SCREEN_WIDTH * (0.1 + Math.random() * 0.8);
        const targetY = SCREEN_HEIGHT * (0.05 + Math.random() * 0.5);
        return Animated.parallel([
          Animated.timing(p.opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(p.x, { toValue: targetX, duration: 1500 + Math.random() * 500, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: targetY, duration: 1500 + Math.random() * 500, useNativeDriver: true }),
          Animated.sequence([
            Animated.delay(1000),
            Animated.timing(p.opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          ]),
        ]);
      });
      Animated.stagger(40, confettiAnims).start();
    });

    // Progress border auto-dismiss
    Animated.timing(progressBorder, {
      toValue: 1,
      duration: AUTO_DISMISS_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onClose();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement]);

  if (!achievement) return null;

  const title = resolveAchievementTitle(achievement, t);
  const description = resolveAchievementDescription(achievement, t);

  const borderProgress = progressBorder.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal transparent visible={!!achievement} animationType="none" statusBarTranslucent>
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: scrimOpacity }]}>
        {/* Confetti particles */}
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                backgroundColor: p.color,
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                opacity: p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                ],
              },
            ]}
          />
        ))}

        {/* Trophy card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Progress border indicator (auto-dismiss timer) */}
          <Animated.View
            style={[
              styles.progressBorder,
              { width: borderProgress },
            ]}
          />

          <Ionicons
            name={achievement.icon as never}
            size={72}
            color={colors.secondary.main}
            style={styles.icon}
          />

          <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
            <Text style={styles.modalTitle}>
              {achievementsT.unlockModalTitle ?? 'Conquista Desbloqueada!'}
            </Text>
            <Text style={styles.achievementTitle}>{title}</Text>
            <Text style={styles.achievementDesc}>{description}</Text>
          </Animated.View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {achievementsT.congratsButton ?? 'Incrível, obrigado!'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.80)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  card: {
    width: SCREEN_WIDTH * 0.84,
    backgroundColor: '#1A1A2E',
    borderRadius: borderRadius.l,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    overflow: 'hidden',
  },
  progressBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: colors.primary.main,
  },
  icon: {
    marginBottom: spacing.m,
  },
  modalTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  achievementTitle: {
    ...typography.h2,
    color: colors.secondary.main,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.s,
  },
  achievementDesc: {
    ...typography.body,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  ctaButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.full,
  },
  ctaText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
