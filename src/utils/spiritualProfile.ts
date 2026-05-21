import { ExamHistoryRecord } from '../database';

export const commandmentThemes: Record<number, string[]> = {
  1: ["fé", "idolatria"],
  2: ["respeito", "reverência"],
  3: ["prioridade de Deus"],
  4: ["honra", "família", "obediência"],
  5: ["ira", "violência", "paciência"],
  6: ["pureza"],
  7: ["justiça", "caridade"],
  8: ["verdade"],
  9: ["pureza", "desejo"],
  10: ["inveja", "desapego"]
};

export type SpiritualProfile = {
  themesFrequency: {
    [theme: string]: number;
  };
};

export function calculateSpiritualProfile(history: ExamHistoryRecord[]): SpiritualProfile {
  const themesFrequency: Record<string, number> = {};

  for (const record of history) {
    try {
      const data: Record<number, { sinned: boolean }> = JSON.parse(record.data);
      for (const [commandmentId, entry] of Object.entries(data)) {
        if (entry.sinned) {
          const themes = commandmentThemes[Number(commandmentId)];
          if (themes) {
            for (const theme of themes) {
              themesFrequency[theme] = (themesFrequency[theme] || 0) + 1;
            }
          }
        }
      }
    } catch (e) {
      console.error('Erro ao fazer parse do historico:', e);
    }
  }

  return { themesFrequency };
}

export function getTopThemes(profile: SpiritualProfile): string[] {
  const entries = Object.entries(profile.themesFrequency);
  if (entries.length === 0) return [];
  
  // Sort descending by frequency
  entries.sort((a, b) => b[1] - a[1]);
  
  // Return top 2 themes
  return entries.slice(0, 2).map(([theme]) => theme);
}
