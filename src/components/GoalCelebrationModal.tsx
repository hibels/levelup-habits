import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

interface Props {
  visible: boolean;
  habitName: string;
  habitEmoji: string;
  streak: number;
  xpGained: number;
  onClose: () => void;
  isDarkMode: boolean;
}

// Decorative floating particles
const PARTICLES: { x: number; delay: number; color: string; size: number }[] = [
  { x: -72, delay: 0,   color: colors.primary.main,    size: 9  },
  { x:  72, delay: 60,  color: colors.secondary.main,  size: 7  },
  { x: -44, delay: 120, color: colors.primary.light,   size: 6  },
  { x:  48, delay: 40,  color: colors.secondary.light, size: 8  },
  { x: -20, delay: 90,  color: colors.semantic.info,   size: 5  },
  { x:  24, delay: 150, color: colors.accent.light,    size: 6  },
];

export const GoalCelebrationModal: React.FC<Props> = ({
  visible,
  habitName,
  habitEmoji,
  streak,
  xpGained,
  onClose,
  isDarkMode,
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  // Backdrop
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Card entrance
  const cardScale = useRef(new Animated.Value(0.75)).current;
  const cardTranslateY = useRef(new Animated.Value(32)).current;

  // Icon pulse (looping)
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;

  // Particles
  const particleAnims = useRef(
    PARTICLES.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      backdropOpacity.setValue(0);
      cardScale.setValue(0.75);
      cardTranslateY.setValue(32);
      pulseScale.setValue(1);
      pulseOpacity.setValue(0.5);
      particleAnims.forEach(p => {
        p.opacity.setValue(0);
        p.translateY.setValue(0);
      });

      // Backdrop + card entrance
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 90,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          tension: 90,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Start pulsing ring after card appears
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(pulseScale, {
                toValue: 1.22,
                duration: 750,
                useNativeDriver: true,
              }),
              Animated.timing(pulseOpacity, {
                toValue: 0,
                duration: 750,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(pulseScale, {
                toValue: 1,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(pulseOpacity, {
                toValue: 0.5,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      }, 250);

      // Particles burst upward
      PARTICLES.forEach((particle, i) => {
        const anim = particleAnims[i];
        const distance = 80 + Math.random() * 50;
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(anim.translateY, {
              toValue: -distance,
              duration: 700 + i * 60,
              useNativeDriver: true,
            }),
          ]).start(() => {
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        }, particle.delay + 350);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.92, duration: 180, useNativeDriver: true }),
      Animated.timing(cardTranslateY, { toValue: 16, duration: 180, useNativeDriver: true }),
    ]).start(onClose);
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      {/* Pressable backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
        />
      </Pressable>

      {/* Card */}
      <View style={styles.centerContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.card },
            !isDarkMode && styles.cardShadow,
            {
              transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            },
          ]}
        >
          {/* Icon section with particles */}
          <View style={styles.iconSection}>
            {/* Floating particles */}
            {PARTICLES.map((particle, i) => (
              <Animated.View
                key={i}
                pointerEvents="none"
                style={[
                  styles.particle,
                  {
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    backgroundColor: particle.color,
                    marginLeft: particle.x - particle.size / 2,
                    opacity: particleAnims[i].opacity,
                    transform: [{ translateY: particleAnims[i].translateY }],
                  },
                ]}
              />
            ))}

            {/* Pulsing outer ring */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: colors.primary.main,
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />

            {/* Icon circle */}
            <View style={styles.iconCircle}>
              <Ionicons name="flame" size={38} color="#FFFFFF" />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Meta semanal{'\n'}atingida!
          </Text>

          {/* Habit pill */}
          <View style={[styles.habitPill, { backgroundColor: `${colors.primary.main}12`, borderColor: `${colors.primary.main}25` }]}>
            <Text style={styles.habitEmoji}>{habitEmoji}</Text>
            <Text style={[styles.habitName, { color: theme.textPrimary }]} numberOfLines={1}>
              {habitName}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {streak > 0 && (
              <View style={[styles.statBadge, { backgroundColor: `${colors.secondary.main}15` }]}>
                <Ionicons name="flame" size={14} color={colors.secondary.main} />
                <Text style={[styles.statText, { color: colors.secondary.dark }]}>
                  {streak} {streak === 1 ? 'semana' : 'semanas'}
                </Text>
              </View>
            )}
            <View style={[styles.statBadge, { backgroundColor: `${colors.primary.main}15` }]}>
              <Ionicons name="flash" size={14} color={colors.primary.main} />
              <Text style={[styles.statText, { color: colors.primary.dark }]}>
                +{xpGained} XP
              </Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.button} onPress={handleClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Incrível!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: borderRadius.l + 4,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl + 4,
    alignItems: 'center',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  // Icon section
  iconSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
    height: 88,
    width: '100%',
  },
  particle: {
    position: 'absolute',
    top: '55%',
    alignSelf: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: spacing.m,
  },
  habitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginBottom: spacing.m,
    maxWidth: '100%',
  },
  habitEmoji: {
    fontSize: 18,
  },
  habitName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.l,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.full,
  },
  statText: {
    ...typography.caption,
    fontWeight: '700',
  },

  // Button
  button: {
    width: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
