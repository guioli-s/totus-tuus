import { getTotalVerses, getVerseById } from './index';

/**
 * Serviço de Versículo Diário.
 * Usa a Bíblia Católica indexada no SQLite para selecionar um versículo
 * determinístico baseado na data atual.
 */

export interface DailyBibleVerse {
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string; // Ex: "Gênesis 1, 1"
}

/**
 * Gera um hash determinístico para uma data (YYYYMMDD).
 * Garante que o mesmo versículo aparece o dia inteiro.
 */
function getDateSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Multiplicadores primos para distribuição melhor
  return (year * 367 + month * 31 + day * 13) >>> 0;
}

/**
 * Retorna o versículo do dia da Bíblia Católica.
 * Determinístico: mesma data = mesmo versículo.
 */
export async function getDailyBibleVerse(date: Date): Promise<DailyBibleVerse | null> {
  const totalVerses = await getTotalVerses();
  if (totalVerses === 0) return null;

  const seed = getDateSeed(date);
  // IDs no SQLite começam em 1
  const verseId = (seed % totalVerses) + 1;

  const verse = await getVerseById(verseId);
  if (!verse) return null;

  return {
    ...verse,
    reference: `${verse.bookName} ${verse.chapter}, ${verse.verse}`,
  };
}
