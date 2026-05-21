import { ReflectionEntry, ConfessionEntry, ExamenSession } from '../store/useExamenStore';

const KEYS = {
  REFLECTIONS: 'examen_reflections',
  CONFESSION_LIST: 'examen_confession_list',
  SESSION: 'examen_session',
  SETTINGS: 'examen_settings',
  HISTORY: 'examen_history',
};

// Helper for parsing JSON safely
function loadData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function saveData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export async function getDatabase(): Promise<any> {
  // No-op for web. Returns a dummy object.
  return {};
}

// --- Reflections ---

export async function markSinnedInDB(commandmentId: number): Promise<void> {
  const reflections = loadData<Record<number, ReflectionEntry>>(KEYS.REFLECTIONS, {});
  const existingText = reflections[commandmentId]?.reflectionText || '';
  reflections[commandmentId] = {
    reflectionText: existingText,
    skipped: false,
    sinned: true,
  };
  saveData(KEYS.REFLECTIONS, reflections);
}

export async function saveReflection(commandmentId: number, text: string): Promise<void> {
  const reflections = loadData<Record<number, ReflectionEntry>>(KEYS.REFLECTIONS, {});
  reflections[commandmentId] = {
    reflectionText: text,
    skipped: false,
    sinned: true,
  };
  saveData(KEYS.REFLECTIONS, reflections);
}

export async function saveSkipped(commandmentId: number): Promise<void> {
  const reflections = loadData<Record<number, ReflectionEntry>>(KEYS.REFLECTIONS, {});
  reflections[commandmentId] = {
    reflectionText: '',
    skipped: true,
    sinned: false,
  };
  saveData(KEYS.REFLECTIONS, reflections);
}

export async function loadAllReflections(): Promise<Record<number, ReflectionEntry>> {
  return loadData<Record<number, ReflectionEntry>>(KEYS.REFLECTIONS, {});
}

export async function clearAllReflections(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.REFLECTIONS);
}

// --- Confession List ---

export async function saveConfessionList(entries: ConfessionEntry[]): Promise<void> {
  saveData(KEYS.CONFESSION_LIST, entries);
}

export async function loadConfessionList(): Promise<ConfessionEntry[]> {
  return loadData<ConfessionEntry[]>(KEYS.CONFESSION_LIST, []);
}

// --- Exam History ---

export type ExamHistoryRecord = {
  id?: number;
  date: string;
  data: string; // JSON string of { sinned: boolean } mapping
};

export async function saveExamToHistory(reflections: Record<number, ReflectionEntry>): Promise<void> {
  const history = loadData<ExamHistoryRecord[]>(KEYS.HISTORY, []);
  
  const dateStr = new Date().toISOString();
  const dataToSave: Record<number, { sinned: boolean }> = {};
  
  for (const [key, value] of Object.entries(reflections)) {
    if (value.sinned || value.skipped) {
      dataToSave[Number(key)] = { sinned: value.sinned };
    }
  }
  
  const newRecord: ExamHistoryRecord = {
    id: history.length + 1,
    date: dateStr,
    data: JSON.stringify(dataToSave)
  };
  
  history.push(newRecord);
  saveData(KEYS.HISTORY, history);
}

export async function loadExamHistory(): Promise<ExamHistoryRecord[]> {
  const history = loadData<ExamHistoryRecord[]>(KEYS.HISTORY, []);
  // Return in descending order (newest first) to match DB behavior
  return history.reverse();
}

// --- Session ---

export async function saveSession(currentCommandmentId: number): Promise<void> {
  const session: ExamenSession = { currentCommandmentId };
  saveData(KEYS.SESSION, session);
}

export async function loadSessionFromDB(): Promise<ExamenSession | null> {
  return loadData<ExamenSession | null>(KEYS.SESSION, null);
}

export async function deleteSession(): Promise<void> {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.SESSION);
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
  saveData(KEYS.SETTINGS, settings);
}

export async function loadSettingsFromDB(): Promise<AppSettings | null> {
  return loadData<AppSettings | null>(KEYS.SETTINGS, null);
}
