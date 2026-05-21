import { Platform } from 'react-native';
import { searchVerses, getChapterVerses } from './BibleDatabaseService';
import { AI_CONFIG } from '../config/aiConfig';

/**
 * Serviço unificado de IA para estudos bíblicos.
 * 
 * Estratégia de provedores:
 * 1. Groq Cloud (primário) — ultra-rápido (~1-3s), funciona em qualquer rede
 * 2. Ollama Local (fallback) — funciona offline, mais lento (~60s na CPU)
 */

type AIProvider = 'groq' | 'ollama';

// Provider ativo (resolvido após auto-detecção)
let activeProvider: AIProvider | null = null;
let resolvedOllamaUrl: string | null = null;

// ─── System Prompt ───

const SYSTEM_PROMPT = `Você é um estudioso profundo da Bíblia Católica com conhecimento em Teologia, Patrística e Magistério da Igreja.

REGRAS:
1. Baseie suas respostas EXCLUSIVAMENTE nos textos bíblicos fornecidos como contexto.
2. Use a tradução católica fornecida — nunca altere ou substitua o texto.
3. Estruture todo estudo bíblico no seguinte formato:
   📖 CONTEXTO HISTÓRICO: Explique o cenário histórico e cultural da passagem.
   ✝️ SIGNIFICADO TEOLÓGICO: Analise o significado à luz da Tradição Católica e do Magistério.
   🔗 REFERÊNCIAS CRUZADAS: Indique conexões com outras passagens bíblicas mencionadas no contexto.
   💡 APLICAÇÃO PRÁTICA: Como o fiel pode viver esta passagem no dia a dia.
   🙏 ORAÇÃO SUGERIDA: Uma breve oração inspirada na passagem.
4. Responda sempre em português do Brasil.
5. Mantenha um tom reverente, mas acessível.`;

// ─── Interfaces ───

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: string) => void;
}

// ─── Groq Provider ───

