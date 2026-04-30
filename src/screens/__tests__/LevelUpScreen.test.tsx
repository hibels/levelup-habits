import React from 'react';
import { Share } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { LevelUpScreen } from '../LevelUpScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockGoBack = jest.fn();
const makeProps = (level: number, totalXP: number) =>
  ({
    navigation: { goBack: mockGoBack } as any,
    route: { params: { level, totalXP } } as any,
  }) as any;

describe('LevelUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders level number and title', async () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(3, 300)} />);
    await act(() => { jest.runAllTimers(); });
    expect(getByText('3')).toBeTruthy();
    expect(getByText('Dedicado')).toBeTruthy();
  });

  it('renders LEVEL UP! label', async () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(1, 0)} />);
    await act(() => { jest.runAllTimers(); });
    expect(getByText('LEVEL UP!')).toBeTruthy();
  });

  it('renders total XP', async () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(2, 150)} />);
    await act(() => { jest.runAllTimers(); });
    expect(getByText(/150/)).toBeTruthy();
  });

  it('renders correct tagline for each level', async () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(10, 5000)} />);
    await act(() => { jest.runAllTimers(); });
    expect(getByText('Você transcendeu. Imortal.')).toBeTruthy();
    expect(getByText('Imortal')).toBeTruthy();
  });

  it('navigates back when Continuar is pressed', async () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(2, 100)} />);
    await act(() => { jest.runAllTimers(); });
    fireEvent.press(getByText('Continuar'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('calls Share.share when Compartilhar is pressed', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
    const { getByText } = render(<LevelUpScreen {...makeProps(5, 1000)} />);
    await act(() => { jest.runAllTimers(); });
    fireEvent.press(getByText('Compartilhar'));
    await act(async () => {});
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('5') })
    );
    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Determinado') })
    );
  });

  it('does not crash if Share.share rejects', async () => {
    jest.spyOn(Share, 'share').mockRejectedValue(new Error('cancelled'));
    const { getByText } = render(<LevelUpScreen {...makeProps(1, 10)} />);
    await act(() => { jest.runAllTimers(); });
    await expect(
      act(async () => { fireEvent.press(getByText('Compartilhar')); })
    ).resolves.not.toThrow();
  });

  it('renders fallback icon for unknown level', async () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(99, 9999)} />);
    await act(() => { jest.runAllTimers(); });
    expect(getByText('LEVEL UP!')).toBeTruthy();
  });
});
