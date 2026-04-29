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
import { useShallow } from 'zustand/react/shallow';
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

export const HABIT_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#14B8A6', '#F97316',
  '#06B6D4', '#84CC16', '#6B7280', '#1D4ED8',
];

const ICON_OPTIONS: { name: string; ionicon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'barbell-outline', ionicon: 'barbell-outline' },
  { name: 'bicycle-outline', ionicon: 'bicycle-outline' },
  { name: 'walk-outline', ionicon: 'walk-outline' },
  { name: 'fitness-outline', ionicon: 'fitness-outline' },
  { name: 'water-outline', ionicon: 'water-outline' },
  { name: 'nutrition-outline', ionicon: 'nutrition-outline' },
  { name: 'bed-outline', ionicon: 'bed-outline' },
  { name: 'heart-outline', ionicon: 'heart-outline' },
  { name: 'medkit-outline', ionicon: 'medkit-outline' },
  { name: 'happy-outline', ionicon: 'happy-outline' },
  { name: 'book-outline', ionicon: 'book-outline' },
  { name: 'school-outline', ionicon: 'school-outline' },
  { name: 'pencil-outline', ionicon: 'pencil-outline' },
  { name: 'code-slash-outline', ionicon: 'code-slash-outline' },
  { name: 'language-outline', ionicon: 'language-outline' },
  { name: 'mic-outline', ionicon: 'mic-outline' },
  { name: 'musical-notes-outline', ionicon: 'musical-notes-outline' },
  { name: 'color-palette-outline', ionicon: 'color-palette-outline' },
  { name: 'camera-outline', ionicon: 'camera-outline' },
  { name: 'game-controller-outline', ionicon: 'game-controller-outline' },
  { name: 'people-outline', ionicon: 'people-outline' },
  { name: 'call-outline', ionicon: 'call-outline' },
  { name: 'mail-outline', ionicon: 'mail-outline' },
  { name: 'home-outline', ionicon: 'home-outline' },
  { name: 'car-outline', ionicon: 'car-outline' },
  { name: 'briefcase-outline', ionicon: 'briefcase-outline' },
  { name: 'cash-outline', ionicon: 'cash-outline' },
  { name: 'card-outline', ionicon: 'card-outline' },
  { name: 'trending-up-outline', ionicon: 'trending-up-outline' },
  { name: 'stats-chart-outline', ionicon: 'stats-chart-outline' },
  { name: 'planet-outline', ionicon: 'planet-outline' },
  { name: 'leaf-outline', ionicon: 'leaf-outline' },
  { name: 'flower-outline', ionicon: 'flower-outline' },
  { name: 'sunny-outline', ionicon: 'sunny-outline' },
  { name: 'moon-outline', ionicon: 'moon-outline' },
  { name: 'cloud-outline', ionicon: 'cloud-outline' },
  { name: 'snow-outline', ionicon: 'snow-outline' },
  { name: 'flame-outline', ionicon: 'flame-outline' },
  { name: 'rocket-outline', ionicon: 'rocket-outline' },
  { name: 'trophy-outline', ionicon: 'trophy-outline' },
  { name: 'ribbon-outline', ionicon: 'ribbon-outline' },
  { name: 'star-outline', ionicon: 'star-outline' },
  { name: 'diamond-outline', ionicon: 'diamond-outline' },
  { name: 'shield-outline', ionicon: 'shield-outline' },
  { name: 'key-outline', ionicon: 'key-outline' },
  { name: 'bulb-outline', ionicon: 'bulb-outline' },
  { name: 'alarm-outline', ionicon: 'alarm-outline' },
  { name: 'timer-outline', ionicon: 'timer-outline' },
  { name: 'checkmark-circle-outline', ionicon: 'checkmark-circle-outline' },
  { name: 'infinite-outline', ionicon: 'infinite-outline' },
];

const WEEKLY_GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const WEEKDAY_SHORT = ['1×', '2×', '3×', '4×', '5×', '6×', 'Todo dia'];

type IconTab = 'emoji' | 'icons';

