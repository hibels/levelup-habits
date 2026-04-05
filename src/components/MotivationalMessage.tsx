import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

const MESSAGES = [
  'Cada check é um passo. Continue.',
  'Consistência supera perfeição.',
  'Um dia de cada vez.',
  'A disciplina é a ponte entre metas e conquistas.',
  'Pequenas vitórias constroem grandes resultados.',
  'Você não precisa ser perfeito, só precisa aparecer.',
  'O hábito de hoje é o resultado de amanhã.',
  'Não quebre a corrente.',
  'Progresso, não perfeição.',
  'O difícil fica fácil com repetição.',
  'Mostre-se hoje mesmo quando não estiver com vontade.',
  'Cada hábito completo é uma promessa que você cumpriu.',
  'Seu eu do futuro vai agradecer.',
  'A mudança começa com um único hábito.',
  'Não é motivação, é comprometimento.',
  'Construa a identidade de quem você quer ser.',
  'O segredo: faça mesmo sem sentir vontade.',
  'Recompense-se com consistência.',
  'Comece pequeno, mantenha sempre.',
  'Bons hábitos são investimentos em si mesmo.',
  'Foco no processo, não no resultado.',
];

interface MotivationalMessageProps {
  isDarkMode: boolean;
}

export const MotivationalMessage: React.FC<MotivationalMessageProps> = ({ isDarkMode }) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  // Mensagem do dia baseada na data (muda diariamente)
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const message = MESSAGES[dayOfYear % MESSAGES.length];

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Ionicons name="sparkles" size={14} color={colors.secondary.main} />
      <Text style={[styles.text, { color: theme.textSecondary }]} numberOfLines={2}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: borderRadius.m,
    borderWidth: 1,
    gap: spacing.xs,
  },
  text: {
    ...typography.caption,
    flex: 1,
    fontStyle: 'italic',
  },
});
