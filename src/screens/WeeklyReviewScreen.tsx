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

export const WeeklyReviewScreen: React.FC<Props> = ({ navigation }) => {
  const { habits, themeMode, weeklyReviews, saveWeeklyReview } = useStore();

  const [wentWell, setWentWell] = useState('');
  const [toImprove, setToImprove] = useState('');

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  const weekKey = getCurrentWeekKey();
  const weekDates = getCurrentWeekDates();

  // Verifica se já existe review desta semana
  const existingReview = weeklyReviews.find(r => r.weekKey === weekKey);

  const habitResults = habits.map(habit => {
    const completed = weekDates.filter(d => habit.completedDates.includes(d)).length;
    return { habitId: habit.id, completed, goal: habit.weeklyGoal };
  });

  const handleSave = async () => {
    if (!wentWell.trim() && !toImprove.trim()) {
      Alert.alert('Atenção', 'Preencha pelo menos um dos campos de reflexão.');
      return;
    }

    await saveWeeklyReview({
      weekKey,
      wentWell: wentWell.trim(),
      toImprove: toImprove.trim(),
      habitResults,
    });

    Alert.alert(
      'Review salvo!',
      'Sua retrospectiva da semana foi registrada.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const weekNumber = weekKey.split('-W')[1];
  const goalsMet = habitResults.filter(r => r.completed >= r.goal).length;
  const overallScore = habits.length > 0
    ? Math.round((goalsMet / habits.length) * 100)
    : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Retrospectiva</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Semana {weekNumber}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Score geral */}
      <View style={[styles.scoreCard, { backgroundColor: colors.primary.main }]}>
        <Text style={styles.scoreLabel}>Desempenho da semana</Text>
        <Text style={styles.scoreValue}>{overallScore}%</Text>
        <Text style={styles.scoreNote}>
          {goalsMet} de {habits.length} hábitos com meta atingida
        </Text>
        <View style={styles.scoreBar}>
          <View style={[styles.scoreBarFill, { width: `${overallScore}%` }]} />
        </View>
      </View>

      {/* Resultados por hábito */}
      {habits.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Por hábito</Text>
          {habits.map(habit => {
            const result = habitResults.find(r => r.habitId === habit.id)!;
            const goalReached = result.completed >= result.goal;
            return (
              <View
                key={habit.id}
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
      {!existingReview ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Reflexão</Text>

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

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Ionicons name="save-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Salvar Retrospectiva</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Sua Reflexão</Text>
          <View style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {existingReview.wentWell ? (
              <View style={styles.reviewBlock}>
                <View style={styles.inputLabel}>
                  <Ionicons name="sunny-outline" size={15} color={colors.secondary.main} />
                  <Text style={[styles.reviewBlockTitle, { color: theme.textSecondary }]}>O que foi bom</Text>
                </View>
                <Text style={[styles.reviewText, { color: theme.textPrimary }]}>{existingReview.wentWell}</Text>
              </View>
            ) : null}
            {existingReview.toImprove ? (
              <View style={styles.reviewBlock}>
                <View style={styles.inputLabel}>
                  <Ionicons name="arrow-up-circle-outline" size={15} color={colors.semantic.info} />
                  <Text style={[styles.reviewBlockTitle, { color: theme.textSecondary }]}>A melhorar</Text>
                </View>
                <Text style={[styles.reviewText, { color: theme.textPrimary }]}>{existingReview.toImprove}</Text>
              </View>
            ) : null}
          </View>
        </View>
      )}
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
  subtitle: { ...typography.body, marginTop: 2 },
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
  saveButton: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
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
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    gap: spacing.xs,
  },
  reviewBlockTitle: { ...typography.caption, fontWeight: '600' },
  reviewText: { ...typography.body },
});