export const EditHabitScreen: React.FC<Props> = ({ route, navigation }) => {
  const { habitId } = route.params;
  const { habits, addHabit, editHabit, deleteHabit, themeMode, isPremium } = useStore(
    useShallow(state => ({
      habits: state.habits,
      addHabit: state.addHabit,
      editHabit: state.editHabit,
      deleteHabit: state.deleteHabit,
      themeMode: state.themeMode,
      isPremium: state.isPremium,
    }))
  );

  const habit = habitId ? habits.find(h => h.id === habitId) : null;
  const isEditing = !!habit;

  const [name, setName] = useState(habit?.name || '');
  const [selectedEmoji, setSelectedEmoji] = useState(habit?.emoji || '');
  const [selectedIconName, setSelectedIconName] = useState(habit?.iconName || '');
  const [selectedColor, setSelectedColor] = useState(habit?.color || '');
  const [weeklyGoal, setWeeklyGoal] = useState(habit?.weeklyGoal ?? 7);
  const [nameError, setNameError] = useState('');
  const [iconTab, setIconTab] = useState<IconTab>('emoji');

  const isDarkMode = themeMode === 'dark';
  const theme = isDarkMode ? colors.dark : colors.light;

  const activeColor = selectedColor || colors.primary.main;

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
    if (!selectedEmoji && !selectedIconName) {
      Alert.alert('Atenção', 'Escolha um emoji ou ícone para o hábito');
      return;
    }

    const emoji = selectedEmoji || '⭐';
    const color = selectedColor || undefined;
    const iconName = selectedIconName || undefined;

    try {
      if (isEditing && habitId) {
        await editHabit(habitId, name, emoji, weeklyGoal, color, iconName);
      } else {
        await addHabit(name, emoji, weeklyGoal, color, iconName);
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

  const handleColorSelect = (color: string) => {
    if (!isPremium) {
      navigation.navigate('Paywall');
      return;
    }
    setSelectedColor(prev => (prev === color ? '' : color));
  };

  const handleIconTabPress = (tab: IconTab) => {
    if (tab === 'icons' && !isPremium) {
      navigation.navigate('Paywall');
      return;
    }
    setIconTab(tab);
  };

  const canSave = name.length >= 2 && name.length <= 50 && (selectedEmoji || selectedIconName);

  const previewEmoji = iconTab === 'emoji' ? selectedEmoji : '';
  const previewIconName = iconTab === 'icons' ? selectedIconName : '';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Preview card */}
      <View
        testID="preview-card"
        style={[
          styles.previewCard,
          { backgroundColor: theme.card, borderColor: `${activeColor}40` },
        ]}
      >
        <View style={[styles.previewColorBar, { backgroundColor: activeColor }]} />
        <View style={styles.previewContent}>
          {previewIconName ? (
            <Ionicons
              name={previewIconName as keyof typeof Ionicons.glyphMap}
              size={24}
              color={activeColor}
              style={styles.previewIcon}
            />
          ) : (
            <Text style={styles.previewEmoji}>{previewEmoji || '⭐'}</Text>
          )}
          <Text style={[styles.previewName, { color: theme.textPrimary }]} numberOfLines={1}>
            {name || 'Nome do hábito'}
          </Text>
        </View>
      </View>

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
                      ? activeColor
                      : theme.surface,
                    borderColor: isSelected ? activeColor : theme.border,
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

      {/* Cor */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Cor</Text>
          {!isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="lock-closed" size={10} color={colors.secondary.main} />
              <Text style={[styles.premiumBadgeText, { color: colors.secondary.main }]}>Premium</Text>
            </View>
          )}
        </View>
        <View style={styles.colorGrid}>
          {HABIT_COLORS.map(color => {
            const isSelected = selectedColor === color;
            return (
              <TouchableOpacity
                key={color}
                testID={`color-${color}`}
                style={[
                  styles.colorCell,
                  { backgroundColor: color, opacity: isPremium ? 1 : 0.35 },
                  isSelected && styles.colorCellSelected,
                ]}
                onPress={() => handleColorSelect(color)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
                {!isPremium && !isSelected && (
                  <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Ícone */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Ícone</Text>
        <View style={[styles.tabBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              iconTab === 'emoji' && { backgroundColor: activeColor },
            ]}
            onPress={() => handleIconTabPress('emoji')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: iconTab === 'emoji' ? '#FFFFFF' : theme.textSecondary }]}>
              Emoji
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              iconTab === 'icons' && isPremium && { backgroundColor: activeColor },
            ]}
            onPress={() => handleIconTabPress('icons')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, { color: iconTab === 'icons' && isPremium ? '#FFFFFF' : theme.textSecondary }]}>
              Ícones
            </Text>
            {!isPremium && (
              <Ionicons name="lock-closed" size={10} color={colors.secondary.main} style={{ marginLeft: 3 }} />
            )}
          </TouchableOpacity>
        </View>

        {iconTab === 'emoji' && (
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiCell,
                  {
                    backgroundColor: selectedEmoji === emoji
                      ? `${activeColor}18`
                      : theme.surface,
                    borderColor: selectedEmoji === emoji
                      ? activeColor
                      : 'transparent',
                  },
                ]}
                onPress={() => {
                  setSelectedEmoji(emoji);
                  setSelectedIconName('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {iconTab === 'icons' && isPremium && (
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map(icon => (
              <TouchableOpacity
                key={icon.name}
                testID={`icon-${icon.name}`}
                style={[
                  styles.iconCell,
                  {
                    backgroundColor: selectedIconName === icon.name
                      ? `${activeColor}18`
                      : theme.surface,
                    borderColor: selectedIconName === icon.name
                      ? activeColor
                      : 'transparent',
                  },
                ]}
                onPress={() => {
                  setSelectedIconName(icon.name);
                  setSelectedEmoji('');
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={icon.ionicon}
                  size={24}
                  color={selectedIconName === icon.name ? activeColor : theme.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Salvar */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: activeColor, opacity: canSave ? 1 : 0.4 }]}
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
  previewCard: {
    marginBottom: spacing.l,
    borderWidth: 1,
    borderRadius: borderRadius.m,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  previewColorBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  previewEmoji: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  previewIcon: {
    marginRight: spacing.xs,
  },
  previewName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    marginBottom: spacing.l,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.secondary.main}18`,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  colorCell: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCellSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: borderRadius.s,
    overflow: 'hidden',
    marginBottom: spacing.s,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    rowGap: spacing.s,
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    rowGap: spacing.s,
  },
  iconCell: {
    width: 52,
    height: 52,
    borderWidth: 2,
    borderRadius: borderRadius.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    height: 48,
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
