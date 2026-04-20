import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStore } from '../store';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, typography, borderRadius } from '../theme';
import { formatDate, getMonthDates } from '../utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitAnalytics'>;

const BAR_CHART_HEIGHT = 80;
const DAY_NAMES_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const DAY_NAMES_FULL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getLastFourWeeks(): { shortLabel: string; dates: string[] }[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const labels = ['-3', '-2', '-1', 'Atual'];
  return Array.from({ length: 4 }, (_, idx) => {
    const w = 3 - idx;
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) - w * 7);
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return formatDate(d);
    });
    return { shortLabel: labels[idx], dates };
  });
}

function getBestDailyStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort();
  let best = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T12:00:00');
    const curr = new Date(sorted[i] + 'T12:00:00');
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      current++;
      if (current > best) best = current;
    } else {
      current = 1;
    }
  }
  return best;
}

function getBestDayOfWeek(completedDates: string[]): string {
  if (completedDates.length === 0) return '—';
  const counts = new Array(7).fill(0);
  for (const d of completedDates) {
    counts[new Date(d + 'T12:00:00').getDay()]++;
  }
  const max = Math.max(...counts);
  if (max === 0) return '—';
  return DAY_NAMES_FULL[counts.indexOf(max)];
}

function getCompletionRate(completedDates: string[], createdAt: string): number {
  const created = new Date(createdAt);
  const today = new Date();
  const totalDays = Math.max(1, Math.ceil((today.getTime() - created.getTime()) / 86400000) + 1);
  return Math.min(100, Math.round((completedDates.length / totalDays) * 100));
}

