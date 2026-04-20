import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scheduleDailyReminder, cancelDailyReminder } from '../utils/notifications';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { LEVELS, XP_PER_HABIT_CHECK } from '../utils/levels';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_STEPS = 4;

const AVATAR_EMOJIS = ['🦁', '🐯', '🐺', '🦅', '🐉', '🦊', '🐻', '🦋', '⚡', '🌟', '🔥', '💎'];

const HABIT_EMOJIS = [
  '🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '✍️',
  '🎯', '🎸', '🌱', '🧠', '🏋️', '🚴', '🤸', '🎨',
  '🧹', '💻', '🗣️', '❤️',
];

export const OnboardingScreen: React.FC<Props> = () => {
  const themeMode = useStore(state => state.themeMode);
  const completeOnboarding = useStore(state => state.completeOnboarding);
  const addHabit = useStore(state => state.addHabit);
  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);

  // Profile state
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_EMOJIS[0]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Habit state
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState(HABIT_EMOJIS[0]);
  const [weeklyGoal, setWeeklyGoal] = useState(5);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 2) {
      xpAnim.setValue(0);
      Animated.timing(xpAnim, {
        toValue: 1,
        duration: 1100,
        delay: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [step]);

  function goToStep(nextStep: number) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      slideAnim.setValue(30);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  }

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const { status } = await import('expo-notifications').then(n => n.requestPermissionsAsync());
      const granted = status === 'granted';
      setNotificationsEnabled(granted);
      if (granted) await scheduleDailyReminder();
    } else {
      setNotificationsEnabled(false);
      await cancelDailyReminder();
    }
  };

  async function handleSkip() {
    await completeOnboarding(name.trim() || 'Herói', selectedAvatar, notificationsEnabled);
  }

  async function handleFinishWithHabit() {
    const finalName = name.trim() || 'Herói';
    await completeOnboarding(finalName, selectedAvatar, notificationsEnabled);
    if (habitName.trim().length >= 2) {
      await addHabit(habitName.trim(), habitEmoji, weeklyGoal);
    }
  }

  async function handleFinishSkipHabit() {
    await completeOnboarding(name.trim() || 'Herói', selectedAvatar, notificationsEnabled);
  }

  const canAdvanceProfile = name.trim().length >= 2;
  const canAdvanceHabit = habitName.trim().length >= 2;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + spacing.m, paddingBottom: insets.bottom + spacing.m }]}>

        {/* Header: dots + skip */}
        <View style={styles.headerRow}>
          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < step && [styles.dotDone, { backgroundColor: colors.primary.main + '50' }],
                  i === step && styles.dotActive,
                  i > step && [styles.dotInactive, { backgroundColor: theme.border }],
                ]}
              />
            ))}
          </View>
          {step > 0 && (
            <TouchableOpacity
              onPress={handleSkip}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.skipText, { color: theme.textSecondary }]}>Pular</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step content */}
        <Animated.View style={[
          styles.contentArea,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}>
          {step === 0 && (
            <WelcomeStep
              theme={theme}
              isDarkMode={isDarkMode}
              onNext={() => goToStep(1)}
            />
          )}
          {step === 1 && (
            <ProfileStep
              theme={theme}
              isDarkMode={isDarkMode}
              name={name}
              setName={setName}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              notificationsEnabled={notificationsEnabled}
              onToggleNotifications={handleNotificationsToggle}
              canAdvance={canAdvanceProfile}
              onNext={() => goToStep(2)}
            />
          )}
          {step === 2 && (
            <XpLevelsStep
              theme={theme}
              isDarkMode={isDarkMode}
              xpAnim={xpAnim}
              onNext={() => goToStep(3)}
            />
          )}
          {step === 3 && (
            <FirstHabitStep
              theme={theme}
              isDarkMode={isDarkMode}
              habitName={habitName}
              setHabitName={setHabitName}
              habitEmoji={habitEmoji}
              setHabitEmoji={setHabitEmoji}
              weeklyGoal={weeklyGoal}
              setWeeklyGoal={setWeeklyGoal}
              canAdvance={canAdvanceHabit}
              onFinish={handleFinishWithHabit}
              onSkipHabit={handleFinishSkipHabit}
            />
          )}
        </Animated.View>

      </View>
    </KeyboardAvoidingView>
  );
};

