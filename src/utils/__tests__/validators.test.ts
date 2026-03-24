import { validateHabitName, validateEmoji } from '../validators';

describe('Validators', () => {
  describe('validateHabitName', () => {
    it('should return error for names shorter than 2 characters', () => {
      expect(validateHabitName('')).toBe('Mínimo 2 caracteres');
      expect(validateHabitName('a')).toBe('Mínimo 2 caracteres');
    });

    it('should return error for names longer than 50 characters', () => {
      const longName = 'a'.repeat(51);
      expect(validateHabitName(longName)).toBe('Máximo 50 caracteres');
    });

    it('should return null for valid names', () => {
      expect(validateHabitName('Meditar')).toBeNull();
      expect(validateHabitName('Ex')).toBeNull();
      expect(validateHabitName('a'.repeat(50))).toBeNull();
    });
  });

  describe('validateEmoji', () => {
    it('should return error for empty emoji', () => {
      expect(validateEmoji('')).toBe('Escolha um emoji');
    });

    it('should return null for valid emoji', () => {
      expect(validateEmoji('😊')).toBeNull();
      expect(validateEmoji('💪')).toBeNull();
    });
  });
});
