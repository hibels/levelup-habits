import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Share,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { getLevelTitle } from '../utils/levels';
import { colors, spacing, typography, borderRadius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelUp'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LEVEL_ICONS: Record<number, keyof typeof Ionicons.glyphMap> = {
  1: 'leaf-outline',
  2: 'book-outline',
  3: 'flame-outline',
  4: 'shield-checkmark-outline',
  5: 'trending-up-outline',
  6: 'eye-outline',
  7: 'barbell-outline',
  8: 'trophy-outline',
  9: 'diamond-outline',
  10: 'infinite-outline',
};

const LEVEL_TAGLINES: Record<number, string> = {
  1: 'Sua jornada começa aqui.',
  2: 'Cada hábito é uma lição aprendida.',
  3: 'Sua dedicação está dando frutos.',
  4: 'Você não desiste. Isso muda tudo.',
  5: 'A determinação é o segredo dos campeões.',
  6: 'Foco total. Resultados reais.',
  7: 'Disciplina é liberdade.',
  8: 'Você dominou a arte da consistência.',
  9: 'Sua lenda está sendo escrita.',
  10: 'Você transcendeu. Imortal.',
};

export const LevelUpScreen: React.FC<Props> = ({ navigation, route }) => {
  const { level, totalXP } = route.params;
  const insets = useSafeAreaInsets();

  const levelTitle = getLevelTitle(level);
  const levelIcon = LEVEL_ICONS[level] ?? 'star-outline';
  const tagline = LEVEL_TAGLINES[level] ?? '';

  // Animation refs
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const labelTranslate = useRef(new Animated.Value(24)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(24)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(labelTranslate, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(labelOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleTranslate, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.timing(xpOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(buttonsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏆 Subi para o nível ${level} — "${levelTitle}" no LevelUp Habits! Já acumulei ${totalXP} XP. #LevelUpHabits`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      <StatusBar barStyle="light-content" />

      {/* Decorative rings */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      <View style={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.l }]}>
        {/* Badge */}
        <Animated.View
          style={[
            styles.badgeWrapper,
            { transform: [{ scale: badgeScale }], opacity: badgeOpacity },
          ]}
        >
          <View style={styles.badgeOuter}>
            <View style={styles.badgeInner}>
              <Ionicons name={levelIcon} size={56} color={colors.secondary.main} />
            </View>
          </View>
          <View style={styles.levelNumberBadge}>
            <Text style={styles.levelNumber}>{level}</Text>
          </View>
        </Animated.View>

        {/* "LEVEL UP!" label */}
        <Animated.View
          style={{ transform: [{ translateY: labelTranslate }], opacity: labelOpacity }}
        >
          <Text style={styles.levelUpLabel}>LEVEL UP!</Text>
        </Animated.View>

        {/* Level title */}
        <Animated.View
          style={{ transform: [{ translateY: titleTranslate }], opacity: titleOpacity, alignItems: 'center' }}
        >
          <Text style={styles.levelTitle}>{levelTitle}</Text>
          <Text style={styles.tagline}>{tagline}</Text>
        </Animated.View>

        {/* XP total */}
        <Animated.View style={[styles.xpRow, { opacity: xpOpacity }]}>
          <Ionicons name="flash" size={18} color={colors.secondary.main} />
          <Text style={styles.xpText}>{totalXP.toLocaleString()} XP acumulados</Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttons, { opacity: buttonsOpacity }]}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={18} color={colors.secondary.main} />
            <Text style={styles.shareLabel}>Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.continueLabel}>Continuar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const RING_SIZE = SCREEN_WIDTH * 1.4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ringOuter: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1,
    borderColor: `${colors.secondary.main}18`,
  },
  ringInner: {
    position: 'absolute',
    width: RING_SIZE * 0.65,
    height: RING_SIZE * 0.65,
    borderRadius: (RING_SIZE * 0.65) / 2,
    borderWidth: 1,
    borderColor: `${colors.secondary.main}28`,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  badgeOuter: {
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: `${colors.secondary.main}18`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: `${colors.secondary.main}50`,
  },
  badgeInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: `${colors.secondary.main}28`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumberBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A0F1E',
  },
  levelNumber: {
    color: '#0A0F1E',
    fontSize: 15,
    fontWeight: '800',
  },
  levelUpLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.secondary.main,
    textTransform: 'uppercase',
  },
  levelTitle: {
    ...typography.h1,
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.bodyLarge,
    color: '#94A3B8',
    textAlign: 'center',
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: `${colors.secondary.main}18`,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: `${colors.secondary.main}40`,
  },
  xpText: {
    ...typography.body,
    color: colors.secondary.light,
    fontWeight: '600',
  },
  buttons: {
    width: '100%',
    gap: spacing.s,
    marginTop: spacing.m,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.m,
    borderRadius: borderRadius.m,
    alignItems: 'center',
  },
  continueLabel: {
    ...typography.bodyLarge,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.m,
    borderRadius: borderRadius.m,
    borderWidth: 1.5,
    borderColor: `${colors.secondary.main}60`,
    backgroundColor: `${colors.secondary.main}12`,
  },
  shareLabel: {
    ...typography.bodyLarge,
    color: colors.secondary.light,
    fontWeight: '600',
  },
});
