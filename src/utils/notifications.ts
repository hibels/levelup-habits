import * as Notifications from 'expo-notifications';
import { getTodayString } from './dates';
import { getTranslations } from '../i18n';
import type { NotificationPreferences } from '../types';

export const STREAK_MILESTONES = [3, 5, 10, 20, 50];

const REMINDER_ID_PREFIX = 'reminder-';
const MOTIVATIONAL_ID_PREFIX = 'motivational-';

function pickMessage(messages: string[], seed: number): string {
  return messages[seed % messages.length];
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function rescheduleAllNotifications(
  prefs: NotificationPreferences,
  today: string,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return;

  const t = getTranslations();
  const now = new Date();
  const baseSeed = Math.floor(Math.random() * 997);

  for (let i = 0; i < 30; i++) {
    const date = new Date(today + 'T00:00:00');
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    if (prefs.reminderEnabled) {
      const reminderDate = new Date(date);
      reminderDate.setHours(prefs.reminderHour, prefs.reminderMinute, 0, 0);
      if (reminderDate > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${REMINDER_ID_PREFIX}${dateStr}`,
          content: {
            title: t.notifications.reminder.title,
            body: pickMessage(t.notifications.reminder.bodies, baseSeed + i),
            sound: true,
            data: { type: 'reminder' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          },
        });
      }
    }

    if (prefs.motivationalEnabled) {
      const motivationalDate = new Date(date);
      motivationalDate.setHours(9, 0, 0, 0);
      if (motivationalDate > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${MOTIVATIONAL_ID_PREFIX}${dateStr}`,
          content: {
            title: t.notifications.motivational.title,
            body: pickMessage(t.notifications.motivational.bodies, baseSeed + i + 100),
            sound: true,
            data: { type: 'motivational' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: motivationalDate,
          },
        });
      }
    }
  }
}

export async function cancelTodayReminder(today: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(`${REMINDER_ID_PREFIX}${today}`);
  } catch {
    // Notification may not exist; ignore
  }
}

export async function sendStreakMilestone(streak: number): Promise<void> {
  if (!STREAK_MILESTONES.includes(streak)) return;
  const t = getTranslations();
  const body = t.notifications.streakMilestone.body.replace('{{streak}}', String(streak));
  await Notifications.scheduleNotificationAsync({
    identifier: `streak-${streak}-${Date.now()}`,
    content: {
      title: t.notifications.streakMilestone.title,
      body,
      sound: true,
      data: { type: 'streak', streak },
    },
    trigger: null,
  });
}

// Backward-compatible exports used by OnboardingScreen
export async function scheduleDailyReminder(): Promise<void> {
  const defaultPrefs: NotificationPreferences = {
    enabled: true,
    reminderEnabled: true,
    reminderHour: 20,
    reminderMinute: 0,
    motivationalEnabled: true,
  };
  await rescheduleAllNotifications(defaultPrefs, getTodayString());
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function ensureRemindersScheduled(
  prefs?: NotificationPreferences,
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.length < 10) {
    if (prefs) {
      await rescheduleAllNotifications(prefs, getTodayString());
    } else {
      await scheduleDailyReminder();
    }
  }
}