export const HabitAnalyticsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { habitId } = route.params;
  const { habits, isPremium, themeMode } = useStore();
  const insets = useSafeAreaInsets();
  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  const habit = habits.find(h => h.id === habitId);

  const analytics = useMemo(() => {
    if (!habit) return null;
    const weeks = getLastFourWeeks();
    const now = new Date();
    return {
      completionRate: getCompletionRate(habit.completedDates, habit.createdAt),
      bestDailyStreak: getBestDailyStreak(habit.completedDates),
      bestDayOfWeek: getBestDayOfWeek(habit.completedDates),
      weeklyData: weeks.map(week => ({
        label: week.shortLabel,
        completed: week.dates.filter(d => habit.completedDates.includes(d)).length,
      })),
      monthDates: getMonthDates(now.getFullYear(), now.getMonth()),
      monthFirstDayOfWeek: new Date(now.getFullYear(), now.getMonth(), 1).getDay(),
      monthLabel: now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  }, [habit]);

  if (!habit || !analytics) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.closeBtnStandalone} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Hábito não encontrado
        </Text>
      </View>
    );
  }

  const chartMax = Math.max(...analytics.weeklyData.map(w => w.completed), habit.weeklyGoal, 1);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.s,
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.habitTitle}>
            <Text style={styles.habitEmoji}>{habit.emoji}</Text>
            <Text style={[styles.habitName, { color: theme.textPrimary }]} numberOfLines={1}>
              {habit.name}
            </Text>
          </View>
          {habit.streak > 0 && (
            <View style={[styles.streakBadge, { backgroundColor: `${colors.secondary.main}18` }]}>
              <Ionicons name="flame" size={13} color={colors.secondary.main} />
              <Text style={[styles.streakText, { color: colors.secondary.main }]}>
                {habit.streak}
              </Text>
            </View>
          )}
        </View>
        {!isPremium && (
          <View style={[styles.premiumBanner, { backgroundColor: `${colors.primary.main}12` }]}>
            <Ionicons name="star" size={13} color={colors.primary.main} />
            <Text style={[styles.premiumBannerText, { color: colors.primary.dark }]}>
              Analytics disponível no Premium
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Paywall')}>
              <Text style={[styles.premiumBannerLink, { color: colors.primary.main }]}>
                Ver planos
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metric cards */}
        <View style={styles.metricsRow}>
          <MetricCard
            value={`${analytics.completionRate}%`}
            label="Conclusão geral"
            icon="checkmark-circle-outline"
            iconColor={colors.primary.main}
            theme={theme}
            locked={!isPremium}
          />
          <MetricCard
            value={`${analytics.bestDailyStreak}d`}
            label="Melhor sequência"
            icon="flame-outline"
            iconColor={colors.secondary.main}
            theme={theme}
            locked={!isPremium}
          />
          <MetricCard
            value={analytics.bestDayOfWeek}
            label="Melhor dia"
            icon="calendar-outline"
            iconColor={colors.semantic.info}
            theme={theme}
            locked={!isPremium}
          />
        </View>

        {/* Weekly bar chart */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bar-chart-outline" size={16} color={colors.primary.main} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Últimas 4 semanas
            </Text>
          </View>
          {isPremium ? (
            <View style={styles.barChart}>
              {analytics.weeklyData.map((week, i) => {
                const barRatio = week.completed / chartMax;
                const goalRatio = habit.weeklyGoal / chartMax;
                const goalReached = week.completed >= habit.weeklyGoal;
                return (
                  <View key={i} style={styles.barColumn}>
                    <View style={[styles.barTrack, { height: BAR_CHART_HEIGHT }]}>
                      <View
                        style={[
                          styles.goalLine,
                          {
                            bottom: goalRatio * BAR_CHART_HEIGHT - 1,
                            borderColor: `${colors.primary.main}50`,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(barRatio * BAR_CHART_HEIGHT, barRatio > 0 ? 4 : 0),
                            backgroundColor: goalReached
                              ? colors.primary.main
                              : `${colors.primary.main}50`,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.barValue,
                        { color: goalReached ? colors.primary.main : theme.textSecondary },
                      ]}
                    >
                      {week.completed}/{habit.weeklyGoal}
                    </Text>
                    <Text style={[styles.barLabel, { color: theme.textSecondary }]}>
                      {week.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <LockedContent theme={theme} onUpgrade={() => navigation.navigate('Paywall')} />
          )}
        </View>

        {/* Monthly heatmap */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={16} color={colors.primary.main} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {analytics.monthLabel}
            </Text>
          </View>
          {isPremium ? (
            <View>
              <View style={styles.calWeekRow}>
                {DAY_NAMES_SHORT.map((d, i) => (
                  <Text key={i} style={[styles.calWeekLabel, { color: theme.textSecondary }]}>
                    {d}
                  </Text>
                ))}
              </View>
              <MonthHeatmap
                monthDates={analytics.monthDates}
                completedDates={habit.completedDates}
                firstDayOfWeek={analytics.monthFirstDayOfWeek}
                theme={theme}
              />
            </View>
          ) : (
            <LockedContent theme={theme} onUpgrade={() => navigation.navigate('Paywall')} />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// --- Sub-components ---

interface MetricCardProps {
  value: string;
  label: string;
  icon: string;
  iconColor: string;
  theme: typeof colors.light;
  locked: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label, icon, iconColor, theme, locked }) => (
  <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <Ionicons name={icon as any} size={18} color={locked ? theme.disabled : iconColor} />
    <Text style={[styles.metricValue, { color: locked ? theme.disabled : theme.textPrimary }]}>
      {locked ? '—' : value}
    </Text>
    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
  </View>
);

interface LockedContentProps {
  theme: typeof colors.light;
  onUpgrade: () => void;
}

const LockedContent: React.FC<LockedContentProps> = ({ theme, onUpgrade }) => (
  <View style={styles.lockedContent}>
    <Ionicons name="lock-closed" size={24} color={theme.disabled} />
    <Text style={[styles.lockedText, { color: theme.textSecondary }]}>
      Disponível no Premium
    </Text>
    <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade} activeOpacity={0.8}>
      <Text style={styles.upgradeBtnText}>Fazer upgrade</Text>
    </TouchableOpacity>
  </View>
);

interface MonthHeatmapProps {
  monthDates: string[];
  completedDates: string[];
  firstDayOfWeek: number;
  theme: typeof colors.light;
}

const MonthHeatmap: React.FC<MonthHeatmapProps> = ({
  monthDates,
  completedDates,
  firstDayOfWeek,
  theme,
}) => {
  const today = formatDate(new Date());
  const cells: (string | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...monthDates,
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.calGrid}>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.calRow}>
          {row.map((date, ci) => {
            if (!date) {
              return <View key={ci} style={styles.calDay} />;
            }
            const isCompleted = completedDates.includes(date);
            const isToday = date === today;
            const isFuture = date > today;
            return (
              <View
                key={ci}
                style={[
                  styles.calDay,
                  isCompleted && { backgroundColor: colors.primary.main },
                  !isCompleted && !isFuture && { backgroundColor: `${theme.border}80` },
                  isToday && !isCompleted && {
                    borderWidth: 1.5,
                    borderColor: colors.primary.main,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.calDayText,
                    {
                      color: isCompleted
                        ? '#fff'
                        : isFuture
                        ? theme.disabled
                        : theme.textSecondary,
                      fontWeight: isToday ? '700' : '400',
                    },
                  ]}
                >
                  {new Date(date + 'T12:00:00').getDate()}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.xxs,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnStandalone: {
    margin: spacing.m,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  habitEmoji: { fontSize: 22 },
  habitName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  streakText: { ...typography.caption, fontWeight: '700' },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.s,
    marginTop: spacing.xxs,
  },
  premiumBannerText: { ...typography.caption, flex: 1 },
  premiumBannerLink: { ...typography.caption, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.m,
    gap: spacing.m,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  metricCard: {
    flex: 1,
    padding: spacing.s,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  metricValue: {
    ...typography.numberMedium,
    fontWeight: '700',
  },
  metricLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  section: {
    borderRadius: borderRadius.m,
    borderWidth: 1,
    padding: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    fontWeight: '600',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    gap: spacing.xxs,
    flex: 1,
  },
  barTrack: {
    width: '60%',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.xs,
  },
  barValue: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  barLabel: {
    ...typography.caption,
    fontSize: 10,
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: spacing.l,
    gap: spacing.s,
  },
  lockedText: { ...typography.body },
  upgradeBtn: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  upgradeBtnText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  calWeekLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  calGrid: { gap: spacing.xxs },
  calRow: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  calDay: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: borderRadius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calDayText: {
    fontSize: 11,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
