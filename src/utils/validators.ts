import { z } from 'zod';

export const habitSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  emoji: z.string().min(1, 'Escolha um emoji'),
});

export type HabitFormData = z.infer<typeof habitSchema>;

/**
 * Valida nome de hábito
 */
export function validateHabitName(name: string): string | null {
  if (name.length < 2) {
    return 'Mínimo 2 caracteres';
  }
  if (name.length > 50) {
    return 'Máximo 50 caracteres';
  }
  return null;
}

/**
 * Valida emoji selecionado
 */
export function validateEmoji(emoji: string): string | null {
  if (!emoji || emoji.length === 0) {
    return 'Escolha um emoji';
  }
  return null;
}