/* ── Step 0: Welcome ──────────────────────────────────────────── */

function WelcomeStep({ theme, isDarkMode, onNext }: {
  theme: typeof colors.light;
  isDarkMode: boolean;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepWrapper}>
      <View style={styles.stepScroll}>
        <View style={styles.heroArea}>
          <View style={[styles.heroCircle, { backgroundColor: isDarkMode ? colors.primary.dark + '40' : '#D1FAE5' }]}>
            <Ionicons name="trophy" size={64} color={colors.primary.main} />
          </View>
          <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>LevelUp Habits</Text>
          <Text style={[styles.welcomeTagline, { color: colors.primary.main }]}>
            Transforme hábitos em conquistas
          </Text>
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <FeatureRow
            icon="flash"
            iconColor={colors.secondary.main}
            text="Ganhe XP e suba de nível a cada check-in"
            theme={theme}
          />
          <FeatureRow
            icon="flame"
            iconColor={colors.accent.main}
            text="Construa streaks semanais e mantenha o ritmo"
            theme={theme}
          />
          <FeatureRow
            icon="bar-chart"
            iconColor={colors.semantic.info}
            text="Acompanhe o progresso com retrospectivas semanais"
            theme={theme}
          />
        </View>
      </View>

      <TouchableOpacity style={[styles.primaryButton, shadows.large]} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Começar minha jornada</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: spacing.xs }} />
      </TouchableOpacity>
    </View>
  );
}

/* ── Step 1: Profile ─────────────────────────────────────────── */

function ProfileStep({ theme, isDarkMode, name, setName, selectedAvatar, setSelectedAvatar, notificationsEnabled, onToggleNotifications, canAdvance, onNext }: {
  theme: typeof colors.light;
  isDarkMode: boolean;
  name: string;
  setName: (v: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (v: string) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (v: boolean) => void;
  canAdvance: boolean;
  onNext: () => void;
}) {
  return (
    <View style={styles.stepWrapper}>
      <ScrollView
        style={styles.stepScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Crie seu perfil de herói</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          Personalize sua jornada
        </Text>

        {/* Avatar grid */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Escolha seu avatar</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_EMOJIS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.avatarOption,
                { borderColor: emoji === selectedAvatar ? colors.primary.main : theme.border },
                emoji === selectedAvatar && { backgroundColor: isDarkMode ? colors.primary.dark + '33' : '#D1FAE5' },
              ]}
              onPress={() => setSelectedAvatar(emoji)}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Seu nome ou apelido</Text>
        <TextInput
          style={[styles.textInput, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.textPrimary,
          }]}
          placeholder="Ex: Ana, Dev, Guerreiro..."
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
          maxLength={30}
          autoCapitalize="words"
          returnKeyType="done"
        />

        {/* Notifications */}
        <View style={[styles.toggleRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={{ flex: 1, marginRight: spacing.m }}>
            <Text style={[typography.bodyLarge, { color: theme.textPrimary, fontWeight: '500' }]}>
              Lembretes diários
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
              Receba uma nudge quando esquecer seus hábitos
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
            trackColor={{ false: theme.disabled, true: colors.primary.light }}
            thumbColor={notificationsEnabled ? colors.primary.main : '#FFFFFF'}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.primaryButton, shadows.large, !canAdvance && styles.primaryButtonDisabled]}
        onPress={onNext}
        disabled={!canAdvance}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Continuar</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: spacing.xs }} />
      </TouchableOpacity>
    </View>
  );
}

/* ── Step 2: XP & Levels ─────────────────────────────────────── */

