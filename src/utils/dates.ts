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

/**
 * Retorna o número ISO da semana de uma data (semana começa na segunda-feira)
 * Formato: "YYYY-Www" ex: "2026-W14"
 */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // 1=seg, 7=dom
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // vai para a quinta da mesma semana ISO
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Retorna a weekKey da semana anterior
 */
export function getPreviousWeekKey(weekKey?: string): string {
  if (!weekKey) {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return getWeekKey(d);
  }
  // Parseia "YYYY-Www" e volta 7 dias a partir de uma quinta da semana
  const [yearStr, weekStr] = weekKey.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);
  // Calcula a quinta da semana informada
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const thursday = new Date(jan1.getTime() + (week - 1) * 7 * 86400000);
  // Vai 7 dias para trás
  thursday.setUTCDate(thursday.getUTCDate() - 7);
  return getWeekKey(thursday);
}

/**
 * Retorna o weekKey atual
 */
export function getCurrentWeekKey(): string {
  return getWeekKey(new Date());
}

/**
 * Retorna os 7 dias (YYYY-MM-DD) da semana corrente ordenados Dom–Sáb.
 * Os mesmos 7 dias ISO (ancorados na segunda) são retornados, apenas
 * reordenados para exibição: domingo aparece primeiro.
 */
export function getCurrentWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=dom, 1=seg...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return formatDate(d);
  });
  // Reorder: move Sunday (last) to front → [Dom, Seg, Ter, Qua, Qui, Sex, Sáb]
  const sunday = dates.pop()!;
  return [sunday, ...dates];
}

/**
 * Retorna todos os dias do mês informado no formato YYYY-MM-DD
 */
export function getMonthDates(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return formatDate(d);
  });
}

/**
 * Rótulos curtos dos dias da semana (começa no domingo)
 */
export const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
export const WEEKDAY_LABELS_FULL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
