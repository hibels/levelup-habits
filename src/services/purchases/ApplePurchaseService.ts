/**
 * Implementação Apple IAP usando react-native-iap v15 (StoreKit 2 via Nitro).
 *
 * Fluxo de compra:
 *  1. initialize()  → initConnection + registra purchaseUpdatedListener / purchaseErrorListener
 *  2. getProducts() → fetchProducts({ type: 'subs' }) retorna preços reais do App Store
 *  3. purchase()    → requestPurchase() → transação resolvida via purchaseUpdatedListener
 *  4. destroy()     → remove listeners + endConnection
 *
 * Referência Apple:
 *  https://developer.apple.com/documentation/storekit/in-app_purchase
 */
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  ErrorCode,
  type Purchase,
  type PurchaseError,
  type EventSubscription,
} from 'react-native-iap';
import { type PurchaseService, type ProductInfo, type PurchaseResult, PRODUCT_IDS } from './types';

function mapProduct(item: { id: string; title?: string; displayPrice?: string }): ProductInfo {
  const id = item.id;
  let period: ProductInfo['period'] = 'unknown';
  if (id.includes('annual') || id.includes('year')) period = 'annual';
  else if (id.includes('monthly') || id.includes('month')) period = 'monthly';

  return {
    id,
    title: item.title ?? id,
    localizedPrice: item.displayPrice ?? '',
    period,
  };
}

export class ApplePurchaseService implements PurchaseService {
  private purchaseUpdateSub: EventSubscription | null = null;
  private purchaseErrorSub: EventSubscription | null = null;

  /**
   * Callback pendente de uma compra em andamento.
   * `requestPurchase` é assíncrono via eventos (StoreKit 2).
   */
  private pendingResolve: ((result: PurchaseResult) => void) | null = null;

  async initialize(): Promise<void> {
    await initConnection();

    // Transação concluída (compra nova ou restaurada via evento)
    this.purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      // Ignorar transações pendentes (ex: aguardando aprovação parental)
      if (purchase.purchaseState === 'pending') return;

      try {
        await finishTransaction({ purchase, isConsumable: false });

        this.pendingResolve?.({
          success: true,
          transactionId: purchase.id,
          productId: purchase.productId,
        });
      } catch {
        this.pendingResolve?.({
          success: false,
          errorCode: 'unknown',
          errorMessage: 'Erro ao finalizar transação. Entre em contato com o suporte.',
        });
      } finally {
        this.pendingResolve = null;
      }
    });

    // Erro na transação
    this.purchaseErrorSub = purchaseErrorListener((error: PurchaseError) => {
      switch (error.code) {
        case ErrorCode.UserCancelled:
          this.pendingResolve?.({ success: false, errorCode: 'cancelled' });
          break;
        case ErrorCode.NetworkError:
        case ErrorCode.ServiceDisconnected:
        case ErrorCode.ServiceError:
        case ErrorCode.BillingUnavailable:
          this.pendingResolve?.({
            success: false,
            errorCode: 'network',
            errorMessage: 'Loja indisponível. Verifique sua conexão e tente novamente.',
          });
          break;
        case ErrorCode.AlreadyOwned:
          this.pendingResolve?.({ success: false, errorCode: 'already_owned' });
          break;
        default:
          this.pendingResolve?.({
            success: false,
            errorCode: 'unknown',
            errorMessage: error.message,
          });
      }
      this.pendingResolve = null;
    });
  }

  async getProducts(productIds: string[]): Promise<ProductInfo[]> {
    try {
      const result = await fetchProducts({ skus: productIds, type: 'subs' });
      if (!result) return [];

      return (result as Array<{ id: string; title?: string; displayPrice?: string }>)
        .map(mapProduct)
        .sort((a, b) => (a.period === 'annual' ? -1 : 1));
    } catch {
      return [];
    }
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    return new Promise((resolve) => {
      this.pendingResolve = resolve;

      requestPurchase({
        request: {
          apple: {
            sku: productId,
            // false = controlamos o finishTransaction manualmente (evita reembolso automático)
            andDangerouslyFinishTransactionAutomatically: false,
          },
        },
        type: 'subs',
      }).catch((err: Error) => {
        if (!this.pendingResolve) return; // listener já resolveu
        this.pendingResolve = null;
        resolve({ success: false, errorCode: 'unknown', errorMessage: err.message });
      });
    });
  }

  async restorePurchases(): Promise<PurchaseResult> {
    try {
      // onlyIncludeActiveItemsIOS: true filtra assinaturas expiradas no retorno
      const purchases = await getAvailablePurchases({ onlyIncludeActiveItemsIOS: true });
      const premiumIds = Object.values(PRODUCT_IDS) as string[];
      const active = purchases.find((p) => premiumIds.includes(p.productId));

      if (active) {
        return {
          success: true,
          transactionId: active.id,
          productId: active.productId,
        };
      }

      return {
        success: false,
        errorCode: 'not_found',
        errorMessage: 'Nenhuma compra Premium ativa encontrada nesta conta.',
      };
    } catch {
      return {
        success: false,
        errorCode: 'network',
        errorMessage: 'Não foi possível acessar a loja. Verifique sua conexão.',
      };
    }
  }

  destroy(): void {
    this.purchaseUpdateSub?.remove();
    this.purchaseErrorSub?.remove();
    this.purchaseUpdateSub = null;
    this.purchaseErrorSub = null;
    this.pendingResolve = null;
    endConnection();
  }
}
