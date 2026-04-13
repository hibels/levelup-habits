/**
 * Factory que retorna a implementação correta de PurchaseService por plataforma.
 *
 * Singletons são usados porque os listeners de compra (StoreKit) devem
 * existir por toda a vida do app — não criar/destruir a cada abertura do paywall.
 * O `destroy()` é chamado só no unmount do paywall para limpar o listener.
 * Na próxima abertura, `initialize()` reconecta.
 */
import { Platform } from 'react-native';
import { PurchaseService } from './types';

// Re-export tipos públicos para quem importa do módulo
export * from './types';

let instance: PurchaseService | null = null;

export function getPurchaseService(): PurchaseService {
  if (instance) return instance;

  if (Platform.OS === 'ios') {
    // Importação lazy para evitar erro de módulo nativo em dev web/Android
    const { ApplePurchaseService } = require('./ApplePurchaseService');
    instance = new ApplePurchaseService();
  } else {
    // Android: MockPurchaseService como placeholder
    // Quando implementar Google Play Billing, trocar por AndroidPurchaseService
    const { MockPurchaseService } = require('./MockPurchaseService');
    instance = new MockPurchaseService();
  }

  return instance!;
}

/** Limpa o singleton (útil em testes). */
export function resetPurchaseService(): void {
  instance = null;
}
