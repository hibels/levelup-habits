import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getCurrentWeekKey, getCurrentWeekDates } from '../utils/dates';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'WeeklyReview'>;

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

export const WeeklyReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { habits, themeMode, weeklyReviews, saveWeeklyReview, updateWeeklyReview, deleteWeeklyReview } = useStore();

  const reviewId = route.params?.reviewId;
  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  const weekKey = getCurrentWeekKey();
  const weekDates = getCurrentWeekDates();

  // Determina qual review está sendo visualizada
  const targetReview = reviewId
    ? weeklyReviews.find(r => r.id === reviewId)
    : weeklyReviews.find(r => r.weekKey === weekKey);

  const isCurrentWeek = !reviewId;
  const isExisting = !!targetReview;

  const [isEditing, setIsEditing] = useState(!isExisting);
  const [wentWell, setWentWell] = useState(targetReview?.wentWell ?? '');
  const [toImprove, setToImprove] = useState(targetReview?.toImprove ?? '');

  const activeWeekKey = targetReview?.weekKey ?? weekKey;
  const weekNumber = activeWeekKey.split('-W')[1];
  const dateRange = getWeekDateRange(activeWeekKey);

  // Resultados dos hábitos: usa os dados salvos para reviews antigas, recalcula para a semana atual
  const habitResults = isCurrentWeek
    ? habits.map(habit => ({
        habitId: habit.id,
        completed: weekDates.filter(d => habit.completedDates.includes(d)).length,
        goal: habit.weeklyGoal,
      }))
    : (targetReview?.habitResults ?? []);

  const goalsMet = isCurrentWeek
    ? habitResults.filter(r => r.completed >= r.goal).length
    : habitResults.filter(r => r.completed >= r.goal).length;

  const totalHabits = isCurrentWeek ? habits.length : habitResults.length;
  const overallScore = totalHabits > 0 ? Math.round((goalsMet / totalHabits) * 100) : 0;

  const handleSave = async () => {
    if (!wentWell.trim() && !toImprove.trim()) {
      Alert.alert('Atenção', 'Preencha pelo menos um dos campos de reflexão.');
      return;
    }
    if (isExisting && targetReview) {
      await updateWeeklyReview(targetReview.id, { wentWell: wentWell.trim(), toImprove: toImprove.trim() });
      setIsEditing(false);
    } else {
      await saveWeeklyReview({
        weekKey,
        wentWell: wentWell.trim(),
        toImprove: toImprove.trim(),
        habitResults,
      });
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    if (!targetReview) return;
    Alert.alert(
      'Deletar retrospectiva',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            await deleteWeeklyReview(targetReview.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setWentWell(targetReview?.wentWell ?? '');
    setToImprove(targetReview?.toImprove ?? '');
    setIsEditing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Retrospectiva</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Semana {weekNumber} · {dateRange}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isExisting && !isEditing && (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7} style={styles.headerBtn}>
                <Ionicons name="pencil-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} style={styles.headerBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.semantic.error} />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Score geral */}
      <View style={[styles.scoreCard, { backgroundColor: colors.primary.main }]}>
        <Text style={styles.scoreLabel}>Desempenho da semana</Text>
        <Text style={styles.scoreValue}>{overallScore}%</Text>
        <Text style={styles.scoreNote}>
          {goalsMet} de {totalHabits} hábitos com meta atingida
        </Text>
        <View style={styles.scoreBar}>
          <View style={[styles.scoreBarFill, { width: `${overallScore}%` }]} />
        </View>
      </View>

      {/* Resultados por hábito */}
      {habitResults.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Por hábito</Text>
          {habitResults.map(result => {
            const habit = habits.find(h => h.id === result.habitId);
            if (!habit) return null;
            const goalReached = result.completed >= result.goal;
            return (
              <View
                key={result.habitId}
                style={[styles.habitRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: theme.textPrimary }]}>{habit.name}</Text>
                  <View style={styles.habitProgressRow}>
                    <View style={[styles.habitTrack, { backgroundColor: theme.border }]}>
                      <View
                        style={[
                          styles.habitFill,
                          {
                            backgroundColor: goalReached ? colors.primary.main : colors.secondary.main,
                            width: `${Math.min((result.completed / result.goal) * 100, 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.habitCount, { color: theme.textSecondary }]}>
                      {result.completed}/{result.goal}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={goalReached ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={goalReached ? colors.primary.main : theme.disabled}
                />
              </View>
            );
          })}
        </View>
      )}

      {/* Reflexão */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Reflexão</Text>

        {isEditing ? (
          <>
            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Ionicons name="sunny-outline" size={16} color={colors.secondary.main} />
                <Text style={[styles.inputLabelText, { color: theme.textPrimary }]}>
                  O que foi bom esta semana?
                </Text>
              </View>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Ex: Consegui manter a consistência nos exercícios..."
                placeholderTextColor={theme.textSecondary}
                value={wentWell}
                onChangeText={setWentWell}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabel}>
                <Ionicons name="arrow-up-circle-outline" size={16} color={colors.semantic.info} />
                <Text style={[styles.inputLabelText, { color: theme.textPrimary }]}>
                  O que posso melhorar?
                </Text>
              </View>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="Ex: Preciso ser mais consistente na meditação..."
                placeholderTextColor={theme.textSecondary}
                value={toImprove}
                onChangeText={setToImprove}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonRow}>
              {isExisting && (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={handleCancelEdit}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveButton, isExisting && styles.saveButtonFlex]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {isExisting ? 'Salvar alterações' : 'Salvar retrospectiva'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {targetReview?.wentWell ? (
              <View style={styles.reviewBlock}>
                <View style={styles.inputLabel}>
                  <Ionicons name="sunny-outline" size={15} color={colors.secondary.main} />
                  <Text style={[styles.reviewBlockTitle, { color: theme.textSecondary }]}>O que foi bom</Text>
                </View>
                <Text style={[styles.reviewText, { color: theme.textPrimary }]}>{targetReview.wentWell}</Text>
              </View>
            ) : null}
            {targetReview?.toImprove ? (
              <View style={[styles.reviewBlock, targetReview?.wentWell ? { borderTopWidth: 1, borderTopColor: theme.border } : {}]}>
                <View style={styles.inputLabel}>
                  <Ionicons name="arrow-up-circle-outline" size={15} color={colors.semantic.info} />
                  <Text style={[styles.reviewBlockTitle, { color: theme.textSecondary }]}>A melhorar</Text>
                </View>
                <Text style={[styles.reviewText, { color: theme.textPrimary }]}>{targetReview.toImprove}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.m,
    paddingTop: spacing.l,
  },
  title: { ...typography.h2 },
  subtitle: { ...typography.caption, marginTop: 2 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: 2,
  },
  headerBtn: {
    padding: spacing.xxs,
  },
  scoreCard: {
    marginHorizontal: spacing.m,
    padding: spacing.l,
    borderRadius: borderRadius.m,
    alignItems: 'center',
    gap: spacing.xxs,
  },
  scoreLabel: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  scoreValue: { fontSize: 56, fontWeight: '700', color: '#FFFFFF', lineHeight: 64 },
  scoreNote: { ...typography.caption, color: 'rgba(255,255,255,0.8)' },
  scoreBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 3,
  },
  section: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.l,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.m },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    marginBottom: spacing.s,
    gap: spacing.s,
  },
  habitEmoji: { fontSize: 22 },
  habitInfo: { flex: 1, gap: spacing.xxs },
  habitName: { ...typography.body, fontWeight: '600' },
  habitProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  habitTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  habitFill: { height: '100%', borderRadius: 2 },
  habitCount: { ...typography.caption, fontWeight: '500', minWidth: 28, textAlign: 'right' },
  inputGroup: { marginBottom: spacing.m },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
  inputLabelText: { ...typography.body, fontWeight: '600' },
  textArea: {
    borderWidth: 1,
    borderRadius: borderRadius.s,
    padding: spacing.s,
    minHeight: 96,
    ...typography.body,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.xs,
  },
  cancelButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    flex: 1,
    height: 48,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  saveButtonFlex: {
    flex: 1,
  },
  saveButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: borderRadius.m,
    overflow: 'hidden',
  },
  reviewBlock: {
    padding: spacing.m,
    gap: spacing.xs,
  },
  reviewBlockTitle: { ...typography.caption, fontWeight: '600' },
  reviewText: { ...typography.body },
});
