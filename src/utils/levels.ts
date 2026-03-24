import { LevelConfig } from '../types';

// Configuração de níveis
export const LEVELS: LevelConfig[] = [
  { level: 1, xpRequired: 0, title: 'Iniciante' },
  { level: 2, xpRequired: 100, title: 'Aprendiz' },
  { level: 3, xpRequired: 250, title: 'Dedicado' },
  { level: 4, xpRequired: 500, title: 'Persistente' },
  { level: 5, xpRequired: 1000, title: 'Determinado' },
  { level: 6, xpRequired: 1500, title: 'Focado' },
  { level: 7, xpRequired: 2100, title: 'Disciplinado' },
  { level: 8, xpRequired: 2800, title: 'Mestre' },
  { level: 9, xpRequired: 3600, title: 'Lendário' },
  { level: 10, xpRequired: 5000, title: 'Imortal' },
];

export const XP_PER_HABIT_CHECK = 10;
export const MAX_FREE_HABITS = 3;

/**
 * Calcula o nível baseado no XP total
 */
export function calculateLevel(totalXP: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

/**
 * Retorna o XP necessário para o próximo nível
 */
export function getXPForNextLevel(currentLevel: number): number {
  const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
  return nextLevel ? nextLevel.xpRequired : LEVELS[LEVELS.length - 1].xpRequired;
}

/**
 * Retorna o título do nível atual
 */
export function getLevelTitle(level: number): string {
  const config = LEVELS.find(l => l.level === level);
  return config ? config.title : 'Iniciante';
}

/**
 * Retorna o XP atual dentro do nível (para a barra de progresso)
 */
export function getCurrentLevelXP(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelConfig = LEVELS.find(l => l.level === currentLevel);
  return currentLevelConfig ? totalXP - currentLevelConfig.xpRequired : totalXP;
}

/**
 * Retorna o XP necessário para completar o nível atual
 */
export function getXPForCurrentLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelConfig = LEVELS.find(l => l.level === currentLevel);
  const nextLevelConfig = LEVELS.find(l => l.level === currentLevel + 1);

  if (!currentLevelConfig || !nextLevelConfig) {
    return 100;
  }

  return nextLevelConfig.xpRequired - currentLevelConfig.xpRequired;
}
