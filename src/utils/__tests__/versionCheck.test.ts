import {
  compareVersions,
  checkForUpdate,
  shouldShowCriticalModal,
  incrementCriticalModalCount,
  markBannerShownInSession,
  markCriticalModalShownInSession,
  isBannerShownInSession,
  isCriticalModalShownInSession,
  MAX_CRITICAL_MODAL_SESSIONS,
  _resetSessionState,
} from '../versionCheck';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

jest.mock('expo-constants', () => ({
  expoConfig: { version: '1.2.3' },
  appOwnership: null,
}));

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const ITUNES_RESPONSE = (version: string, trackId = 123456) =>
  Promise.resolve({
    json: () => Promise.resolve({ results: [{ version, trackId }] }),
  });

// ─── compareVersions ─────────────────────────────────────────────────────────

describe('compareVersions', () => {
  it('returns none when versions are equal', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe('none');
  });

  it('returns soft for patch bump', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBe('soft');
  });

  it('returns soft for minor bump', () => {
    expect(compareVersions('1.0.0', '1.1.0')).toBe('soft');
  });

  it('returns critical for major bump', () => {
    expect(compareVersions('1.5.3', '2.0.0')).toBe('critical');
  });

  it('returns none when installed is newer', () => {
    expect(compareVersions('2.0.0', '1.9.9')).toBe('none');
  });

  it('handles versions with only major component', () => {
    expect(compareVersions('1', '2')).toBe('critical');
    expect(compareVersions('1', '1')).toBe('none');
  });
});

// ─── checkForUpdate ──────────────────────────────────────────────────────────

describe('checkForUpdate', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
    mockFetch.mockReset();
    _resetSessionState();
  });

  it('returns null without hitting network when debounce window is active', async () => {
    // Simulate a check done 10 minutes ago (within 1-hour debounce)
    mockGetItem.mockResolvedValue(String(Date.now() - 10 * 60 * 1000));
    const result = await checkForUpdate();
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns null when iTunes API returns no results', async () => {
    mockGetItem.mockResolvedValue(null); // no previous check
    mockSetItem.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [] }),
    });
    const result = await checkForUpdate();
    expect(result).toBeNull();
  });

  it('returns null when versions are equal', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    // installed version is '1.2.3' (from Constants mock)
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [{ version: '1.2.3', trackId: 999 }] }),
    });
    const result = await checkForUpdate();
    expect(result).toBeNull();
  });

  it('returns soft UpdateInfo for a minor bump', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [{ version: '1.3.0', trackId: 42 }] }),
    });
    const result = await checkForUpdate();
    expect(result).not.toBeNull();
    expect(result?.type).toBe('soft');
    expect(result?.availableVersion).toBe('1.3.0');
    expect(result?.storeUrl).toContain('42');
  });

  it('returns critical UpdateInfo for a major bump', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [{ version: '2.0.0', trackId: 99 }] }),
    });
    const result = await checkForUpdate();
    expect(result).not.toBeNull();
    expect(result?.type).toBe('critical');
  });

  it('returns null when fetch throws (network error)', async () => {
    mockGetItem.mockResolvedValue(null);
    mockFetch.mockRejectedValue(new Error('network error'));
    const result = await checkForUpdate();
    expect(result).toBeNull();
  });

  it('saves the check timestamp to AsyncStorage', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ results: [{ version: '1.3.0', trackId: 1 }] }),
    });
    await checkForUpdate();
    expect(mockSetItem).toHaveBeenCalledWith(
      '@levelup:lastVersionCheckAt',
      expect.any(String),
    );
  });
});

// ─── Session state ───────────────────────────────────────────────────────────

describe('session state', () => {
  beforeEach(() => {
    _resetSessionState();
  });

  it('banner not shown by default', () => {
    expect(isBannerShownInSession()).toBe(false);
  });

  it('marks banner as shown', () => {
    markBannerShownInSession();
    expect(isBannerShownInSession()).toBe(true);
  });

  it('critical modal not shown by default', () => {
    expect(isCriticalModalShownInSession()).toBe(false);
  });

  it('marks critical modal as shown', () => {
    markCriticalModalShownInSession();
    expect(isCriticalModalShownInSession()).toBe(true);
  });

  it('_resetSessionState clears both flags', () => {
    markBannerShownInSession();
    markCriticalModalShownInSession();
    _resetSessionState();
    expect(isBannerShownInSession()).toBe(false);
    expect(isCriticalModalShownInSession()).toBe(false);
  });
});

// ─── shouldShowCriticalModal ─────────────────────────────────────────────────

describe('shouldShowCriticalModal', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    _resetSessionState();
  });

  it('returns true when count is 0', async () => {
    mockGetItem.mockResolvedValue(null);
    expect(await shouldShowCriticalModal()).toBe(true);
  });

  it(`returns true when count is below ${MAX_CRITICAL_MODAL_SESSIONS}`, async () => {
    mockGetItem.mockResolvedValue(String(MAX_CRITICAL_MODAL_SESSIONS - 1));
    expect(await shouldShowCriticalModal()).toBe(true);
  });

  it(`returns false when count reaches ${MAX_CRITICAL_MODAL_SESSIONS}`, async () => {
    mockGetItem.mockResolvedValue(String(MAX_CRITICAL_MODAL_SESSIONS));
    expect(await shouldShowCriticalModal()).toBe(false);
  });

  it('returns false when already shown in this session', async () => {
    mockGetItem.mockResolvedValue('0');
    markCriticalModalShownInSession();
    expect(await shouldShowCriticalModal()).toBe(false);
    // storage should not even be read
    expect(mockGetItem).not.toHaveBeenCalled();
  });

  it('returns true when storage throws', async () => {
    mockGetItem.mockRejectedValue(new Error('storage error'));
    expect(await shouldShowCriticalModal()).toBe(true);
  });
});

// ─── incrementCriticalModalCount ─────────────────────────────────────────────

describe('incrementCriticalModalCount', () => {
  beforeEach(() => {
    mockGetItem.mockReset();
    mockSetItem.mockReset();
  });

  it('sets count to 1 when no previous value exists', async () => {
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    await incrementCriticalModalCount();
    expect(mockSetItem).toHaveBeenCalledWith(
      '@levelup:criticalUpdateShownCount',
      '1',
    );
  });

  it('increments existing count', async () => {
    mockGetItem.mockResolvedValue('2');
    mockSetItem.mockResolvedValue(undefined);
    await incrementCriticalModalCount();
    expect(mockSetItem).toHaveBeenCalledWith(
      '@levelup:criticalUpdateShownCount',
      '3',
    );
  });

  it('does not throw when storage fails', async () => {
    mockGetItem.mockRejectedValue(new Error('fail'));
    await expect(incrementCriticalModalCount()).resolves.toBeUndefined();
  });
});
