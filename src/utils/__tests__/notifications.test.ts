import { STREAK_MILESTONES } from '../notifications';
import { ptBR } from '../../i18n/pt-BR';
import { enUS } from '../../i18n/en-US';

const mockSchedule = jest.fn().mockResolvedValue('mock-id');
const mockCancelAll = jest.fn().mockResolvedValue(undefined);
const mockCancelOne = jest.fn().mockResolvedValue(undefined);
const mockGetAll = jest.fn().mockResolvedValue([]);
const mockRequestPermissions = jest.fn().mockResolvedValue({ status: 'granted' });

jest.mock('expo-notifications', () => ({
  cancelAllScheduledNotificationsAsync: () => mockCancelAll(),
  cancelScheduledNotificationAsync: (id: string) => mockCancelOne(id),
  scheduleNotificationAsync: (args: unknown) => mockSchedule(args),
  getAllScheduledNotificationsAsync: () => mockGetAll(),
  requestPermissionsAsync: () => mockRequestPermissions(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

jest.mock('../dates', () => ({
  getTodayString: () => '2024-01-15',
}));

describe('STREAK_MILESTONES', () => {
  it('contains 3, 5, 10, 20, 50', () => {
    expect(STREAK_MILESTONES).toEqual(expect.arrayContaining([3, 5, 10, 20, 50]));
    expect(STREAK_MILESTONES).toHaveLength(5);
  });
});

describe('copy pool sizes', () => {
  it('pt-BR has at least 10 reminder bodies', () => {
    expect(ptBR.notifications.reminder.bodies.length).toBeGreaterThanOrEqual(10);
  });

  it('pt-BR has at least 10 motivational bodies', () => {
    expect(ptBR.notifications.motivational.bodies.length).toBeGreaterThanOrEqual(10);
  });

  it('en-US has at least 10 reminder bodies', () => {
    expect(enUS.notifications.reminder.bodies.length).toBeGreaterThanOrEqual(10);
  });

  it('en-US has at least 10 motivational bodies', () => {
    expect(enUS.notifications.motivational.bodies.length).toBeGreaterThanOrEqual(10);
  });

  it('pt-BR streak milestone body contains {{streak}} placeholder', () => {
    expect(ptBR.notifications.streakMilestone.body).toContain('{{streak}}');
  });

  it('en-US streak milestone body contains {{streak}} placeholder', () => {
    expect(enUS.notifications.streakMilestone.body).toContain('{{streak}}');
  });
});

describe('sendStreakMilestone', () => {
  beforeEach(() => {
    mockSchedule.mockClear();
  });

  it('does not fire for non-milestone streaks', async () => {
    const { sendStreakMilestone } = require('../notifications');
    for (const s of [1, 2, 4, 6, 7, 15]) {
      await sendStreakMilestone(s);
    }
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('fires for each milestone streak', async () => {
    const { sendStreakMilestone } = require('../notifications');
    for (const s of STREAK_MILESTONES) {
      mockSchedule.mockClear();
      await sendStreakMilestone(s);
      expect(mockSchedule).toHaveBeenCalledTimes(1);
    }
  });

  it('interpolates the streak count into the body', async () => {
    const { sendStreakMilestone } = require('../notifications');
    mockSchedule.mockClear();
    await sendStreakMilestone(10);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.content.body).toContain('10');
    expect(call.content.body).not.toContain('{{streak}}');
  });

  it('fires immediately (trigger: null)', async () => {
    const { sendStreakMilestone } = require('../notifications');
    mockSchedule.mockClear();
    await sendStreakMilestone(5);
    const call = mockSchedule.mock.calls[0][0];
    expect(call.trigger).toBeNull();
  });
});

describe('cancelTodayReminder', () => {
  beforeEach(() => {
    mockCancelOne.mockClear();
  });

  it('cancels the notification with the correct identifier', async () => {
    const { cancelTodayReminder } = require('../notifications');
    await cancelTodayReminder('2024-01-15');
    expect(mockCancelOne).toHaveBeenCalledWith('reminder-2024-01-15');
  });

  it('does not throw even if the notification does not exist', async () => {
    const { cancelTodayReminder } = require('../notifications');
    mockCancelOne.mockRejectedValueOnce(new Error('not found'));
    await expect(cancelTodayReminder('2024-01-15')).resolves.toBeUndefined();
  });
});

describe('requestNotificationPermissions', () => {
  it('returns true when permission is granted', async () => {
    const { requestNotificationPermissions } = require('../notifications');
    const result = await requestNotificationPermissions();
    expect(result).toBe(true);
  });

  it('returns false when permission is denied', async () => {
    const { requestNotificationPermissions } = require('../notifications');
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' });
    const result = await requestNotificationPermissions();
    expect(result).toBe(false);
  });
});

describe('rescheduleAllNotifications', () => {
  beforeEach(() => {
    mockCancelAll.mockClear();
    mockSchedule.mockClear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T06:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('cancels all notifications regardless of enabled state', async () => {
    const { rescheduleAllNotifications } = require('../notifications');
    await rescheduleAllNotifications(
      { enabled: false, reminderEnabled: true, reminderHour: 20, reminderMinute: 0, motivationalEnabled: true },
      '2024-01-15',
    );
    expect(mockCancelAll).toHaveBeenCalled();
  });

  it('schedules no notifications when disabled', async () => {
    const { rescheduleAllNotifications } = require('../notifications');
    await rescheduleAllNotifications(
      { enabled: false, reminderEnabled: true, reminderHour: 20, reminderMinute: 0, motivationalEnabled: true },
      '2024-01-15',
    );
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('schedules reminder notifications when enabled', async () => {
    const { rescheduleAllNotifications } = require('../notifications');
    await rescheduleAllNotifications(
      { enabled: true, reminderEnabled: true, reminderHour: 20, reminderMinute: 0, motivationalEnabled: false },
      '2024-01-15',
    );
    expect(mockSchedule).toHaveBeenCalled();
    const reminderCalls = mockSchedule.mock.calls.filter(
      (c: [{ identifier: string }]) => c[0].identifier.startsWith('reminder-'),
    );
    expect(reminderCalls.length).toBeGreaterThan(0);
  });

  it('schedules motivational notifications when enabled', async () => {
    const { rescheduleAllNotifications } = require('../notifications');
    await rescheduleAllNotifications(
      { enabled: true, reminderEnabled: false, reminderHour: 20, reminderMinute: 0, motivationalEnabled: true },
      '2024-01-15',
    );
    const motivationalCalls = mockSchedule.mock.calls.filter(
      (c: [{ identifier: string }]) => c[0].identifier.startsWith('motivational-'),
    );
    expect(motivationalCalls.length).toBeGreaterThan(0);
  });

  it('schedules both types when both are enabled', async () => {
    const { rescheduleAllNotifications } = require('../notifications');
    await rescheduleAllNotifications(
      { enabled: true, reminderEnabled: true, reminderHour: 20, reminderMinute: 0, motivationalEnabled: true },
      '2024-01-15',
    );
    const reminderCalls = mockSchedule.mock.calls.filter(
      (c: [{ identifier: string }]) => c[0].identifier.startsWith('reminder-'),
    );
    const motivationalCalls = mockSchedule.mock.calls.filter(
      (c: [{ identifier: string }]) => c[0].identifier.startsWith('motivational-'),
    );
    expect(reminderCalls.length).toBeGreaterThan(0);
    expect(motivationalCalls.length).toBeGreaterThan(0);
  });
});

describe('ensureRemindersScheduled', () => {
  beforeEach(() => {
    mockCancelAll.mockClear();
    mockSchedule.mockClear();
    mockGetAll.mockClear();
  });

  it('does not reschedule when enough notifications exist', async () => {
    const { ensureRemindersScheduled } = require('../notifications');
    mockGetAll.mockResolvedValueOnce(new Array(15).fill({ identifier: 'x' }));
    await ensureRemindersScheduled({ enabled: true, reminderEnabled: true, reminderHour: 20, reminderMinute: 0, motivationalEnabled: true });
    expect(mockCancelAll).not.toHaveBeenCalled();
  });

  it('reschedules when fewer than 10 notifications remain', async () => {
    const { ensureRemindersScheduled } = require('../notifications');
    mockGetAll.mockResolvedValueOnce([]);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T06:00:00.000Z'));
    await ensureRemindersScheduled({ enabled: true, reminderEnabled: true, reminderHour: 20, reminderMinute: 0, motivationalEnabled: false });
    expect(mockCancelAll).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
