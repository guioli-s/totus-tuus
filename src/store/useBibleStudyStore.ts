import { create } from 'zustand';

export interface BibleStudyEntry {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}

interface BibleStudyState {
  // Estado da geração atual
  currentQuery: string;
  currentResponse: string;
  isGenerating: boolean;
  error: string | null;

  // Histórico de estudos (em memória, sessão atual)
  history: BibleStudyEntry[];

  // Status de conexão Ollama
  ollamaConnected: boolean;
  modelAvailable: boolean;

  // Actions
  setQuery: (query: string) => void;
  startGenerating: () => void;
  appendToken: (token: string) => void;
  finishGenerating: (fullText: string) => void;
  setError: (error: string | null) => void;
  clearCurrent: () => void;
  setConnectionStatus: (connected: boolean, modelAvailable: boolean) => void;
  saveToHistory: () => void;
}

export const useBibleStudyStore = create<BibleStudyState>((set, get) => ({
  currentQuery: '',
  currentResponse: '',
  isGenerating: false,
  error: null,
  history: [],
  ollamaConnected: false,
  modelAvailable: false,

  setQuery: (query) => set({ currentQuery: query }),

  startGenerating: () => set({ 
    isGenerating: true, 
    currentResponse: '', 
    error: null 
  }),

  appendToken: (token) => set((state) => ({ 
    currentResponse: state.currentResponse + token 
  })),

  finishGenerating: (fullText) => set({ 
    isGenerating: false, 
    currentResponse: fullText 
  }),

  setError: (error) => set({ error, isGenerating: false }),

  clearCurrent: () => set({ 
    currentQuery: '', 
    currentResponse: '', 
    error: null 
  }),

  setConnectionStatus: (connected, modelAvailable) => set({ 
    ollamaConnected: connected, 
    modelAvailable 
  }),

  saveToHistory: () => {
    const { currentQuery, currentResponse, history } = get();
    if (!currentQuery || !currentResponse) return;

    const entry: BibleStudyEntry = {
      id: Date.now().toString(),
      query: currentQuery,
      response: currentResponse,
      timestamp: new Date().toISOString(),
    };

    set({ history: [entry, ...history] });
  },
}));
