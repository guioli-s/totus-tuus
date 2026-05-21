import { getDatabase } from '../database/db';

/**
 * Serviço para indexar a Bíblia Católica (biblia.json) no SQLite.
 * Isso permite buscas rápidas para RAG e versículo diário.
 */

// Lazy-load do JSON (Metro resolve em build-time)
const bibleData: Array<{
  livro: string;
  capitulos: Array<{
    capitulo: number;
    versiculos: Array<{ numero: number; texto: string }>;
  }>;
}> = require('../content/bible/biblia.json');

/**
 * Cria a tabela de versículos indexados se não existir.
 */
export async function createBibleTable(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bible_verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_index INTEGER NOT NULL,
      book_name TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bible_book ON bible_verses(book_index);
    CREATE INDEX IF NOT EXISTS idx_bible_book_chapter ON bible_verses(book_index, chapter);
  `);
}

/**
 * Verifica se a tabela já está populada.
 */
export async function isBiblePopulated(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bible_verses;'
  );
  return (row?.count ?? 0) > 0;
}

/**
 * Popula a tabela com todos os versículos do JSON.
 * Usa batch insert para performance.
 */
export async function populateBibleTable(): Promise<void> {
  const db = await getDatabase();
  
  // Batch insert em transação para performance
  await db.execAsync('BEGIN TRANSACTION;');
  
  try {
    for (let bookIdx = 0; bookIdx < bibleData.length; bookIdx++) {
      const book = bibleData[bookIdx];
      for (const chapter of book.capitulos) {
        for (const verse of chapter.versiculos) {
          await db.runAsync(
            'INSERT INTO bible_verses (book_index, book_name, chapter, verse, text) VALUES (?, ?, ?, ?, ?);',
            [bookIdx, book.livro, chapter.capitulo, verse.numero, verse.texto]
          );
        }
      }
    }
    await db.execAsync('COMMIT;');
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}

/**
 * Inicializa a tabela da Bíblia: cria e popula se necessário.
 */
export async function initBibleDatabase(): Promise<void> {
  await createBibleTable();
  const populated = await isBiblePopulated();
  if (!populated) {
    console.log('[BibleDB] Populando banco com versículos...');
    await populateBibleTable();
    console.log('[BibleDB] Bíblia indexada com sucesso.');
  }
}

/**
 * Retorna um versículo aleatório determinístico (baseado em seed).
 */
export async function getVerseById(id: number): Promise<{
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
} | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    id: number;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>('SELECT id, book_name, chapter, verse, text FROM bible_verses WHERE id = ?;', [id]);
  
  if (!row) return null;
  return {
    id: row.id,
    bookName: row.book_name,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
  };
}

/**
 * Retorna o total de versículos no banco.
 */
export async function getTotalVerses(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM bible_verses;'
  );
  return row?.count ?? 0;
}

/**
 * Busca versículos por texto (busca simples LIKE para RAG).
 * Retorna os N resultados mais relevantes.
 */
export async function searchVerses(query: string, limit: number = 20): Promise<Array<{
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}>> {
  const db = await getDatabase();
  
  // Divide a query em palavras e busca cada uma
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2); // ignora palavras muito curtas
  
  if (words.length === 0) return [];
  
  // Busca versículos que contenham QUALQUER uma das palavras
  const conditions = words.map(() => 'LOWER(text) LIKE ?').join(' OR ');
  const params = words.map(w => `%${w}%`);
  
  const rows = await db.getAllAsync<{
    id: number;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>(
    `SELECT id, book_name, chapter, verse, text FROM bible_verses WHERE ${conditions} LIMIT ?;`,
    [...params, limit]
  );
  
  return rows.map(row => ({
    id: row.id,
    bookName: row.book_name,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
  }));
}

/**
 * Busca todos os versículos de um capítulo específico (para contexto RAG).
 */
export async function getChapterVerses(bookIndex: number, chapter: number): Promise<Array<{
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>(
    'SELECT id, book_name, chapter, verse, text FROM bible_verses WHERE book_index = ? AND chapter = ? ORDER BY verse;',
    [bookIndex, chapter]
  );
  
  return rows.map(row => ({
    id: row.id,
    bookName: row.book_name,
    chapter: row.chapter,
    verse: row.verse,
    text: row.text,
  }));
}

/**
 * Retorna os nomes de todos os livros (para seletor).
 */
export function getBookNames(): string[] {
  return bibleData.map(b => b.livro);
}
