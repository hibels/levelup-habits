import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { scheduleDailyReminder, cancelDailyReminder } from '../utils/notifications';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_STEPS = 4;

export const OnboardingScreen: React.FC<Props> = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const completeOnboarding = useStore(state => state.completeOnboarding);

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
  const insets = useSafeAreaInsets();

  const canProceed = step !== 1 || name.trim().length > 0;

  const handleNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
    } else {
      await completeOnboarding(name.trim() || 'Usuário', '', notificationsEnabled);
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;
  const buttonLabel = step === 0 ? 'Começar' : isLastStep ? 'Vamos lá!' : 'Continuar';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.l }]}>

        {/* Progress dots (hidden on welcome) */}
        {step > 0 && (
          <View style={styles.dotsRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < step && styles.dotDone,
                  i === step && styles.dotActive,
                  i > step && styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Step content */}
        <View style={styles.content}>
          {step === 0 && <WelcomeStep />}
          {step === 1 && <NameStep name={name} onChangeName={setName} onSubmit={() => canProceed && handleNext()} />}
          {step === 2 && <NotificationsStep value={notificationsEnabled} onChange={handleNotificationsToggle} />}
          {step === 3 && <HowItWorksStep />}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !canProceed && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>

          {step > 0 && step < TOTAL_STEPS - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={() => setStep(s => s + 1)}>
              <Text style={styles.skipText}>Pular</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

/* ── Sub-components ─────────────────────────────────────────── */

function WelcomeStep() {
  return (
    <View style={styles.stepCenter}>
      <View style={[styles.bigIconBg, { backgroundColor: `${colors.primary.main}18` }]}>
        <Ionicons name="flash" size={52} color={colors.primary.main} />
      </View>
      <Text style={styles.welcomeTitle}>LevelUp Habits</Text>
      <Text style={styles.welcomeSubtitle}>
        Construa hábitos.{'\n'}Ganhe XP. Evolua.
      </Text>
    </View>
  );
}

interface NameStepProps {
  name: string;
  onChangeName: (v: string) => void;
  onSubmit: () => void;
}

function NameStep({ name, onChangeName, onSubmit }: NameStepProps) {
  return (
    <View style={styles.stepCenter}>
      <View style={[styles.iconBg, { backgroundColor: `${colors.primary.main}15` }]}>
        <Ionicons name="person-outline" size={36} color={colors.primary.main} />
      </View>
      <Text style={styles.stepTitle}>Como você quer{'\n'}ser chamado?</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        placeholderTextColor={colors.light.textSecondary}
        value={name}
        onChangeText={onChangeName}
        autoFocus
        maxLength={30}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
    </View>
  );
}

interface NotificationsStepProps {
  value: boolean;
  onChange: (v: boolean) => void | Promise<void>;
}

function NotificationsStep({ value, onChange }: NotificationsStepProps) {
  return (
    <View style={styles.stepCenter}>
      <View style={[styles.iconBg, { backgroundColor: `${colors.secondary.main}15` }]}>
        <Ionicons name="notifications-outline" size={36} color={colors.secondary.main} />
      </View>
      <Text style={styles.stepTitle}>Quer receber{'\n'}lembretes?</Text>
      <Text style={styles.stepDescription}>
        Receba um lembrete diário para manter seus hábitos em dia.
      </Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Ativar notificações</Text>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.light.border, true: `${colors.primary.main}70` }}
          thumbColor={value ? colors.primary.main : colors.light.disabled}
        />
      </View>
    </View>
  );
}

function HowItWorksStep() {
  const items = [
    {
      icon: 'checkbox-outline' as const,
      color: colors.primary.main,
      bg: `${colors.primary.main}15`,
      text: 'Marque seus hábitos todos os dias',
    },
    {
      icon: 'flame-outline' as const,
      color: colors.secondary.main,
      bg: `${colors.secondary.main}15`,
      text: 'Complete a meta semanal para manter a sequência',
    },
    {
      icon: 'trending-up-outline' as const,
      color: colors.semantic.info,
      bg: `${colors.semantic.info}15`,
      text: 'Ganhe XP e suba de nível',
    },
  ];

  return (
    <View style={styles.stepCenter}>
      <View style={[styles.iconBg, { backgroundColor: `${colors.primary.main}15` }]}>
        <Ionicons name="star-outline" size={36} color={colors.primary.main} />
      </View>
      <Text style={styles.stepTitle}>Como funciona?</Text>
      <View style={styles.featureList}>
        {items.map((item, i) => (
          <View key={i} style={styles.featureItem}>
            <View style={[styles.featureIconBg, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Styles ─────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary.main,
  },
  dotDone: {
    width: 8,
    backgroundColor: `${colors.primary.main}50`,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.light.border,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  stepCenter: {
    alignItems: 'center',
  },
  bigIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  welcomeSubtitle: {
    ...typography.bodyLarge,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  stepTitle: {
    ...typography.h2,
    color: colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  stepDescription: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.l,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.light.border,
    borderRadius: borderRadius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: 16,
    color: colors.light.textPrimary,
    marginTop: spacing.xs,
  },
  switchRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light.surface,
    borderRadius: borderRadius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  switchLabel: {
    ...typography.bodyLarge,
    color: colors.light.textPrimary,
  },
  featureList: {
    width: '100%',
    gap: spacing.s,
    marginTop: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    ...typography.bodyLarge,
    color: colors.light.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    gap: spacing.xs,
    paddingTop: spacing.l,
  },
  button: {
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.light.disabled,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  skipText: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
});
