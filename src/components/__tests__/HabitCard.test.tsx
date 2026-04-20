import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { HabitCard } from '../HabitCard';
import { Habit } from '../../types';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const TODAY = '2026-04-20';

jest.mock('../../utils/dates', () => ({
  getTodayString: () => TODAY,
  getCurrentWeekDates: () => [
    '2026-04-14',
    '2026-04-15',
    '2026-04-16',
    '2026-04-17',
    '2026-04-18',
    '2026-04-19',
    '2026-04-20',
  ],
  WEEKDAY_LABELS: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
}));

const mockCheckHabit = jest.fn();
const mockUncheckHabit = jest.fn();

jest.mock('../../store', () => ({
  useStore: (selector: any) =>
    selector({
      checkHabit: mockCheckHabit,
      uncheckHabit: mockUncheckHabit,
    }),
}));

const baseHabit: Habit = {
  id: 'habit-1',
  name: 'Exercitar',
  emoji: '🏋️',
  weeklyGoal: 3,
  createdAt: '2026-04-01T00:00:00.000Z',
  streak: 2,
  lastStreakWeekKey: '2026-W16',
  completedDates: [],
};

const makeProps = (habitOverrides?: Partial<Habit>) => ({
  habit: { ...baseHabit, ...habitOverrides },
  isDarkMode: false,
  onCheckComplete: jest.fn(),
  onLongPress: jest.fn(),
});

describe('HabitCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders habit name and emoji', () => {
    const { getByText } = render(<HabitCard {...makeProps()} />);
    expect(getByText('Exercitar')).toBeTruthy();
    expect(getByText('🏋️')).toBeTruthy();
  });

  it('renders streak badge when streak > 0', () => {
    const { getByText } = render(<HabitCard {...makeProps()} />);
    expect(getByText('2')).toBeTruthy();
  });

  it('does not render streak badge when streak is 0', () => {
    const { queryByText } = render(<HabitCard {...makeProps({ streak: 0 })} />);
    expect(queryByText('0')).toBeNull();
  });

  it('shows locked banner when isLocked', () => {
    const { getByText } = render(
      <HabitCard {...makeProps()} isLocked={true} />
    );
    expect(getByText('Reative o Premium para continuar usando este hábito')).toBeTruthy();
  });

  it('renders progress label correctly', () => {
    const habit = { ...baseHabit, completedDates: ['2026-04-14', '2026-04-15'], weeklyGoal: 3 };
    const { getByText } = render(<HabitCard {...makeProps(habit)} />);
    expect(getByText('2/3')).toBeTruthy();
  });

  it('renders goal-reached state when completions >= weeklyGoal', () => {
    const habit = {
      ...baseHabit,
      completedDates: ['2026-04-14', '2026-04-15', '2026-04-16'],
      weeklyGoal: 3,
    };
    const { getByText } = render(<HabitCard {...makeProps(habit)} />);
    expect(getByText('3/3')).toBeTruthy();
  });

  it('calls checkHabit and onCheckComplete when today checkbox is pressed', async () => {
    const checkResult = {
      xpGained: 10,
      newLevel: null,
      newStreak: 2,
      weekGoalReached: false,
    };
    mockCheckHabit.mockResolvedValueOnce(checkResult);
    const props = makeProps();

    const { getByTestId } = render(<HabitCard {...props} />);
    const todayBtn = getByTestId('today-checkbox');

    await act(async () => {
      fireEvent.press(todayBtn);
    });

    expect(mockCheckHabit).toHaveBeenCalledWith('habit-1');
    expect(props.onCheckComplete).toHaveBeenCalledWith(
      10, null, 2, false, 'Exercitar', '🏋️'
    );
  });

  it('calls uncheckHabit when today is already completed', async () => {
    mockUncheckHabit.mockResolvedValueOnce(undefined);
    const habit = { ...baseHabit, completedDates: [TODAY] };
    const props = makeProps(habit);

    const { getByTestId } = render(<HabitCard {...props} />);
    const todayBtn = getByTestId('today-checkbox');

    await act(async () => {
      fireEvent.press(todayBtn);
    });

    expect(mockUncheckHabit).toHaveBeenCalledWith('habit-1');
    expect(props.onCheckComplete).not.toHaveBeenCalled();
  });

  it('does not call checkHabit when isLocked', async () => {
    const props = { ...makeProps(), isLocked: true };

    const { getByTestId } = render(<HabitCard {...props} />);
    const todayBtn = getByTestId('today-checkbox');

    await act(async () => {
      fireEvent.press(todayBtn);
    });

    expect(mockCheckHabit).not.toHaveBeenCalled();
  });

  it('renders the +10 XP popup text node', () => {
    const { getByText } = render(<HabitCard {...makeProps()} />);
    expect(getByText('+10 XP')).toBeTruthy();
  });

  it('does not call checkHabit when not pressing today', () => {
    render(<HabitCard {...makeProps()} />);
    expect(mockCheckHabit).not.toHaveBeenCalled();
  });

  it('triggers animations on check (no errors)', async () => {
    const checkResult = {
      xpGained: 10,
      newLevel: null,
      newStreak: 1,
      weekGoalReached: false,
    };
    mockCheckHabit.mockResolvedValueOnce(checkResult);
    const props = makeProps();

    const { getByTestId } = render(<HabitCard {...props} />);
    await expect(
      act(async () => { fireEvent.press(getByTestId('today-checkbox')); })
    ).resolves.not.toThrow();
  });
});