function XpLevelsStep({ theme, isDarkMode, xpAnim, onNext }: {
  theme: typeof colors.light;
  isDarkMode: boolean;
  xpAnim: Animated.Value;
  onNext: () => void;
}) {
  const xpBarWidth = xpAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '68%'] });
  const showcaseLevels = LEVELS.slice(0, 5);

  return (
    <View style={styles.stepWrapper}>
      <ScrollView style={styles.stepScroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Suba de nível</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          Cada hábito marcado rende XP e te aproxima do próximo nível
        </Text>

        {/* Animated XP bar demo */}
        <View style={[styles.xpCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.xpCardHeader}>
            <View style={[styles.levelPill, { backgroundColor: colors.primary.main }]}>
              <Text style={styles.levelPillText}>Nv. 1 · Iniciante</Text>
            </View>
          </View>
          <View style={[styles.xpTrack, { backgroundColor: isDarkMode ? theme.border : '#E5E7EB' }]}>
            <Animated.View style={[styles.xpFill, { width: xpBarWidth }]} />
          </View>
          <View style={styles.xpCardFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flash" size={14} color={colors.secondary.main} />
              <Text style={[typography.caption, { color: colors.secondary.main, fontWeight: '600', marginLeft: 4 }]}>
                +{XP_PER_HABIT_CHECK} XP por check-in
              </Text>
            </View>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>68 / 100 XP</Text>
          </View>
        </View>

        {/* Level progression */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: spacing.l }]}>
          Sua progressão
        </Text>
        {showcaseLevels.map((lvl, index) => (
          <View key={lvl.level} style={styles.levelRow}>
            <View style={[
              styles.levelCircle,
              { backgroundColor: index === 0 ? colors.primary.main : (isDarkMode ? theme.border : '#F3F4F6') },
            ]}>
              <Text style={[styles.levelCircleText, { color: index === 0 ? '#FFF' : theme.textSecondary }]}>
                {lvl.level}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyLarge, { color: theme.textPrimary, fontWeight: index === 0 ? '600' : '400' }]}>
                {lvl.title}
              </Text>
              {lvl.xpRequired > 0 && (
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  {lvl.xpRequired} XP para desbloquear
                </Text>
              )}
            </View>
            {index === 0 && (
              <View style={[styles.herePill, { backgroundColor: colors.primary.main + '20' }]}>
                <Text style={[typography.label, { color: colors.primary.main }]}>Você está aqui</Text>
              </View>
            )}
          </View>
        ))}
        <View style={[styles.levelRow, { opacity: 0.45 }]}>
          <View style={[styles.levelCircle, { backgroundColor: isDarkMode ? theme.border : '#F3F4F6' }]}>
            <Ionicons name="ellipsis-horizontal" size={12} color={theme.textSecondary} />
          </View>
          <Text style={[typography.body, { color: theme.textSecondary }]}>+ 5 níveis até Imortal</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.primaryButton, shadows.large]} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Entendi, vamos lá!</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: spacing.xs }} />
      </TouchableOpacity>
    </View>
  );
}

/* ── Step 3: First Habit ─────────────────────────────────────── */

