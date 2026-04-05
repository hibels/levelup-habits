import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { colors, spacing, typography, borderRadius } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'EditHabit'>;

const EMOJI_OPTIONS = [
  '😊', '💪', '📚', '🧘', '💧',
  '🏃', '🎯', '✍️', '🌱', '🍎',
  '🎨', '💼', '🎵', '🧠', '❤️',
  '🌟', '🔥', '⚡', '🚀', '🎮',
];

const WEEKLY_GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const WEEKDAY_SHORT = ['1×', '2×', '3×', '4×', '5×', '6×', 'Todo dia'];

export const EditHabitScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = route.params;
  const { habits, addHabit, editHabit, deleteHabit, themeMode } = useStore();

  const habit = habitId ? habits.find(h => h.id === habitId) : null;
  const isEditing = !!habit;

  const [name, setName] = useState(habit?.name || '');
  const [selectedEmoji, setSelectedEmoji] = useState(habit?.emoji || '');
  const [weeklyGoal, setWeeklyGoal] = useState(habit?.weeklyGoal ?? 7);
  const [nameError, setNameError] = useState('');

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Hábito' : 'Novo Hábito',
    });
  }, [isEditing, navigation]);

  const validateName = (value: string) => {
    if (value.length < 2) {
      setNameError('Mínimo 2 caracteres');
      return false;
    }
    if (value.length > 50) {
      setNameError('Máximo 50 caracteres');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateName(name)) return;
    if (!selectedEmoji) {
      Alert.alert('Atenção', 'Escolha um emoji para o hábito');
      return;
    }

    try {
      if (isEditing && habitId) {
        await editHabit(habitId, name, selectedEmoji, weeklyGoal);
      } else {
        await addHabit(name, selectedEmoji, weeklyGoal);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o hábito');
    }
  };

  const handleDelete = () => {
    if (!habitId) return;

    Alert.alert(
      'Excluir Hábito',
      'Tem certeza? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habitId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const canSave = name.length >= 2 && name.length <= 50 && selectedEmoji;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Nome */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nome do Hábito</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: nameError ? colors.semantic.error : theme.border,
              color: theme.textPrimary,
            },
          ]}
          placeholder="Ex: Meditar, Ler, Exercitar..."
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={value => {
            setName(value);
            validateName(value);
          }}
          maxLength={50}
        />
        {nameError ? (
          <Text style={styles.errorText}>{nameError}</Text>
        ) : null}
      </View>

      {/* Meta semanal */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Meta semanal
        </Text>
        <Text style={[styles.goalHint, { color: theme.textSecondary }]}>
          Quantas vezes por semana você quer fazer este hábito?
        </Text>
        <View style={styles.goalRow}>
          {WEEKLY_GOAL_OPTIONS.map((days, index) => {
            const isSelected = weeklyGoal === days;
            return (
              <TouchableOpacity
                key={days}
                style={[
                  styles.goalOption,
                  {
                    backgroundColor: isSelected
                      ? colors.primary.main
                      : theme.surface,
                    borderColor: isSelected ? colors.primary.main : theme.border,
                  },
                ]}
                onPress={() => setWeeklyGoal(days)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.goalOptionText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {WEEKDAY_SHORT[index]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Emoji */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Ícone</Text>
        <View style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiCell,
                {
                  backgroundColor: selectedEmoji === emoji
                    ? `${colors.primary.main}18`
                    : theme.surface,
                  borderColor: selectedEmoji === emoji
                    ? colors.primary.main
                    : 'transparent',
                },
              ]}
              onPress={() => setSelectedEmoji(emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Salvar */}
      <TouchableOpacity
        style={[styles.saveButton, { opacity: canSave ? 1 : 0.4 }]}
        onPress={handleSave}
        disabled={!canSave}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: theme.border }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={[styles.cancelButtonText, { color: theme.textPrimary }]}>Cancelar</Text>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Excluir Hábito</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.m,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    paddingHorizontal: spacing.s,
    borderWidth: 1,
    borderRadius: borderRadius.s,
    ...typography.bodyLarge,
  },
  errorText: {
    ...typography.caption,
    color: colors.semantic.error,
    marginTop: spacing.xxs,
  },
  goalHint: {
    ...typography.caption,
    marginBottom: spacing.s,
  },
  goalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  goalOption: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.s,
    borderWidth: 1,
    minWidth: 52,
    alignItems: 'center',
  },
  goalOptionText: {
    ...typography.caption,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  emojiCell: {
    width: 52,
    height: 52,
    borderWidth: 2,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 28,
  },
  saveButton: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  saveButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  cancelButtonText: {
    ...typography.bodyLarge,
  },
  deleteButton: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: colors.semantic.error,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  deleteButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
