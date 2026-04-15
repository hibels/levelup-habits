import * as Notifications from 'expo-notifications';

const MESSAGES = [
  'Já marcou seus hábitos hoje? 💪',
  'Pequenos passos, grandes conquistas. Bora lá! 🚀',
  'Seu streak está esperando por você! 🔥',
  'Um hábito de cada vez. Você consegue! ⭐',
  'Hora de ganhar XP! Abra o app e marque seus hábitos. 🎯',
  'Consistência é a chave. Vamos manter o ritmo? 💡',
  'Você foi incrível ontem. Repita hoje! 🏆',
  'Cada check conta. Não perca o fio da meada! ✅',
  'O caminho para o topo começa com um check. Vai lá! 🌟',
  'Qual hábito você vai marcar primeiro hoje? 🎉',
  'Lembrete amigável: seus hábitos estão te esperando! 👋',
  'Não quebre a sequência! Você está indo muito bem. 🔗',
];

/**
 * Agenda os próximos 30 lembretes diários ao meio-dia,
 * cada um com uma mensagem aleatória diferente.
 * Cancela qualquer lembrete anterior antes de reagendar.
 */
export async function scheduleDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();
  let messageIndex = Math.floor(Math.random() * MESSAGES.length);

  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(12, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'LevelUp Habits',
        body: MESSAGES[messageIndex % MESSAGES.length],
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });

    messageIndex++;
  }
}

/**
 * Verifica se restam menos de 10 notificações agendadas e reagenda se necessário.
 * Deve ser chamado no início de cada sessão do app.
 */
export async function ensureRemindersScheduled(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduled.length < 10) {
    await scheduleDailyReminder();
  }
}

/** Cancela todos os lembretes agendados. */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