async function checkGroqConnection(): Promise<boolean> {
  if (!AI_CONFIG.groq.apiKey) return false;
  try {
    const response = await fetch(`${AI_CONFIG.groq.baseUrl}/models`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${AI_CONFIG.groq.apiKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function generateWithGroq(
  prompt: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(`${AI_CONFIG.groq.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_CONFIG.groq.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 2048,
        stream: false,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.text();
      callbacks.onError(`Erro do Groq (${response.status}): ${errorData}`);
      return;
    }

    const data = await response.json();
    const fullText = data.choices?.[0]?.message?.content || '';

    if (fullText) {
      callbacks.onToken(fullText);
      callbacks.onDone(fullText);
    } else {
      callbacks.onError('O modelo não retornou resposta. Tente novamente.');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      callbacks.onError('Estudo cancelado pelo usuário.');
    } else {
      callbacks.onError(`Erro de conexão com o Groq.\n\nDetalhes: ${error.message}`);
    }
  }
}

// ─── Ollama Provider ───

async function findOllamaUrl(): Promise<string | null> {
  if (resolvedOllamaUrl) return resolvedOllamaUrl;

  if (Platform.OS === 'web') {
    try {
      const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
      if (res.ok) { resolvedOllamaUrl = 'http://localhost:11434'; return resolvedOllamaUrl; }
    } catch {}
    return null;
  }

  const results = await Promise.allSettled(
    AI_CONFIG.ollama.candidates.map(async (url) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const res = await fetch(`${url}/api/tags`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) return url;
        throw new Error('not ok');
      } catch {
        clearTimeout(timeout);
        throw new Error(`${url} unreachable`);
      }
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      resolvedOllamaUrl = result.value;
      return resolvedOllamaUrl;
    }
  }
  return null;
}

async function checkOllamaHasModel(): Promise<boolean> {
  const url = await findOllamaUrl();
  if (!url) return false;
  try {
    const response = await fetch(`${url}/api/tags`);
    if (!response.ok) return false;
    const data = await response.json();
    const models = data.models || [];
    return models.some((m: any) =>
      m.name?.includes('bible-scholar') || m.model?.includes('bible-scholar')
    );
  } catch {
    return false;
  }
}

async function generateWithOllama(
  prompt: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = resolvedOllamaUrl || AI_CONFIG.ollama.candidates[0];
  try {
    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_CONFIG.ollama.model,
        prompt,
        system: SYSTEM_PROMPT,
        stream: false,
        options: { temperature: 0.4, top_p: 0.9, num_predict: 1024 },
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      callbacks.onError(`Erro do Ollama (${response.status}): ${errorText}`);
      return;
    }

    const data = await response.json();
    const fullText = data.response || '';

    if (fullText) {
      callbacks.onToken(fullText);
      callbacks.onDone(fullText);
    } else {
      callbacks.onError('O modelo não retornou resposta. Tente novamente.');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      callbacks.onError('Estudo cancelado pelo usuário.');
    } else {
      callbacks.onError(`Erro de conexão com o Ollama.\n\nDetalhes: ${error.message}`);
    }
  }
}

// ─── API Pública ───

/**
 * Verifica conexão e detecta o melhor provedor disponível.
 * Retorna: { connected, modelAvailable, provider }
 */
export async function checkOllamaConnection(): Promise<boolean> {
  // Reseta para forçar nova detecção
  activeProvider = null;
  resolvedOllamaUrl = null;

  // Tenta Groq primeiro (prioridade)
  if (AI_CONFIG.groq.apiKey) {
    const groqOk = await checkGroqConnection();
    if (groqOk) {
      activeProvider = 'groq';
      console.log('[AI] Provider ativo: Groq Cloud ⚡');
      return true;
    }
  }

  // Fallback: Ollama local
  const ollamaUrl = await findOllamaUrl();
  if (ollamaUrl) {
    activeProvider = 'ollama';
    console.log(`[AI] Provider ativo: Ollama Local (${ollamaUrl})`);
    return true;
  }

  return false;
}

/**
 * Verifica se o modelo está disponível no provider ativo.
 */
export async function checkModelAvailable(): Promise<boolean> {
  if (activeProvider === 'groq') return true; // Groq sempre tem o modelo
  if (activeProvider === 'ollama') return checkOllamaHasModel();
  return false;
}

/**
 * Retorna o nome do provider ativo para exibição na UI.
 */
export function getActiveProviderName(): string {
  if (activeProvider === 'groq') return 'Groq Cloud ⚡';
  if (activeProvider === 'ollama') return 'Ollama Local';
  return 'Desconectado';
}

/**
 * Fase R (Retrieval) do RAG: busca versículos relevantes no SQLite.
 */
export async function retrieveContext(
  query: string,
  options?: { bookIndex?: number; chapter?: number }
): Promise<string> {
  let verses: Array<{
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
  }> = [];

  if (options?.bookIndex !== undefined && options?.chapter !== undefined) {
    verses = await getChapterVerses(options.bookIndex, options.chapter);
  }

  const searchResults = await searchVerses(query, 15);

  const existingIds = new Set(verses.map(v => `${v.bookName}-${v.chapter}-${v.verse}`));
  for (const result of searchResults) {
    const key = `${result.bookName}-${result.chapter}-${result.verse}`;
    if (!existingIds.has(key)) {
      verses.push(result);
      existingIds.add(key);
    }
  }

  if (verses.length === 0) {
    return 'Nenhum versículo relevante encontrado na Bíblia Católica para este tema.';
  }

  return verses
    .map(v => `${v.bookName} ${v.chapter},${v.verse}: "${v.text}"`)
    .join('\n');
}

/**
 * Função completa de RAG: Retrieval → Augmentation → Generation.
 * Usa automaticamente o melhor provider disponível.
 */
export async function runBibleStudyRAG(
  userQuery: string,
  callbacks: StreamCallbacks,
  options?: { bookIndex?: number; chapter?: number },
  signal?: AbortSignal
): Promise<void> {
  // 1. Retrieval
  const context = await retrieveContext(userQuery, options);

  // 2. Augmentation
  const augmentedPrompt = `O fiel deseja um estudo bíblico sobre: "${userQuery}"

TEXTOS DA BÍBLIA CATÓLICA (use APENAS estes como fonte):
${context}

Com base exclusivamente nos textos acima, elabore um estudo bíblico completo seguindo a estrutura definida.`;

  // 3. Generation (usa o provider ativo)
  if (activeProvider === 'groq') {
    await generateWithGroq(augmentedPrompt, callbacks, signal);
  } else {
    await generateWithOllama(augmentedPrompt, callbacks, signal);
  }
}
