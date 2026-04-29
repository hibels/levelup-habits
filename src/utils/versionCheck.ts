import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BUNDLE_ID = 'com.hibels.leveluphabits';
const ITUNES_LOOKUP_URL = `https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}`;

const VERSION_CHECK_KEY = '@levelup:lastVersionCheckAt';
const CRITICAL_MODAL_COUNT_KEY = '@levelup:criticalUpdateShownCount';
const DEBOUNCE_MS = 60 * 60 * 1000; // 1 hour

export const MAX_CRITICAL_MODAL_SESSIONS = 3;

export type UpdateType = 'none' | 'soft' | 'critical';

export interface UpdateInfo {
  type: UpdateType;
  availableVersion: string;
  storeUrl: string;
}

export function isDevEnvironment(): boolean {
  if (__DEV__) return true;
  // Expo Go (storeClient = Expo Go in SDK 50+)
  const ownership = (Constants as unknown as Record<string, unknown>).appOwnership;
  return ownership === 'expo';
}

export function compareVersions(installed: string, available: string): UpdateType {
  const parse = (v: string) => v.split('.').map(n => parseInt(n, 10) || 0);
  const [iMaj, iMin, iPatch] = parse(installed);
  const [aMaj, aMin, aPatch] = parse(available);

  if (aMaj > iMaj) return 'critical';
  if (aMaj === iMaj && aMin > iMin) return 'soft';
  if (aMaj === iMaj && aMin === iMin && aPatch > iPatch) return 'soft';
  return 'none';
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  if (isDevEnvironment()) return null;

  const installedVersion = Constants.expoConfig?.version;
  if (!installedVersion) return null;

  try {
    const lastCheck = await AsyncStorage.getItem(VERSION_CHECK_KEY);
    if (lastCheck && Date.now() - parseInt(lastCheck, 10) < DEBOUNCE_MS) {
      return null;
    }
  } catch {
    // continue despite storage error
  }

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(ITUNES_LOOKUP_URL, { signal: controller.signal });
    clearTimeout(tid);

    await AsyncStorage.setItem(VERSION_CHECK_KEY, String(Date.now())).catch(() => null);

    const data = (await res.json()) as {
      results?: { version: string; trackId: number }[];
    };
    if (!data.results?.length) return null;

    const { version: availableVersion, trackId } = data.results[0];
    const updateType = compareVersions(installedVersion, availableVersion);
    if (updateType === 'none') return null;

    return {
      type: updateType,
      availableVersion,
      storeUrl: `itms-apps://itunes.apple.com/app/id${trackId}`,
    };
  } catch {
    return null;
  }
}

// In-memory session flags — reset on every cold start
let _bannerShownInSession = false;
let _criticalModalShownInSession = false;

export function isBannerShownInSession(): boolean {
  return _bannerShownInSession;
}

export function markBannerShownInSession(): void {
  _bannerShownInSession = true;
}

export function isCriticalModalShownInSession(): boolean {
  return _criticalModalShownInSession;
}

export function markCriticalModalShownInSession(): void {
  _criticalModalShownInSession = true;
}

export async function shouldShowCriticalModal(): Promise<boolean> {
  if (_criticalModalShownInSession) return false;
  try {
    const val = await AsyncStorage.getItem(CRITICAL_MODAL_COUNT_KEY);
    const count = val ? parseInt(val, 10) : 0;
    return count < MAX_CRITICAL_MODAL_SESSIONS;
  } catch {
    return true;
  }
}

export async function incrementCriticalModalCount(): Promise<void> {
  try {
    const val = await AsyncStorage.getItem(CRITICAL_MODAL_COUNT_KEY);
    const count = val ? parseInt(val, 10) : 0;
    await AsyncStorage.setItem(CRITICAL_MODAL_COUNT_KEY, String(count + 1));
  } catch {
    // ignore storage errors
  }
}

export function _resetSessionState(): void {
  _bannerShownInSession = false;
  _criticalModalShownInSession = false;
}
