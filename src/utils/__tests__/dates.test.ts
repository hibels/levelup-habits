import {
  formatDate,
  getTodayString,
  isToday,
  isYesterday,
  daysDifference,
} from '../dates';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-03-15');
      expect(formatDate(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getTodayString', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const today = getTodayString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = getTodayString();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = formatDate(yesterday);
      expect(isYesterday(yesterdayString)).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(isYesterday('2020-01-01')).toBe(false);
    });
  });

  describe('daysDifference', () => {
    it('should calculate difference correctly', () => {
      const diff = daysDifference('2024-01-01', '2024-01-05');
      expect(diff).toBe(4);
    });
  });
});
