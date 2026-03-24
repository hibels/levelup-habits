/**
 * Formata uma data para o formato YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * Retorna a data de ontem no formato YYYY-MM-DD
 */
export function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayString();
}

/**
 * Verifica se uma data é ontem
 */
export function isYesterday(dateString: string): boolean {
  return dateString === getYesterdayString();
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysDifference(date1String: string, date2String: string): number {
  const date1 = new Date(date1String);
  const date2 = new Date(date2String);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
