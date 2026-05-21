/**
 * Configuração dos provedores de IA para o Estudo Bíblico.
 * 
 * GROQ_API_KEY: Chave da API do Groq (https://console.groq.com)
 * Quando configurada, o Groq é usado como provedor primário (ultra-rápido).
 * Quando vazia, usa o Ollama local como fallback.
 */

export const AI_CONFIG = {
  // Groq Cloud (primário — ultra-rápido)
  groq: {
    apiKey: '',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.1-8b-instant',
  },

  // Ollama Local (fallback — funciona offline)
  ollama: {
    candidates: [
      'http://localhost:11434',
      'http://10.0.2.2:11434',        // Emulador Android
      'http://192.168.15.25:11434',   // IP local da máquina
    ],
    model: 'bible-scholar-lite',
  },
};
