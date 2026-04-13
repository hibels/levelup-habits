/**
 * IDs dos produtos configurados no App Store Connect (e futuramente Google Play).
 * Convenção: {bundleId}.premium.{periodo}
 * Substitua pelo bundle ID real do app ao configurar no App Store Connect.
 */
export const PRODUCT_IDS = {
  ANNUAL: 'com.hibels.leveluphabits.premium.annual',
  MONTHLY: 'com.hibels.leveluphabits.premium.monthly',
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

// ── Produto ───────────────────────────────────────────────────

export interface ProductInfo {
  id: string;
  /** Título localizado vindo da loja. */
  title: string;
  /** Preço já formatado pela loja (ex: "R$ 59,90"). */
  localizedPrice: string;
  /** Período do plano, inferido do productId ou metadata. */
  period: 'annual' | 'monthly' | 'unknown';
}

// ── Resultado de compra ───────────────────────────────────────

export type PurchaseErrorCode =
  | 'cancelled'     // usuário cancelou o diálogo
  | 'network'       // erro de rede / loja indisponível
  | 'not_found'     // produto não encontrado / sem compra ativa
  | 'already_owned' // assinatura já ativa
  | 'unknown';

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  errorCode?: PurchaseErrorCode;
  errorMessage?: string;
}

// ── Interface abstrata ────────────────────────────────────────

/**
 * Contrato que toda implementação de pagamento deve seguir.
 * O PaywallScreen só conhece essa interface, nunca as implementações concretas.
 *
 * Implementações:
 *  - ApplePurchaseService  → StoreKit via react-native-iap (iOS)
 *  - MockPurchaseService   → simulação para dev / Android (futuro)
 */
export interface PurchaseService {
  /**
   * Inicializa a conexão com a loja e registra os listeners de transação.
   * Deve ser chamado ao montar a tela de paywall.
   */
  initialize(): Promise<void>;

  /**
   * Busca os produtos (preços reais) diretamente da loja.
   * Retorna array vazio se a loja estiver indisponível.
   */
  getProducts(productIds: string[]): Promise<ProductInfo[]>;

  /**
   * Abre o diálogo de compra nativo e aguarda a resposta.
   * Resolve com `success: true` após a transação ser finalizada.
   */
  purchase(productId: string): Promise<PurchaseResult>;

  /**
   * Restaura compras anteriores do usuário (exigido pela Apple).
   * Resolve com `success: true` se encontrar uma assinatura ativa.
   */
  restorePurchases(): Promise<PurchaseResult>;

  /**
   * Libera a conexão com a loja e remove os listeners.
   * Deve ser chamado no cleanup do useEffect.
   */
  destroy(): void;
}
