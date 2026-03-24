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

export const EditHabitScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = route.params;
  const { habits, addHabit, editHabit, deleteHabit, themeMode } = useStore();
  
  const habit = habitId ? habits.find(h => h.id === habitId) : null;
  const isEditing = !!habit;

  const [name, setName] = useState(habit?.name || '');
  const [selectedEmoji, setSelectedEmoji] = useState(habit?.emoji || '');
  const [nameError, setNameError] = useState('');

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Editar Hábito' : 'Novo Hábito',
    });
  }, [isEditing]);

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
      Alert.alert('Erro', 'Escolha um emoji');
      return;
    }

    try {
      if (isEditing && habitId) {
        await editHabit(habitId, name, selectedEmoji);
      } else {
        await addHabit(name, selectedEmoji);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o hábito');
    }
  };

  const handleDelete = () => {
    if (!habitId) return;

    Alert.alert(
      'Excluir Hábito',
      'Tem certeza que deseja excluir este hábito? Esta ação não pode ser desfeita.',
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
          placeholder="Ex: Meditar, Ler, Exercitar"
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

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Escolha um emoji</Text>
        <View style={styles.emojiGrid}>
          {EMOJI_OPTIONS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              style={[
                styles.emojiCell,
                {
                  backgroundColor: selectedEmoji === emoji
                    ? `${colors.primary.main}1A`
                    : theme.surface,
                  borderColor: selectedEmoji === emoji
                    ? colors.primary.main
                    : 'transparent',
                },
              ]}
              onPress={() => setSelectedEmoji(emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          { opacity: canSave ? 1 : 0.5 },
        ]}
        onPress={handleSave}
        disabled={!canSave}
        activeOpacity={0.8}
      >
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
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
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
  },
  section: {
    marginBottom: spacing.l,
  },
  label: {
    ...typography.body,
    fontWeight: '500',
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
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  emojiCell: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  saveButton: {
    height: 48,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    height: 48,
    backgroundColor: 'transparent',
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
    height: 48,
    backgroundColor: colors.semantic.error,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  deleteButtonText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
