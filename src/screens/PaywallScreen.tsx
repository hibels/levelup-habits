import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const BENEFITS = [
  '✅ Hábitos ilimitados',
  '✅ Estatísticas avançadas',
  '✅ Temas personalizados',
  '✅ Backup em nuvem',
  '✅ Sem anúncios',
];

type PlanType = 'annual' | 'monthly';

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const { themeMode } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  
  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  const handlePurchase = () => {
    // TODO: Integrar com sistema de pagamento real
    alert('Funcionalidade de pagamento será implementada em breve!');
  };

  const handleRestore = () => {
    // TODO: Restaurar compras
    alert('Nenhuma compra anterior encontrada');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={[styles.closeText, { color: theme.textPrimary }]}>✕</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>💎</Text>
        <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
          Desbloqueie Todo o{'\n'}Seu Potencial
        </Text>
      </View>

      {/* Benefits */}
      <View style={styles.benefits}>
        {BENEFITS.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <Text style={[styles.benefitText, { color: theme.textPrimary }]}>{benefit}</Text>
          </View>
        ))}
      </View>

      {/* Pricing */}
      <View style={styles.pricing}>
        {/* Annual Plan */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'annual' && styles.planCardSelected,
            {
              backgroundColor: selectedPlan === 'annual'
                ? colors.primary.main
                : theme.card,
              borderColor: selectedPlan === 'annual'
                ? colors.primary.dark
                : theme.border,
            },
          ]}
          onPress={() => setSelectedPlan('annual')}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <Text
              style={[
                styles.planName,
                { color: selectedPlan === 'annual' ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              💎 Anual
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Economize 30%</Text>
            </View>
          </View>
          <Text
            style={[
              styles.planPrice,
              { color: selectedPlan === 'annual' ? '#FFFFFF' : theme.textPrimary },
            ]}
          >
            R$ 59,90/ano
          </Text>
        </TouchableOpacity>

        {/* Monthly Plan */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
            {
              backgroundColor: selectedPlan === 'monthly'
                ? colors.primary.main
                : theme.card,
              borderColor: selectedPlan === 'monthly'
                ? colors.primary.dark
                : theme.border,
            },
          ]}
          onPress={() => setSelectedPlan('monthly')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.planName,
              { color: selectedPlan === 'monthly' ? '#FFFFFF' : theme.textPrimary },
            ]}
          >
            Mensal
          </Text>
          <Text
            style={[
              styles.planPrice,
              { color: selectedPlan === 'monthly' ? '#FFFFFF' : theme.textPrimary },
            ]}
          >
            R$ 8,90/mês
          </Text>
        </TouchableOpacity>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaButton, shadows.large]}
        onPress={handlePurchase}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaText}>Começar Agora</Text>
      </TouchableOpacity>

      {/* Restore */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        activeOpacity={0.7}
      >
        <Text style={[styles.restoreText, { color: theme.textSecondary }]}>
          Restaurar Compra
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
  },
  hero: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 96,
    marginBottom: spacing.l,
  },
  heroTitle: {
    ...typography.h1,
    textAlign: 'center',
    maxWidth: '80%',
  },
  benefits: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  benefitRow: {
    marginBottom: spacing.m,
  },
  benefitText: {
    ...typography.bodyLarge,
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
  planCardSelected: {
    // Estilo aplicado via backgroundColor dinâmico
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  planName: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  planPrice: {
    ...typography.h3,
    fontWeight: '700',
  },
  discountBadge: {
    backgroundColor: `${colors.semantic.success}33`,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.s,
  },
  discountText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.semantic.success,
  },
  ctaButton: {
    marginHorizontal: spacing.m,
    height: 56,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
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
  restoreText: {
    ...typography.caption,
  },
});
