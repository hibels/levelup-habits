import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getLevelTitle } from '../utils/levels';
import { getMonthDates, formatDate } from '../utils/dates';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, TabParamList } from '../navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, habits, themeMode, updateProfile } = useStore();
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

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

  // Calendário mensal: nível de preenchimento por dia (0–4 para cor)
  const monthDates = getMonthDates(calendarYear, calendarMonth);
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

  // Primeiro dia do mês (para offset na grade)
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const offsetDays = (firstDayOfMonth + 6) % 7; // Ajusta para segunda = 0

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

  const navigatePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const navigateNextMonth = () => {
    const now = new Date();
    if (calendarYear === now.getFullYear() && calendarMonth === now.getMonth()) return;
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const isNextMonthDisabled = () => {
    const now = new Date();
    return calendarYear === now.getFullYear() && calendarMonth === now.getMonth();
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
              <Text style={styles.avatarEmoji}>{profile.avatar}</Text>
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

      {/* Calendário mensal de atividade */}
      <View style={styles.section}>
        <View style={styles.calendarHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Atividade</Text>
          <View style={styles.calendarNav}>
            <TouchableOpacity onPress={navigatePrevMonth} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.calendarMonthLabel, { color: theme.textSecondary }]}>
              {MONTH_NAMES[calendarMonth]} {calendarYear}
            </Text>
            <TouchableOpacity onPress={navigateNextMonth} disabled={isNextMonthDisabled()} activeOpacity={0.7}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isNextMonthDisabled() ? theme.disabled : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Labels de dias da semana */}
          <View style={styles.calendarWeekLabels}>
            {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
              <Text key={i} style={[styles.calendarWeekDay, { color: theme.textSecondary }]}>
                {d}
              </Text>
            ))}
          </View>

          {/* Grade de dias */}
          <View style={styles.calendarGrid}>
            {/* Offset */}
            {Array.from({ length: offsetDays }).map((_, i) => (
              <View key={`offset-${i}`} style={styles.calendarCell} />
            ))}
            {monthDates.map(date => {
              const intensity = getDayIntensity(date);
              const isToday = date === today;
              return (
                <View
                  key={date}
                  style={[
                    styles.calendarCell,
                    {
                      backgroundColor: intensityColors[intensity],
                      borderWidth: isToday ? 1.5 : 0,
                      borderColor: isToday ? colors.primary.main : 'transparent',
                    },
                  ]}
                >
                  <Text style={[
                    styles.calendarDayNum,
                    { color: intensity > 2 ? '#FFFFFF' : theme.textSecondary }
                  ]}>
                    {parseInt(date.split('-')[2], 10)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Legenda */}
          <View style={styles.calendarLegend}>
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Menos</Text>
            {intensityColors.map((c, i) => (
              <View key={i} style={[styles.legendDot, { backgroundColor: c, borderWidth: i === 0 ? 1 : 0, borderColor: theme.border }]} />
            ))}
            <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Mais</Text>
          </View>
        </View>
      </View>

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

            return (
              <View
                key={habit.id}
                style={[styles.habitRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: theme.textPrimary }]}>{habit.name}</Text>
                  <Text style={[styles.habitMeta, { color: theme.textSecondary }]}>
                    {weekCompletions}/{habit.weeklyGoal}× esta semana
                  </Text>
                </View>
                {habit.streak > 0 && (
                  <View style={styles.habitStreak}>
                    <Ionicons name="flame" size={14} color={colors.accent.main} />
                    <Text style={[styles.habitStreakText, { color: colors.accent.main }]}>
                      {habit.streak}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
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
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  calendarMonthLabel: {
    ...typography.caption,
    fontWeight: '600',
    minWidth: 110,
    textAlign: 'center',
  },
  calendarCard: {
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.l,
  },
  calendarWeekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  calendarWeekDay: {
    ...typography.label,
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'space-around',
  },
  calendarCell: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
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
  habitMeta: { ...typography.caption },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  habitStreakText: {
    ...typography.caption,
    fontWeight: '700',
  },
});
