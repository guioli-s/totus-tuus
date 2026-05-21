import { VERSES, PURPOSES, Verse } from '../content/dailyContent';

/**
 * Retorna um número determinístico para uma data específica (YYYYMMDD).
 */
function getDateHash(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  return year * 10000 + month * 100 + day; // ex: 20260422
}

/**
 * Retorna sempre o mesmo versículo para a mesma data.
 * Se houver um topThemes, tenta encontrar um versículo associado 70% das vezes.
 */
export function getDailyVerse(date: Date, topThemes: string[] = []): { verse: Verse; isAdapted: boolean } {
  const hash = getDateHash(date);
  
  if (topThemes.length > 0) {
    // 70% das vezes usa o tema dominante, 30% usa geral
    const useAdapted = hash % 100 < 70;
    if (useAdapted) {
      // Tenta encontrar versículos que batem com os top themes
      const adaptedVerses = VERSES.filter(v => topThemes.includes(v.theme));
      if (adaptedVerses.length > 0) {
        const index = hash % adaptedVerses.length;
        return { verse: adaptedVerses[index], isAdapted: true };
      }
    }
  }

  // Fallback geral (ou 30% das vezes)
  const index = hash % VERSES.length;
  return { verse: VERSES[index], isAdapted: false };
}

/**
 * Retorna sempre o mesmo propósito para a mesma data e tema.
 */
export function getDailyPurpose(theme: string, date: Date): string {
  const hash = getDateHash(date);
  const themePurposes = PURPOSES[theme] || ["Reze um Pai Nosso."]; // Fallback
  const index = hash % themePurposes.length;
  return themePurposes[index];
}
