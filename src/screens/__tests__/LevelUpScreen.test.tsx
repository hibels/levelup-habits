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
  });

  it('renders level number and title', () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(3, 300)} />);
    expect(getByText('3')).toBeTruthy();
    expect(getByText('Dedicado')).toBeTruthy();
  });

  it('renders LEVEL UP! label', () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(1, 0)} />);
    expect(getByText('LEVEL UP!')).toBeTruthy();
  });

  it('renders total XP', () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(2, 150)} />);
    expect(getByText(/150/)).toBeTruthy();
  });

  it('renders correct tagline for each level', () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(10, 5000)} />);
    expect(getByText('Você transcendeu. Imortal.')).toBeTruthy();
    expect(getByText('Imortal')).toBeTruthy();
  });

  it('navigates back when Continuar is pressed', () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(2, 100)} />);
    fireEvent.press(getByText('Continuar'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('calls Share.share when Compartilhar is pressed', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
    const { getByText } = render(<LevelUpScreen {...makeProps(5, 1000)} />);
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
    await expect(
      act(async () => { fireEvent.press(getByText('Compartilhar')); })
    ).resolves.not.toThrow();
  });

  it('renders fallback icon for unknown level', () => {
    const { getByText } = render(<LevelUpScreen {...makeProps(99, 9999)} />);
    expect(getByText('LEVEL UP!')).toBeTruthy();
  });
});
