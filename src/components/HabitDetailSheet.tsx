import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Habit } from '../types';
import { colors, spacing, typography, borderRadius } from '../theme';
import { formatDate } from '../utils/dates';

interface Props {
  habit: Habit | null;
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

/** Retorna as últimas 12 semanas como array[semana][dia], seg=0 dom=6 */
function getLast12Weeks(): string[][] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const startMonday = new Date(monday);
  startMonday.setDate(monday.getDate() - 11 * 7);

  const weeks: string[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startMonday);
      date.setDate(startMonday.getDate() + w * 7 + d);
      week.push(formatDate(date));
    }
    weeks.push(week);
  }
  return weeks;
}

/** Rótulos curtos de seg a dom */
const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export const HabitDetailSheet: React.FC<Props> = ({ habit, visible, onClose, isDarkMode }) => {
  const insets = useSafeAreaInsets();
  const theme = isDarkMode ? colors.dark : colors.light;
  const today = formatDate(new Date());

  const weeks = useMemo(() => getLast12Weeks(), [visible]);

  const stats = useMemo(() => {
    if (!habit) return null;

    const completedSet = new Set(habit.completedDates);

    const weeksWithGoal = weeks.filter(week => {
      const count = week.filter(d => completedSet.has(d)).length;
      return count >= habit.weeklyGoal;
    }).length;

    const consistencyRate = Math.round((weeksWithGoal / 12) * 100);

    const bestWeek = weeks.reduce((best, week) => {
      const count = week.filter(d => completedSet.has(d)).length;
      return count > best ? count : best;
    }, 0);

    const createdDate = new Date(habit.createdAt);
    const monthsActive = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
    );

    return { consistencyRate, bestWeek, monthsActive };
  }, [habit, weeks]);

  const doneColor = isDarkMode ? '#10B981' : '#10B981';
  const emptyColor = isDarkMode ? '#1E293B' : '#F3F4F6';

  if (!habit || !stats) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.sheet, { backgroundColor: theme.background, paddingBottom: insets.bottom + spacing.l }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: theme.border }]} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.habitEmoji}>{habit.emoji}</Text>
          <Text style={[styles.habitName, { color: theme.textPrimary }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Heatmap 12 semanas */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Últimas 12 semanas
          </Text>

          <View style={[styles.heatmapCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.heatmapGrid}>
              {/* Rótulos dos dias */}
              <View style={styles.dayLabels}>
                {DAY_LABELS.map((label, i) => (
                  <Text key={i} style={[styles.dayLabel, { color: theme.textSecondary }]}>
                    {label}
                  </Text>
                ))}
              </View>

              {/* Colunas de semanas */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.weeksRow}>
                  {weeks.map((week, wi) => (
                    <View key={wi} style={styles.weekColumn}>
                      {week.map((date, di) => {
                        const done = habit.completedDates.includes(date);
                        const isFuture = date > today;
                        return (
                          <View
                            key={di}
                            style={[
                              styles.cell,
                              {
                                backgroundColor: isFuture
                                  ? 'transparent'
                                  : done
                                  ? doneColor
                                  : emptyColor,
                                borderWidth: isFuture ? 0 : 0,
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Legenda */}
            <View style={styles.legend}>
              <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Menos</Text>
              <View style={[styles.legendDot, { backgroundColor: emptyColor, borderWidth: 1, borderColor: theme.border }]} />
              <View style={[styles.legendDot, { backgroundColor: doneColor }]} />
              <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>Mais</Text>
            </View>
          </View>

          {/* Stat flashcards */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: spacing.l }]}>
            Estatísticas
          </Text>

          <View style={styles.statsGrid}>
            <StatFlashcard
              icon="checkmark-circle-outline"
              iconColor={colors.primary.main}
              value={`${stats.consistencyRate}%`}
              label="Consistência"
              subtitle="nas últimas 12 semanas"
              theme={theme}
            />
            <StatFlashcard
              icon="flame-outline"
              iconColor={colors.accent.main}
              value={String(habit.streak)}
              label="Sequência atual"
              subtitle={habit.streak === 1 ? 'semana' : 'semanas'}
              theme={theme}
            />
            <StatFlashcard
              icon="trophy-outline"
              iconColor={colors.secondary.main}
              value={String(stats.bestWeek)}
              label="Melhor semana"
              subtitle={`de ${habit.weeklyGoal} meta`}
              theme={theme}
            />
            <StatFlashcard
              icon="calendar-outline"
              iconColor={colors.semantic.info}
              value={String(stats.monthsActive)}
              label={stats.monthsActive === 1 ? 'Mês ativo' : 'Meses ativo'}
              subtitle={`${habit.completedDates.length} checks no total`}
              theme={theme}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

interface StatFlashcardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  value: string;
  label: string;
  subtitle: string;
  theme: typeof colors.light;
}

function StatFlashcard({ icon, iconColor, value, label, subtitle, theme }: StatFlashcardProps) {
  return (
    <View style={[styles.flashcard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name={icon} size={22} color={iconColor} />
      <Text style={[styles.flashcardValue, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.flashcardLabel, { color: theme.textPrimary }]}>{label}</Text>
      <Text style={[styles.flashcardSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
    </View>
  );
}

const CELL_SIZE = 14;
const CELL_GAP = 3;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    gap: spacing.s,
  },
  habitEmoji: {
    fontSize: 28,
  },
  habitName: {
    ...typography.h3,
    flex: 1,
  },
  closeBtn: {
    padding: spacing.xxs,
  },
  content: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.s,
  },
  heatmapCard: {
    borderWidth: 1,
    borderRadius: borderRadius.m,
    padding: spacing.m,
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dayLabels: {
    flexDirection: 'column',
    gap: CELL_GAP,
    paddingTop: 1,
  },
  dayLabel: {
    fontSize: 9,
    width: 10,
    height: CELL_SIZE,
    textAlignVertical: 'center',
    lineHeight: CELL_SIZE,
  },
  weeksRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  weekColumn: {
    flexDirection: 'column',
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: spacing.s,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  flashcard: {
    width: '47%',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    gap: 4,
  },
  flashcardValue: {
    ...typography.h2,
    fontWeight: '700',
    marginTop: spacing.xxs,
  },
  flashcardLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  flashcardSubtitle: {
    ...typography.caption,
  },
});
