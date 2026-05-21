import { useEffect, useState } from 'react';
import {
  getDatabase,
  loadAllReflections,
  loadConfessionList,
  loadSessionFromDB,
  loadSettingsFromDB,
} from '../database';
import { useExamenStore } from '../store/useExamenStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { initBibleDatabase } from '../services';

export function useDatabase() {
  const [isReady, setIsReady] = useState(false);
  const loadReflections = useExamenStore((s) => s.loadReflections);
  const setFinalConfessionList = useExamenStore((s) => s.setFinalConfessionList);
  const loadSession = useExamenStore((s) => s.loadSession);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const checkAndGenerateDaily = useSettingsStore((s) => s.checkAndGenerateDaily);

  useEffect(() => {
    async function init() {
      try {
        await getDatabase();
        const [reflections, confessionList, session, settings] = await Promise.all([
          loadAllReflections(),
          loadConfessionList(),
          loadSessionFromDB(),
          loadSettingsFromDB(),
        ]);
        loadReflections(reflections);
        setFinalConfessionList(confessionList);
        loadSession(session);
        if (settings) {
          loadSettings(settings);
        }
        checkAndGenerateDaily();

        // Indexa a Bíblia Católica no SQLite (apenas na primeira execução)
        initBibleDatabase().catch((err) =>
          console.error('Erro ao indexar Bíblia:', err)
        );
      } catch (error) {
        console.error('Erro ao inicializar banco:', error);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, [loadReflections, setFinalConfessionList, loadSession, loadSettings, checkAndGenerateDaily]);

  return { isReady };
}
