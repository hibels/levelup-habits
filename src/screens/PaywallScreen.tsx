import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

type PlanType = 'annual' | 'monthly';

interface Benefit {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const BENEFITS: Benefit[] = [
  { icon: 'infinite-outline', text: 'Hábitos ilimitados' },
  { icon: 'bar-chart-outline', text: 'Dashboard semanal completo' },
  { icon: 'journal-outline', text: 'Retrospectiva semanal ilimitada' },
  { icon: 'trophy-outline', text: 'Histórico de streaks completo' },
];

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const { themeMode } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Close */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={22} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.heroIconBg, { backgroundColor: `${colors.primary.main}18` }]}>
          <Ionicons name="star" size={48} color={colors.primary.main} />
        </View>
        <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
          Desbloqueie o{'\n'}LevelUp Premium
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          Tudo que você precisa para construir hábitos duradouros.
        </Text>
      </View>

      {/* Benefits */}
      <View style={[styles.benefitsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {BENEFITS.map((benefit, index) => (
          <View key={index} style={[styles.benefitRow, index < BENEFITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={[styles.benefitIconBg, { backgroundColor: `${colors.primary.main}15` }]}>
              <Ionicons name={benefit.icon} size={18} color={colors.primary.main} />
            </View>
            <Text style={[styles.benefitText, { color: theme.textPrimary }]}>{benefit.text}</Text>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary.main} />
          </View>
        ))}
      </View>

      {/* Pricing */}
      <View style={styles.pricing}>
        {/* Annual */}
        <TouchableOpacity
          style={[
            styles.planCard,
            {
              backgroundColor: selectedPlan === 'annual' ? colors.primary.main : theme.card,
              borderColor: selectedPlan === 'annual' ? colors.primary.dark : theme.border,
            },
          ]}
          onPress={() => setSelectedPlan('annual')}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <View>
              <Text style={[styles.planName, { color: selectedPlan === 'annual' ? '#FFFFFF' : theme.textPrimary }]}>
                Anual
              </Text>
              <Text style={[styles.planPrice, { color: selectedPlan === 'annual' ? '#FFFFFF' : theme.textPrimary }]}>
                R$ 59,90<Text style={styles.planPriceSuffix}>/ano</Text>
              </Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-30%</Text>
            </View>
          </View>
          <Text style={[styles.planNote, { color: selectedPlan === 'annual' ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
            R$ 4,99/mês · Melhor valor
          </Text>
        </TouchableOpacity>

        {/* Monthly */}
        <TouchableOpacity
          style={[
            styles.planCard,
            {
              backgroundColor: selectedPlan === 'monthly' ? colors.primary.main : theme.card,
              borderColor: selectedPlan === 'monthly' ? colors.primary.dark : theme.border,
            },
          ]}
          onPress={() => setSelectedPlan('monthly')}
          activeOpacity={0.8}
        >
          <Text style={[styles.planName, { color: selectedPlan === 'monthly' ? '#FFFFFF' : theme.textPrimary }]}>
            Mensal
          </Text>
          <Text style={[styles.planPrice, { color: selectedPlan === 'monthly' ? '#FFFFFF' : theme.textPrimary }]}>
            R$ 8,90<Text style={styles.planPriceSuffix}>/mês</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* CTA */}
      <TouchableOpacity style={[styles.ctaButton, shadows.large]} activeOpacity={0.85}>
        <Ionicons name="rocket" size={20} color="#FFFFFF" />
        <Text style={styles.ctaText}>Começar Agora</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.restoreButton} activeOpacity={0.7}>
        <Text style={[styles.restoreText, { color: theme.textSecondary }]}>Restaurar Compra</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  closeButton: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  hero: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
    gap: spacing.m,
  },
  heroIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.h1,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: '80%',
  },
  benefitsCard: {
    marginHorizontal: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    marginBottom: spacing.l,
    overflow: 'hidden',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    gap: spacing.s,
  },
  benefitIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    ...typography.body,
    flex: 1,
  },
  pricing: {
    paddingHorizontal: spacing.m,
    gap: spacing.s,
    marginBottom: spacing.xl,
  },
  planCard: {
    padding: spacing.m,
    borderWidth: 2,
    borderRadius: borderRadius.m,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  planPrice: {
    ...typography.h3,
    fontWeight: '700',
  },
  planPriceSuffix: {
    ...typography.body,
    fontWeight: '400',
  },
  planNote: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  discountBadge: {
    backgroundColor: `${colors.semantic.success}33`,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.s,
  },
  discountText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.semantic.success,
  },
  ctaButton: {
    flexDirection: 'row',
    marginHorizontal: spacing.m,
    height: 56,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ctaText: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  restoreButton: {
    marginTop: spacing.m,
    padding: spacing.m,
    alignItems: 'center',
  },
  restoreText: { ...typography.caption },
});
