import {
  calculateLevel,
  getXPForNextLevel,
  getLevelTitle,
  getCurrentLevelXP,
  getXPForCurrentLevel,
  LEVELS,
} from '../levels';

describe('Level Utils', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should return level 2 for 100 XP', () => {
      expect(calculateLevel(100)).toBe(2);
    });

    it('should return level 5 for 1500 XP', () => {
      expect(calculateLevel(1500)).toBe(6);
    });

    it('should return max level for very high XP', () => {
      expect(calculateLevel(10000)).toBe(10);
    });
  });

  describe('getXPForNextLevel', () => {
    it('should return correct XP for next level', () => {
      expect(getXPForNextLevel(1)).toBe(100);
      expect(getXPForNextLevel(2)).toBe(250);
      expect(getXPForNextLevel(5)).toBe(1500);
    });

    it('should return max XP for max level', () => {
      expect(getXPForNextLevel(10)).toBe(LEVELS[LEVELS.length - 1].xpRequired);
    });
  });

  describe('getLevelTitle', () => {
    it('should return correct titles', () => {
      expect(getLevelTitle(1)).toBe('Iniciante');
      expect(getLevelTitle(3)).toBe('Dedicado');
      expect(getLevelTitle(10)).toBe('Imortal');
    });

    it('should return Iniciante for invalid level', () => {
      expect(getLevelTitle(999)).toBe('Iniciante');
    });
  });

  describe('getCurrentLevelXP', () => {
    it('should return XP within current level', () => {
      expect(getCurrentLevelXP(0)).toBe(0);
      expect(getCurrentLevelXP(100)).toBe(0); // Level 2 starts at 100
      expect(getCurrentLevelXP(150)).toBe(50); // 50 XP into level 2
    });
  });

  describe('getXPForCurrentLevel', () => {
    it('should return XP needed to complete current level', () => {
      expect(getXPForCurrentLevel(0)).toBe(100); // Level 1: 0-100
      expect(getXPForCurrentLevel(100)).toBe(150); // Level 2: 100-250
    });
  });
});
