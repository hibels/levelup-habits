import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['pt-BR'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje',
};
LocaleConfig.defaultLocale = 'pt-BR';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getLevelTitle } from '../utils/levels';
import { formatDate, getTodayString } from '../utils/dates';
import { rescheduleAllNotifications } from '../utils/notifications';
import type { NotificationPreferences } from '../types';
import { HabitDetailSheet } from '../components/HabitDetailSheet';
import type { Habit } from '../types';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation';

function getWeekDateRange(weekKey: string): string {
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  const jan4 = new Date(year, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - jan4Day + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;
  }
  return `${monday.getDate()} ${months[monday.getMonth()]} – ${sunday.getDate()} ${months[sunday.getMonth()]} ${sunday.getFullYear()}`;
}

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, habits, themeMode, updateProfile, weeklyReviews, isPremium, notificationPreferences, setNotificationPreferences } = useStore();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });

  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;
  const levelTitle = getLevelTitle(profile.level);

  // Stats
  const totalHabits = habits.length;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  // Taxa de conclusão da semana (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return formatDate(d);
  });
  const completedInLast7Days = habits.reduce((acc, h) => {
    return acc + h.completedDates.filter(d => last7Days.includes(d)).length;
  }, 0);
  const weeklyRate = totalHabits > 0
    ? Math.round((completedInLast7Days / (totalHabits * 7)) * 100)
    : 0;

  const today = formatDate(new Date());

  const getDayIntensity = (date: string): 0 | 1 | 2 | 3 | 4 => {
    if (totalHabits === 0) return 0;
    const count = habits.filter(h => h.completedDates.includes(date)).length;
    if (count === 0) return 0;
    const ratio = count / totalHabits;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const intensityColors = isDarkMode
    ? ['#1E293B', '#064E3B', '#065F46', '#047857', '#10B981']
    : ['#F3F4F6', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#10B981'];

  const renderDay = ({ date, state }: { date?: { dateString: string; day: number }; state?: string }) => {
    if (!date) return <View style={styles.calendarCell} />;
    const isFuture = state === 'disabled';
    const intensity = isFuture ? 0 : getDayIntensity(date.dateString);
    const isToday = date.dateString === today;
    return (
      <View style={styles.calendarCell}>
        <View style={[
          styles.calendarDot,
          {
            backgroundColor: intensityColors[intensity],
            borderWidth: isToday ? 1.5 : 0,
            borderColor: isToday ? colors.primary.main : 'transparent',
          },
        ]}>
          <Text style={[
            styles.calendarDayNum,
            { color: isFuture ? theme.disabled : intensity > 2 ? '#FFFFFF' : theme.textSecondary },
          ]}>
            {date.day}
          </Text>
        </View>
      </View>
    );
  };

  const calendarTheme = {
    calendarBackground: theme.card,
    textSectionTitleColor: theme.textSecondary,
    monthTextColor: theme.textPrimary,
    textMonthFontWeight: '600' as const,
    arrowColor: theme.textSecondary,
    textDayHeaderFontSize: 11,
    textMonthFontSize: 14,
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para definir sua foto de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await updateProfile(profile.name, profile.avatar, result.assets[0].uri);
    }
  };

  const handleUpdateNotifPrefs = async (partial: Partial<NotificationPreferences>) => {
    const updated: NotificationPreferences = { ...notificationPreferences, ...partial };
    await setNotificationPreferences(updated);
    rescheduleAllNotifications(updated, getTodayString()).catch(() => {});
  };

  const xpForLevel = profile.xp;
  const xpProgress = xpForLevel % 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.primary.main }]}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto} activeOpacity={0.8}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarEmojiBg}>
              {profile.avatar ? (
                <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
              ) : (
                <Ionicons name="person" size={44} color="#FFFFFF" />
              )}
            </View>
          )}
          <View style={styles.editAvatarBadge}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.heroName}>{profile.name}</Text>

        <View style={styles.levelRow}>
          <MaterialCommunityIcons name="star-four-points" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroLevel}>Nível {profile.level} · {levelTitle}</Text>
        </View>

        {/* XP bar */}
        <View style={styles.xpBarContainer}>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${xpProgress}%` }]} />
          </View>
          <Text style={styles.xpLabel}>{profile.totalXP} XP total</Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Estatísticas</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Ionicons name="flash" size={20} color={colors.secondary.main} />}
            value={String(profile.totalXP)}
            label="XP Total"
            theme={theme}
          />
          <StatCard
            icon={<Ionicons name="flame" size={20} color={colors.accent.main} />}
            value={String(maxStreak)}
            label="Melhor streak"
            theme={theme}
          />
          <StatCard
            icon={<Ionicons name="checkmark-done-circle" size={20} color={colors.primary.main} />}
            value={String(totalCompletions)}
            label="Concluídos"
            theme={theme}
          />
          <StatCard
            icon={<Ionicons name="trending-up" size={20} color={colors.semantic.info} />}
            value={`${weeklyRate}%`}
            label="Taxa semanal"
            theme={theme}
          />
        </View>
      </View>

      {/* Notificações */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notificações</Text>

        <View style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.settingIconBg, { backgroundColor: `${colors.primary.main}15` }]}>
            <Ionicons name="notifications" size={20} color={colors.primary.main} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Notificações</Text>
            <Text style={[styles.settingSubLabel, { color: theme.textSecondary }]}>
              Lembretes e mensagens motivacionais
            </Text>
          </View>
          <Switch
            value={notificationPreferences.enabled}
            onValueChange={(v) => handleUpdateNotifPrefs({ enabled: v })}
            trackColor={{ false: theme.border, true: colors.primary.main }}
            thumbColor="#FFFFFF"
          />
        </View>

        {notificationPreferences.enabled && (
          <>
            <View style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border, marginTop: spacing.s }]}>
              <View style={[styles.settingIconBg, { backgroundColor: `${colors.secondary.main}15` }]}>
                <Ionicons name="alarm" size={20} color={colors.secondary.main} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Lembrete diário</Text>
                <Text style={[styles.settingSubLabel, { color: theme.textSecondary }]}>
                  Se não completou todos os hábitos
                </Text>
              </View>
              <Switch
                value={notificationPreferences.reminderEnabled}
                onValueChange={(v) => handleUpdateNotifPrefs({ reminderEnabled: v })}
                trackColor={{ false: theme.border, true: colors.secondary.main }}
                thumbColor="#FFFFFF"
              />
            </View>

            {notificationPreferences.reminderEnabled && (
              <View style={[styles.timePickerRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
                <Text style={[styles.settingLabel, { color: theme.textPrimary, flex: 1, marginLeft: spacing.s }]}>
                  Horário do lembrete
                </Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity
                    onPress={() => handleUpdateNotifPrefs({ reminderHour: (notificationPreferences.reminderHour + 23) % 24 })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="chevron-back" size={20} color={colors.primary.main} />
                  </TouchableOpacity>
                  <Text style={[styles.timeText, { color: theme.textPrimary }]}>
                    {String(notificationPreferences.reminderHour).padStart(2, '0')}:00
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleUpdateNotifPrefs({ reminderHour: (notificationPreferences.reminderHour + 1) % 24 })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="chevron-forward" size={20} color={colors.primary.main} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border, marginTop: spacing.s }]}>
              <View style={[styles.settingIconBg, { backgroundColor: `${colors.accent.main}15` }]}>
                <Ionicons name="sunny" size={20} color={colors.accent.main} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Mensagem motivacional</Text>
                <Text style={[styles.settingSubLabel, { color: theme.textSecondary }]}>
                  Inspiração diária às 09:00
                </Text>
              </View>
              <Switch
                value={notificationPreferences.motivationalEnabled}
                onValueChange={(v) => handleUpdateNotifPrefs({ motivationalEnabled: v })}
                trackColor={{ false: theme.border, true: colors.accent.main }}
                thumbColor="#FFFFFF"
              />
            </View>
          </>
        )}
      </View>

      {/* Calendário mensal de atividade */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Atividade</Text>
        <View style={[styles.calendarCard, { borderColor: theme.border }]}>
          <Calendar
            current={currentMonth}
            maxDate={today}
            firstDay={0}
            hideExtraDays
            onMonthChange={(month) => {
              setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}-01`);
            }}
            dayComponent={renderDay}
            theme={calendarTheme}
          />
          <View style={[styles.calendarLegend, { paddingHorizontal: spacing.m, paddingBottom: spacing.s }]}>
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Menos</Text>
            {intensityColors.map((c, i) => (
              <View key={i} style={[styles.legendDot, { backgroundColor: c, borderWidth: i === 0 ? 1 : 0, borderColor: theme.border }]} />
            ))}
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Mais</Text>
          </View>
        </View>
      </View>

      {/* Retrospectivas */}
      {(isPremium ? weeklyReviews.length > 0 : weeklyReviews.length > 0) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Retrospectivas</Text>
          {isPremium ? (
            weeklyReviews.map(review => {
              const goalsMet = review.habitResults.filter(r => r.completed >= r.goal).length;
              const total = review.habitResults.length;
              const score = total > 0 ? Math.round((goalsMet / total) * 100) : 0;
              const weekNum = review.weekKey.split('-W')[1];
              return (
                <TouchableOpacity
                  key={review.id}
                  style={[styles.reviewRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('WeeklyReview', { reviewId: review.id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.reviewScore, { backgroundColor: `${colors.primary.main}18` }]}>
                    <Text style={[styles.reviewScoreText, { color: colors.primary.main }]}>{score}%</Text>
                  </View>
                  <View style={styles.reviewInfo}>
                    <Text style={[styles.reviewWeek, { color: theme.textPrimary }]}>
                      Semana {weekNum}
                    </Text>
                    <Text style={[styles.reviewDate, { color: theme.textSecondary }]} numberOfLines={1}>
                      {getWeekDateRange(review.weekKey)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.disabled} />
                </TouchableOpacity>
              );
            })
          ) : (
            <TouchableOpacity
              style={[styles.lockedCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <View style={[styles.lockedIconBg, { backgroundColor: `${colors.primary.main}15` }]}>
                <Ionicons name="lock-closed" size={22} color={colors.primary.main} />
              </View>
              <View style={styles.lockedInfo}>
                <Text style={[styles.lockedTitle, { color: theme.textPrimary }]}>
                  Histórico de retrospectivas
                </Text>
                <Text style={[styles.lockedSubtitle, { color: theme.textSecondary }]}>
                  Acesse com o Premium
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.disabled} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Hábitos ativos */}
      {habits.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Hábitos ativos</Text>
          {habits.map(habit => {
            const weekCompletions = habit.completedDates.filter(d => {
              const now = new Date();
              const dayOfWeek = now.getDay();
              const monday = new Date(now);
              monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
              const weekStart = formatDate(monday);
              const weekEnd = formatDate(now);
              return d >= weekStart && d <= weekEnd;
            }).length;
            const goalReached = weekCompletions >= habit.weeklyGoal;
            const progressPercent = Math.min((weekCompletions / habit.weeklyGoal) * 100, 100);

            if (isPremium) {
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setSelectedHabit(habit)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, { color: theme.textPrimary }]}>{habit.name}</Text>
                    <View style={styles.habitProgressRow}>
                      <View style={[styles.habitTrack, { backgroundColor: theme.border }]}>
                        <View style={[
                          styles.habitFill,
                          { width: `${progressPercent}%`, backgroundColor: goalReached ? colors.primary.main : colors.secondary.main },
                        ]} />
                      </View>
                      <Text style={[styles.habitMeta, { color: theme.textSecondary }]}>
                        {weekCompletions}/{habit.weeklyGoal}×
                      </Text>
                    </View>
                  </View>
                  {habit.streak > 0 && (
                    <View style={styles.habitStreak}>
                      <Ionicons name="flame" size={14} color={colors.accent.main} />
                      <Text style={[styles.habitStreakText, { color: colors.accent.main }]}>
                        {habit.streak}
                      </Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={theme.disabled} />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={habit.id}
                style={[styles.lockedCard, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: spacing.s }]}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.8}
              >
                <View style={[styles.lockedIconBg, { backgroundColor: `${colors.primary.main}15` }]}>
                  <Text style={styles.habitEmojiLocked}>{habit.emoji}</Text>
                </View>
                <View style={styles.lockedInfo}>
                  <Text style={[styles.lockedTitle, { color: theme.textPrimary }]}>{habit.name}</Text>
                  <Text style={[styles.lockedSubtitle, { color: theme.textSecondary }]}>
                    Acesse os detalhes com o Premium
                  </Text>
                </View>
                <Ionicons name="lock-closed" size={16} color={theme.disabled} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <HabitDetailSheet
        habit={selectedHabit}
        visible={!!selectedHabit}
        onClose={() => setSelectedHabit(null)}
        isDarkMode={isDarkMode}
      />
    </ScrollView>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  theme: typeof colors.light;
}

function StatCard({ icon, value, label, theme }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {icon}
      <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  hero: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.m,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarEmojiBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 48 },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  heroName: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: spacing.xxs,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.m,
  },
  heroLevel: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  xpBarContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  xpTrack: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 3,
  },
  xpLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.l,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  statCard: {
    width: '47%',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  statValue: {
    ...typography.h2,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  calendarCard: {
    borderWidth: 1,
    borderRadius: borderRadius.l,
    overflow: 'hidden',
  },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayNum: {
    fontSize: 9,
    fontWeight: '500',
  },
  calendarLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: spacing.s,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  habitEmoji: { fontSize: 24 },
  habitInfo: { flex: 1 },
  habitName: {
    ...typography.body,
    fontWeight: '600',
  },
  habitProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  habitTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  habitFill: {
    height: '100%',
    borderRadius: 2,
  },
  habitMeta: { ...typography.caption },
  habitEmojiLocked: { fontSize: 22 },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  habitStreakText: {
    ...typography.caption,
    fontWeight: '700',
  },
  lockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    gap: spacing.s,
  },
  lockedIconBg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedInfo: { flex: 1 },
  lockedTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  lockedSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  reviewScore: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewScoreText: {
    ...typography.numberSmall,
    fontWeight: '700',
  },
  reviewInfo: { flex: 1 },
  reviewWeek: {
    ...typography.body,
    fontWeight: '600',
  },
  reviewDate: {
    ...typography.caption,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    gap: spacing.s,
  },
  settingIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  settingSubLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    marginTop: spacing.s,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeText: {
    ...typography.body,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'center',
  },
});
