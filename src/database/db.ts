import * as SQLite from 'expo-sqlite';
import { ReflectionEntry, ConfessionEntry, ExamenSession } from '../store/useExamenStore';

const DB_NAME = 'examen.db';
let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reflections (
        commandment_id INTEGER PRIMARY KEY,
        text TEXT NOT NULL DEFAULT '',
        skipped INTEGER NOT NULL DEFAULT 0,
        sinned INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS confession_list (
        commandment_id INTEGER PRIMARY KEY,
        commandment_title TEXT NOT NULL,
        reflection TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS session (
        id INTEGER PRIMARY KEY,
        current_commandment_id INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS app_settings (
        id INTEGER PRIMARY KEY,
        theme TEXT NOT NULL DEFAULT 'dark',
        text_scale TEXT NOT NULL DEFAULT 'medium'
      );
      CREATE TABLE IF NOT EXISTS exam_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        data TEXT NOT NULL
      );
    `);
    // Migrações seguras para instâncias antigas
    try {
      await db.execAsync('ALTER TABLE reflections ADD COLUMN skipped INTEGER NOT NULL DEFAULT 0;');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE reflections ADD COLUMN sinned INTEGER NOT NULL DEFAULT 0;');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE app_settings ADD COLUMN last_bible_book INTEGER NOT NULL DEFAULT 0;');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE app_settings ADD COLUMN last_bible_chapter INTEGER NOT NULL DEFAULT 0;');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE app_settings ADD COLUMN daily_date TEXT NOT NULL DEFAULT "";');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE app_settings ADD COLUMN daily_verse_id INTEGER NOT NULL DEFAULT 0;');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE app_settings ADD COLUMN daily_purpose TEXT NOT NULL DEFAULT "";');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE app_settings ADD COLUMN daily_completed INTEGER NOT NULL DEFAULT 0;');
    } catch (_) {}
    try {
      await db.execAsync('ALTER TABLE app_settings ADD COLUMN daily_adapted INTEGER NOT NULL DEFAULT 0;');
    } catch (_) {}
  }
  return db;
}

// --- Reflections ---

/** Marca como pecado imediatamente ao clicar "Eu pequei", preserva texto existente */
export async function markSinnedInDB(commandmentId: number): Promise<void> {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<{ text: string }>(
    'SELECT text FROM reflections WHERE commandment_id = ?;',
    [commandmentId]
  );
  await database.runAsync(
    `INSERT OR REPLACE INTO reflections (commandment_id, text, skipped, sinned) VALUES (?, ?, 0, 1);`,
    [commandmentId, existing?.text ?? '']
  );
}

/** Salva o texto do exame (sinned já é true, foi marcado antes) */
export async function saveReflection(commandmentId: number, text: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO reflections (commandment_id, text, skipped, sinned) VALUES (?, ?, 0, 1);`,
    [commandmentId, text]
  );
}