function FirstHabitStep({ theme, isDarkMode, habitName, setHabitName, habitEmoji, setHabitEmoji, weeklyGoal, setWeeklyGoal, canAdvance, onFinish, onSkipHabit }: {
  theme: typeof colors.light;
  isDarkMode: boolean;
  habitName: string;
  setHabitName: (v: string) => void;
  habitEmoji: string;
  setHabitEmoji: (v: string) => void;
  weeklyGoal: number;
  setWeeklyGoal: (v: number) => void;
  canAdvance: boolean;
  onFinish: () => void;
  onSkipHabit: () => void;
}) {
  return (
    <View style={styles.stepWrapper}>
      <ScrollView
        style={styles.stepScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Seu primeiro hábito</Text>
        <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
          Comece com algo pequeno e consistente — você pode adicionar mais depois
        </Text>

        {/* Habit name */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Nome do hábito</Text>
        <TextInput
          style={[styles.textInput, {
            backgroundColor: theme.card,
            borderColor: theme.border,
            color: theme.textPrimary,
          }]}
          placeholder="Ex: Meditar, Correr, Ler..."
          placeholderTextColor={theme.textSecondary}
          value={habitName}
          onChangeText={setHabitName}
          maxLength={50}
          autoCapitalize="sentences"
          returnKeyType="done"
        />

        {/* Emoji picker */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Ícone</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -spacing.m, marginBottom: spacing.m }}
          contentContainerStyle={{ paddingHorizontal: spacing.m, gap: spacing.xs }}
        >
          {HABIT_EMOJIS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiOption,
                { borderColor: emoji === habitEmoji ? colors.primary.main : theme.border },
                emoji === habitEmoji && { backgroundColor: isDarkMode ? colors.primary.dark + '33' : '#D1FAE5' },
              ]}
              onPress={() => setHabitEmoji(emoji)}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Weekly goal */}
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Meta semanal</Text>
        <Text style={[typography.caption, { color: theme.textSecondary, marginBottom: spacing.s }]}>
          Quantas vezes por semana?
        </Text>
        <View style={styles.goalRow}>
          {[1, 2, 3, 4, 5, 6, 7].map(n => (
            <TouchableOpacity
              key={n}
              style={[
                styles.goalButton,
                { borderColor: n === weeklyGoal ? colors.primary.main : theme.border, backgroundColor: theme.card },
                n === weeklyGoal && { backgroundColor: colors.primary.main },
              ]}
              onPress={() => setWeeklyGoal(n)}
              activeOpacity={0.75}
            >
              <Text style={[styles.goalButtonText, { color: n === weeklyGoal ? '#FFF' : theme.textSecondary }]}>
                {n === 7 ? 'Todo\ndia' : `${n}×`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View>
        <TouchableOpacity
          style={[styles.primaryButton, shadows.large, !canAdvance && styles.primaryButtonDisabled]}
          onPress={onFinish}
          disabled={!canAdvance}
          activeOpacity={0.85}
        >
          <Ionicons name="rocket" size={18} color="#FFF" style={{ marginRight: spacing.xs }} />
          <Text style={styles.primaryButtonText}>Começar minha jornada!</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkipHabit} style={styles.skipLinkButton} activeOpacity={0.7}>
          <Text style={[typography.body, { color: theme.textSecondary }]}>Criar hábito depois</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Shared sub-components ───────────────────────────────────── */

function FeatureRow({ icon, iconColor, text, theme }: {
  icon: string;
  iconColor: string;
  text: string;
  theme: typeof colors.light;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.m }}>
      <View style={[{
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: iconColor + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.m,
      }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[typography.bodyLarge, { color: theme.textPrimary, flex: 1, lineHeight: 22 }]}>{text}</Text>
    </View>
  );
}

/* ── Styles ──────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    marginBottom: spacing.xs,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.main,
  },
  dotDone: {
    width: 8,
  },
  dotInactive: {
    width: 8,
  },
  skipText: {
    ...typography.body,
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
  },
  stepWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepScroll: {
    flex: 1,
    marginBottom: spacing.m,
  },
  heroArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.l,
  },
  heroCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  welcomeTitle: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  welcomeTagline: {
    ...typography.h3,
    fontWeight: '400',
    textAlign: 'center',
  },
  stepTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
    marginTop: spacing.s,
  },
  stepSubtitle: {
    ...typography.bodyLarge,
    marginBottom: spacing.l,
  },
  fieldLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.l,
  },
  avatarOption: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.m,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    ...typography.bodyLarge,
    marginBottom: spacing.m,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: borderRadius.m,
    borderWidth: 1.5,
    marginBottom: spacing.l,
  },
  // XP step
  xpCard: {
    borderRadius: borderRadius.l,
    borderWidth: 1.5,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.medium,
  },
  xpCardHeader: {
    marginBottom: spacing.s,
  },
  levelPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  levelPillText: {
    ...typography.label,
    color: '#FFFFFF',
  },
  xpTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.s,
  },
  xpFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary.main,
  },
  xpCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.m,
  },
  levelCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCircleText: {
    ...typography.numberSmall,
  },
  herePill: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  // Habit step
  emojiOption: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.m,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.l,
  },
  goalButton: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.m,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalButtonText: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Buttons
  primaryButton: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.l,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  primaryButtonText: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  skipLinkButton: {
    alignItems: 'center',
    paddingVertical: spacing.s,
    marginBottom: spacing.xs,
  },
});
