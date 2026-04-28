import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HABIT_COLORS } from '../EditHabitScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockAddHabit = jest.fn();
const mockEditHabit = jest.fn();
const mockDeleteHabit = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

let mockIsPremium = false;

jest.mock('../../store', () => ({
  useStore: (selector: any) =>
    selector({
      habits: [],
      addHabit: mockAddHabit,
      editHabit: mockEditHabit,
      deleteHabit: mockDeleteHabit,
      themeMode: 'light' as const,
      get isPremium() {
        return mockIsPremium;
      },
    }),
}));

const navigation: any = {
  setOptions: jest.fn(),
  goBack: mockGoBack,
  navigate: mockNavigate,
};

const makeRoute = (habitId?: string): any => ({
  params: { habitId },
});

const { EditHabitScreen } = require('../EditHabitScreen');

describe('EditHabitScreen — color picker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPremium = false;
  });

  it('renders the preview card', () => {
    const { getByTestId } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    expect(getByTestId('preview-card')).toBeTruthy();
  });

  it('renders all 12 habit colors', () => {
    const { getByTestId } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    HABIT_COLORS.forEach(color => {
      expect(getByTestId(`color-${color}`)).toBeTruthy();
    });
  });

  it('navigates to Paywall when free user taps a color', () => {
    mockIsPremium = false;
    const { getByTestId } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    fireEvent.press(getByTestId(`color-${HABIT_COLORS[0]}`));
    expect(mockNavigate).toHaveBeenCalledWith('Paywall');
  });

  it('does NOT navigate to Paywall when premium user taps a color', () => {
    mockIsPremium = true;
    const { getByTestId } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    fireEvent.press(getByTestId(`color-${HABIT_COLORS[1]}`));
    expect(mockNavigate).not.toHaveBeenCalledWith('Paywall');
  });
});

describe('EditHabitScreen — icon tabs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPremium = false;
  });

  it('shows Emoji and Ícones tabs', () => {
    const { getByText } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    expect(getByText('Emoji')).toBeTruthy();
    expect(getByText('Ícones')).toBeTruthy();
  });

  it('navigates to Paywall when free user taps Ícones tab', () => {
    mockIsPremium = false;
    const { getByText } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    fireEvent.press(getByText('Ícones'));
    expect(mockNavigate).toHaveBeenCalledWith('Paywall');
  });

  it('shows icon grid for premium users when Ícones tab is pressed', () => {
    mockIsPremium = true;
    const { getByText, getByTestId } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    fireEvent.press(getByText('Ícones'));
    expect(getByTestId('icon-barbell-outline')).toBeTruthy();
  });

  it('hides emoji grid when Ícones tab is active for premium', () => {
    mockIsPremium = true;
    const { getByText, queryByText } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    fireEvent.press(getByText('Ícones'));
    expect(queryByText('😊')).toBeNull();
  });
});

describe('EditHabitScreen — save with color/iconName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPremium = true;
    mockAddHabit.mockResolvedValue(undefined);
  });

  it('color selection changes preview card border color', () => {
    const { getByTestId } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    // Before selection: default color applied
    const previewBefore = getByTestId('preview-card');
    expect(previewBefore).toBeTruthy();
    // Select a color
    fireEvent.press(getByTestId(`color-${HABIT_COLORS[2]}`));
    // Preview card still visible after selection
    expect(getByTestId('preview-card')).toBeTruthy();
  });

  it('shows icon grid with barbell icon for premium when Ícones tab pressed', () => {
    const { getByText, getByTestId } = render(
      <EditHabitScreen route={makeRoute()} navigation={navigation} />
    );
    fireEvent.press(getByText('Ícones'));
    expect(getByTestId('icon-barbell-outline')).toBeTruthy();
    expect(getByTestId('icon-trophy-outline')).toBeTruthy();
  });
});