export async function saveSkipped(commandmentId: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO reflections (commandment_id, text, skipped, sinned) VALUES (?, '', 1, 0);`,
    [commandmentId]
  );
}

export async function loadAllReflections(): Promise<Record<number, ReflectionEntry>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    commandment_id: number;
    text: string;
    skipped: number;
    sinned: number;
  }>('SELECT commandment_id, text, skipped, sinned FROM reflections;');

  const result: Record<number, ReflectionEntry> = {};
  for (const row of rows) {
    result[row.commandment_id] = {
      reflectionText: row.text,
      skipped: row.skipped === 1,
      sinned: row.sinned === 1,
    };
  }
  return result;
}

export async function clearAllReflections(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM reflections;');
}

// --- Confession List ---

export async function saveConfessionList(entries: ConfessionEntry[]): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM confession_list;');
  for (const entry of entries) {
    await database.runAsync(
      `INSERT INTO confession_list (commandment_id, commandment_title, reflection) VALUES (?, ?, ?);`,
      [entry.commandmentId, entry.commandmentTitle, entry.reflection]
    );
  }
}

export async function loadConfessionList(): Promise<ConfessionEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    commandment_id: number;
    commandment_title: string;
    reflection: string;
  }>('SELECT commandment_id, commandment_title, reflection FROM confession_list ORDER BY commandment_id;');
  return rows.map((row) => ({
    commandmentId: row.commandment_id,
    commandmentTitle: row.commandment_title,
    reflection: row.reflection,
  }));
}

// --- Exam History ---

export type ExamHistoryRecord = {
  id?: number;
  date: string;
  data: string; // JSON string of ReflectionEntry objects
};

export async function saveExamToHistory(reflections: Record<number, ReflectionEntry>): Promise<void> {
  const database = await getDatabase();
  const dateStr = new Date().toISOString();
  // Filtrar apenas os mandamentos respondidos para não lotar o banco
  const dataToSave: Record<number, { sinned: boolean }> = {};
  for (const [key, value] of Object.entries(reflections)) {
    if (value.sinned || value.skipped) {
      dataToSave[Number(key)] = { sinned: value.sinned };
    }
  }
  await database.runAsync(
    `INSERT INTO exam_history (date, data) VALUES (?, ?);`,
    [dateStr, JSON.stringify(dataToSave)]
  );
}

export async function loadExamHistory(): Promise<ExamHistoryRecord[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ id: number; date: string; data: string }>(
    'SELECT id, date, data FROM exam_history ORDER BY id DESC;'
  );
  return rows;
}

// --- Session ---

export async function saveSession(currentCommandmentId: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM session;');
  await database.runAsync(
    'INSERT INTO session (id, current_commandment_id) VALUES (1, ?);',
    [currentCommandmentId]
  );
}

export async function loadSessionFromDB(): Promise<ExamenSession | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ current_commandment_id: number }>(
    'SELECT current_commandment_id FROM session WHERE id = 1;'
  );
  return row ? { currentCommandmentId: row.current_commandment_id } : null;
}

export async function deleteSession(): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM session;');
}

// --- Settings ---

export interface AppSettings {
  theme: 'light' | 'dark';
  textScale: 'small' | 'medium' | 'large';
  lastBibleBook?: number;
  lastBibleChapter?: number;
  dailyDate?: string;
  dailyVerseId?: number;
  dailyPurpose?: string;
  dailyCompleted?: boolean;
  dailyAdapted?: boolean;
}

export async function saveSettingsToDB(settings: AppSettings): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO app_settings 
      (id, theme, text_scale, last_bible_book, last_bible_chapter, daily_date, daily_verse_id, daily_purpose, daily_completed, daily_adapted) 
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      settings.theme, 
      settings.textScale, 
      settings.lastBibleBook ?? 0, 
      settings.lastBibleChapter ?? 0,
      settings.dailyDate ?? '',
      settings.dailyVerseId ?? 0,
      settings.dailyPurpose ?? '',
      settings.dailyCompleted ? 1 : 0,
      settings.dailyAdapted ? 1 : 0
    ]
  );
}

export async function loadSettingsFromDB(): Promise<AppSettings | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ 
    theme: string; 
    text_scale: string; 
    last_bible_book: number; 
    last_bible_chapter: number;
    daily_date: string;
    daily_verse_id: number;
    daily_purpose: string;
    daily_completed: number;
    daily_adapted: number;
  }>(
    'SELECT theme, text_scale, last_bible_book, last_bible_chapter, daily_date, daily_verse_id, daily_purpose, daily_completed, daily_adapted FROM app_settings WHERE id = 1;'
  );
  if (row) {
    return {
      theme: row.theme as 'light' | 'dark',
      textScale: row.text_scale as 'small' | 'medium' | 'large',
      lastBibleBook: row.last_bible_book ?? 0,
      lastBibleChapter: row.last_bible_chapter ?? 0,
      dailyDate: row.daily_date ?? '',
      dailyVerseId: row.daily_verse_id ?? 0,
      dailyPurpose: row.daily_purpose ?? '',
      dailyCompleted: row.daily_completed === 1,
      dailyAdapted: row.daily_adapted === 1,
    };
  }
  return null;
}
