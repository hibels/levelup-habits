import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getPurchaseService, PRODUCT_IDS, type ProductInfo } from '../services/purchases';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

type PlanType = 'annual' | 'monthly';

interface Benefit {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const BENEFITS: Benefit[] = [
  { icon: 'infinite-outline',  text: 'Hábitos ilimitados'              },
  { icon: 'bar-chart-outline', text: 'Dashboard semanal completo'       },
  { icon: 'journal-outline',   text: 'Retrospectiva semanal ilimitada'  },
  { icon: 'trophy-outline',    text: 'Histórico de streaks completo'     },
];

const PRIVACY_POLICY_URL = 'https://docs.google.com/document/d/SEU_ID_AQUI';
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stpl/en/';

/** Preços de fallback exibidos enquanto a loja carrega ou em caso de erro. */
const FALLBACK_PRICES: Record<PlanType, string> = {
  annual:  'R$ 49,90',
  monthly: 'R$ 9,90',
};

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const { themeMode, setPremium } = useStore();
  const insets = useSafeAreaInsets();

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // ── Inicialização do serviço ──────────────────────────────────

  useEffect(() => {
    const service = getPurchaseService();
    let mounted = true;

    (async () => {
      try {
        await service.initialize();
        if (!mounted) return;

        const fetched = await service.getProducts([PRODUCT_IDS.ANNUAL, PRODUCT_IDS.MONTHLY]);
        if (mounted) setProducts(fetched);
      } catch {
        // Loja indisponível: UI exibe preços de fallback normalmente
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    })();

    return () => {
      mounted = false;
      service.destroy();
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────

  const getPrice = useCallback(
    (plan: PlanType): string => {
      const product = products.find((p) => p.period === plan);
      return product?.localizedPrice ?? FALLBACK_PRICES[plan];
    },
    [products]
  );

  const selectedProductId =
    selectedPlan === 'annual' ? PRODUCT_IDS.ANNUAL : PRODUCT_IDS.MONTHLY;

  // ── Compra ────────────────────────────────────────────────────

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const result = await getPurchaseService().purchase(selectedProductId);

      if (result.success) {
        await setPremium(true);
        navigation.goBack();
        // Pequeno delay para o modal fechar antes do Alert aparecer
        setTimeout(() => {
          Alert.alert('Bem-vindo ao Premium!', 'Seus hábitos agora são ilimitados. 🚀');
        }, 400);
      } else if (result.errorCode !== 'cancelled') {
        Alert.alert(
          'Erro na compra',
          result.errorMessage ?? 'Tente novamente em instantes.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // ── Restaurar ─────────────────────────────────────────────────

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const result = await getPurchaseService().restorePurchases();

      if (result.success) {
        await setPremium(true);
        navigation.goBack();
        setTimeout(() => {
          Alert.alert('Compra restaurada!', 'Seu acesso Premium foi reativado. 🎉');
        }, 400);
      } else {
        Alert.alert(
          'Sem compras encontradas',
          result.errorMessage ?? 'Nenhuma assinatura Premium ativa nesta conta.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsRestoring(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────

  const isProcessing = isPurchasing || isRestoring;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
    >
      {/* Fechar */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + spacing.s }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        <Ionicons name="close" size={22} color={theme.textSecondary} />
      </TouchableOpacity>

      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.xxxl }]}>
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

      {/* Benefícios */}
      <View style={[styles.benefitsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {BENEFITS.map((benefit, index) => (
          <View
            key={index}
            style={[
              styles.benefitRow,
              index < BENEFITS.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              },
            ]}
          >
            <View style={[styles.benefitIconBg, { backgroundColor: `${colors.primary.main}15` }]}>
              <Ionicons name={benefit.icon} size={18} color={colors.primary.main} />
            </View>
            <Text style={[styles.benefitText, { color: theme.textPrimary }]}>{benefit.text}</Text>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary.main} />
          </View>
        ))}
      </View>

      {/* Planos */}
      <View style={styles.pricing}>
        <PlanCard
          plan="annual"
          price={getPrice('annual')}
          note="R$ 4,16/mês · Melhor valor"
          discountLabel="-30%"
          selected={selectedPlan === 'annual'}
          loading={loadingProducts}
          isDarkMode={isDarkMode}
          onSelect={() => setSelectedPlan('annual')}
        />
        <PlanCard
          plan="monthly"
          price={getPrice('monthly')}
          selected={selectedPlan === 'monthly'}
          loading={loadingProducts}
          isDarkMode={isDarkMode}
          onSelect={() => setSelectedPlan('monthly')}
        />
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaButton, shadows.large, isProcessing && styles.ctaDisabled]}
        onPress={handlePurchase}
        activeOpacity={0.85}
        disabled={isProcessing}
      >
        {isPurchasing ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="rocket" size={20} color="#FFFFFF" />
            <Text style={styles.ctaText}>Começar Agora</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Restaurar */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        {isRestoring ? (
          <ActivityIndicator color={theme.textSecondary} size="small" />
        ) : (
          <Text style={[styles.restoreText, { color: theme.textSecondary }]}>
            Restaurar Compra
          </Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.legalText, { color: theme.disabled }]}>
        A assinatura é renovada automaticamente. Cancele a qualquer momento no App Store.
        {' '}Ao assinar, você concorda com nossos{' '}
        <Text style={styles.legalLink} onPress={() => Linking.openURL(TERMS_URL)}>
          Termos de Uso
        </Text>
        {' '}e nossa{' '}
        <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
          Política de Privacidade
        </Text>
        .
      </Text>
    </ScrollView>
  );
};

// ── PlanCard ──────────────────────────────────────────────────

interface PlanCardProps {
  plan: PlanType;
  price: string;
  note?: string;
  discountLabel?: string;
  selected: boolean;
  loading: boolean;
  isDarkMode: boolean;
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  price,
  note,
  discountLabel,
  selected,
  loading,
  isDarkMode,
  onSelect,
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const label = plan === 'annual' ? 'Anual' : 'Mensal';
  const suffix = plan === 'annual' ? '/ano' : '/mês';

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        {
          backgroundColor: selected ? colors.primary.main : theme.card,
          borderColor: selected ? colors.primary.dark : theme.border,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.planHeader}>
        <View>
          <Text style={[styles.planName, { color: selected ? '#FFFFFF' : theme.textPrimary }]}>
            {label}
          </Text>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={selected ? 'rgba(255,255,255,0.7)' : colors.primary.main}
              style={{ marginTop: 6 }}
            />
          ) : (
            <Text style={[styles.planPrice, { color: selected ? '#FFFFFF' : theme.textPrimary }]}>
              {price}
              <Text style={[styles.planPriceSuffix, { color: selected ? 'rgba(255,255,255,0.75)' : theme.textSecondary }]}>
                {suffix}
              </Text>
            </Text>
          )}
        </View>

        {discountLabel && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountLabel}</Text>
          </View>
        )}
      </View>

      {note && (
        <Text style={[styles.planNote, { color: selected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
          {note}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },

  closeButton: {
    position: 'absolute',
    right: spacing.m,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  hero: {
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
  ctaDisabled: {
    opacity: 0.7,
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
    minHeight: 44,
    justifyContent: 'center',
  },
  restoreText: { ...typography.caption },

  legalText: {
    ...typography.caption,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xs,
    fontSize: 10,
    lineHeight: 16,
  },
  legalLink: {
    textDecorationLine: 'underline',
    fontSize: 10,
  },
});
