/**
 * Web implementation of the Bible Database Service.
 * Since sqlite doesn't work on the web, this service simply loads the bible JSON
 * into memory and performs array filtering for searches. 
 * Since the JSON is relatively small (~5MB), this works fine in modern browsers.
 */

const bibleData: Array<{
  livro: string;
  capitulos: Array<{
    capitulo: number;
    versiculos: Array<{ numero: number; texto: string }>;
  }>;
}> = require('../content/bible/biblia.json');

// Flat list of all verses built lazily on first access
let flatVerses: Array<{
  id: number;
  book_index: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}> | null = null;

function getFlatVerses() {
  if (flatVerses) return flatVerses;
  
  flatVerses = [];
  let currentId = 1;
  
  for (let bookIdx = 0; bookIdx < bibleData.length; bookIdx++) {
    const book = bibleData[bookIdx];
    for (const chapter of book.capitulos) {
      for (const verse of chapter.versiculos) {
        flatVerses.push({
          id: currentId++,
          book_index: bookIdx,
          bookName: book.livro,
          chapter: chapter.capitulo,
          verse: verse.numero,
          text: verse.texto,
        });
      }
    }
  }
  
  return flatVerses;
}

export async function createBibleTable(): Promise<void> {
  // No-op on web
}

export async function isBiblePopulated(): Promise<boolean> {
  // Always true on web since we load from JSON
  return true;
}

export async function populateBibleTable(): Promise<void> {
  // No-op on web
}

export async function initBibleDatabase(): Promise<void> {
  // Pre-load the flat verses list into memory
  getFlatVerses();
}

export async function getVerseById(id: number): Promise<{
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
} | null> {
  const verses = getFlatVerses();
  // id is 1-indexed, array is 0-indexed
  const verse = verses[id - 1];
  
  if (!verse || verse.id !== id) {
    // Fallback if ID doesn't match index for some reason
    const found = verses.find(v => v.id === id);
    if (!found) return null;
    return {
      id: found.id,
      bookName: found.bookName,
      chapter: found.chapter,
      verse: found.verse,
      text: found.text
    };
  }
  
  return {
    id: verse.id,
    bookName: verse.bookName,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text
  };
}

export async function getTotalVerses(): Promise<number> {
  return getFlatVerses().length;
}

export async function searchVerses(query: string, limit: number = 20): Promise<Array<{
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}>> {
  const verses = getFlatVerses();
  
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);
    
  if (words.length === 0) return [];
  
  const results = [];
  
  for (const verse of verses) {
    const textLower = verse.text.toLowerCase();
    // Match ANY word (same as SQLite OR logic used in the native implementation)
    const matches = words.some(w => textLower.includes(w));
    
    if (matches) {
      results.push({
        id: verse.id,
        bookName: verse.bookName,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text
      });
      
      if (results.length >= limit) {
        break;
      }
    }
  }
  
  return results;
}

export async function getChapterVerses(bookIndex: number, chapter: number): Promise<Array<{
  id: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}>> {
  const verses = getFlatVerses();
  
  return verses
    .filter(v => v.book_index === bookIndex && v.chapter === chapter)
    .map(v => ({
      id: v.id,
      bookName: v.bookName,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text
    }));
}

export function getBookNames(): string[] {
  return bibleData.map(b => b.livro);
}
