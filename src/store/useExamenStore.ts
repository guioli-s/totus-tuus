import { create } from 'zustand';

export interface ReflectionEntry {
  reflectionText: string;
  sinned: boolean;   // true = usuário clicou "Eu pequei"
  skipped: boolean;  // true = usuário clicou "Não pequei"
}

export interface ConfessionEntry {
  commandmentId: number;
  commandmentTitle: string;
  reflection: string; // pode estar vazio mesmo com sinned: true
}

export interface ExamenSession {
  currentCommandmentId: number;
}

interface ExamenState {
  reflections: Record<number, ReflectionEntry>;
  finalConfessionList: ConfessionEntry[];
  session: ExamenSession | null;

  // Marca como pecado (mesmo sem texto)
  markSinned: (commandmentId: number) => void;
  // Salva o texto do exame (sinned permanece true)
  setReflection: (commandmentId: number, text: string) => void;
  // Marca como pulado
  skipCommandment: (commandmentId: number) => void;

  clearReflections: () => void;
  loadReflections: (data: Record<number, ReflectionEntry>) => void;
  setFinalConfessionList: (list: ConfessionEntry[]) => void;

  startSession: () => void;
  setSessionCommandment: (commandmentId: number) => void;
  endSession: () => void;
  loadSession: (session: ExamenSession | null) => void;
}

export const useExamenStore = create<ExamenState>((set) => ({
  reflections: {},
  finalConfessionList: [],
  session: null,

  markSinned: (commandmentId) =>
    set((state) => ({
      reflections: {
        ...state.reflections,
        [commandmentId]: {
          reflectionText: state.reflections[commandmentId]?.reflectionText ?? '',
          sinned: true,
          skipped: false,
        },
      },
    })),

  setReflection: (commandmentId, text) =>
    set((state) => ({
      reflections: {
        ...state.reflections,
        [commandmentId]: {
          reflectionText: text,
          sinned: true, // sempre sinned quando vem da tela de escrita
          skipped: false,
        },
      },
    })),

  skipCommandment: (commandmentId) =>
    set((state) => ({
      reflections: {
        ...state.reflections,
        [commandmentId]: { reflectionText: '', sinned: false, skipped: true },
      },
    })),

  clearReflections: () => set({ reflections: {} }),
  loadReflections: (data) => set({ reflections: data }),
  setFinalConfessionList: (list) => set({ finalConfessionList: list }),

  startSession: () => set({ session: { currentCommandmentId: 1 } }),
  setSessionCommandment: (commandmentId) =>
    set({ session: { currentCommandmentId: commandmentId } }),
  endSession: () => set({ session: null }),
  loadSession: (session) => set({ session }),
}));
