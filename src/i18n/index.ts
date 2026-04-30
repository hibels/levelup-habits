import { getLocales } from 'expo-localization';
import { ptBR } from './pt-BR';
import { enUS } from './en-US';

export type Locale = 'pt-BR' | 'en-US';

export function getLocale(): Locale {
  try {
    const locales = getLocales();
    const lang = locales?.[0]?.languageCode ?? '';
    if (lang.startsWith('pt')) return 'pt-BR';
    return 'en-US';
  } catch {
    return 'pt-BR';
  }
}

export function getTranslations(locale?: Locale) {
  const l = locale ?? getLocale();
  return l === 'pt-BR' ? ptBR : enUS;
}
