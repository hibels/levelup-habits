/**
 * Implementação simulada para desenvolvimento e como placeholder para Android.
 *
 * - Retorna produtos com preços hardcoded (usados enquanto a loja não responde)
 * - Simula um delay de 800ms no purchaseProduct para parecer real
 * - `purchase()` sempre retorna sucesso (útil para testar o fluxo de UI)
 * - Quando implementar Google Play: criar `AndroidPurchaseService` seguindo
 *   a mesma interface e registrá-la no factory em `index.ts`
 */
import { PurchaseService, ProductInfo, PurchaseResult, PRODUCT_IDS } from './types';

const MOCK_PRODUCTS: ProductInfo[] = [
  {
    id: PRODUCT_IDS.ANNUAL,
    title: 'Anual',
    localizedPrice: 'R$ 49,90',
    period: 'annual',
  },
  {
    id: PRODUCT_IDS.MONTHLY,
    title: 'Mensal',
    localizedPrice: 'R$ 9,90',
    period: 'monthly',
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockPurchaseService implements PurchaseService {
  async initialize(): Promise<void> {
    // Sem setup necessário
  }

  async getProducts(_productIds: string[]): Promise<ProductInfo[]> {
    await delay(600);
    return MOCK_PRODUCTS;
  }

  async purchase(_productId: string): Promise<PurchaseResult> {
    await delay(800);
    return {
      success: true,
      transactionId: `mock_${Date.now()}`,
      productId: _productId,
    };
  }

  async restorePurchases(): Promise<PurchaseResult> {
    await delay(600);
    return {
      success: false,
      errorCode: 'not_found',
      errorMessage: 'Nenhuma compra encontrada.',
    };
  }

  destroy(): void {
    // Nada a limpar
  }
}
