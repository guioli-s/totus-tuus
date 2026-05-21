import { create } from 'zustand';
import { getDailyVerse, getDailyPurpose } from '../utils/daily';
import { saveSettingsToDB, loadExamHistory } from '../database';
import { calculateSpiritualProfile, getTopThemes } from '../utils/spiritualProfile';

interface SettingsState {
  theme: 'light' | 'dark';
  textScale: 'small' | 'medium' | 'large';
  lastBibleBook: number;
  lastBibleChapter: number;
  dailyDate: string;
  dailyVerseId: number;
  dailyPurpose: string;
  dailyCompleted: boolean;
  dailyAdapted: boolean;

  setTheme: (theme: 'light' | 'dark') => void;
  setTextScale: (scale: 'small' | 'medium' | 'large') => void;
  setBibleState: (book: number, chapter: number) => void;
  completeDailyPurpose: () => void;
  checkAndGenerateDaily: () => Promise<void>;
  loadSettings: (settings: { 
    theme: 'light' | 'dark'; 
    textScale: 'small' | 'medium' | 'large'; 
    lastBibleBook?: number; 
    lastBibleChapter?: number;
    dailyDate?: string;
    dailyVerseId?: number;
    dailyPurpose?: string;
    dailyCompleted?: boolean;
    dailyAdapted?: boolean;
  }) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark', // default
  textScale: 'medium', // default
  lastBibleBook: 0,
  lastBibleChapter: 0,
  dailyDate: '',
  dailyVerseId: 0,
  dailyPurpose: '',
  dailyCompleted: false,
  dailyAdapted: false,

  setTheme: (theme) => set({ theme }),
  setTextScale: (textScale) => set({ textScale }),
  setBibleState: (lastBibleBook, lastBibleChapter) => set({ lastBibleBook, lastBibleChapter }),
  
  completeDailyPurpose: () => {
    set({ dailyCompleted: true });
    // Salva o estado silenciosamente no banco
    const state = get();
    saveSettingsToDB({
      theme: state.theme,
      textScale: state.textScale,
      lastBibleBook: state.lastBibleBook,
      lastBibleChapter: state.lastBibleChapter,
      dailyDate: state.dailyDate,
      dailyVerseId: state.dailyVerseId,
      dailyPurpose: state.dailyPurpose,
      dailyCompleted: true,
      dailyAdapted: state.dailyAdapted,
    }).catch(console.error);
  },

  checkAndGenerateDaily: async () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const state = get();

    if (state.dailyDate !== dateString) {
      let topThemes: string[] = [];
      try {
        const history = await loadExamHistory();
        const profile = calculateSpiritualProfile(history);
        topThemes = getTopThemes(profile);
      } catch (e) {
        console.error('Erro ao calcular perfil espiritual:', e);
      }

      const { verse, isAdapted } = getDailyVerse(today, topThemes);
      const purpose = getDailyPurpose(verse.theme, today);
      
      const newState = {
        dailyDate: dateString,
        dailyVerseId: verse.id,
        dailyPurpose: purpose,
        dailyCompleted: false,
        dailyAdapted: isAdapted,
      };
      
      set(newState);
      
      saveSettingsToDB({
        theme: state.theme,
        textScale: state.textScale,
        lastBibleBook: state.lastBibleBook,
        lastBibleChapter: state.lastBibleChapter,
        ...newState,
      }).catch(console.error);
    }
  },

  loadSettings: (settings) => set({
    theme: settings.theme,
    textScale: settings.textScale,
    lastBibleBook: settings.lastBibleBook ?? 0,
    lastBibleChapter: settings.lastBibleChapter ?? 0,
    dailyDate: settings.dailyDate ?? '',
    dailyVerseId: settings.dailyVerseId ?? 0,
    dailyPurpose: settings.dailyPurpose ?? '',
    dailyCompleted: settings.dailyCompleted ?? false,
    dailyAdapted: settings.dailyAdapted ?? false,
  }),
}));
