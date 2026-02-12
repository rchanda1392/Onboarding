const GEMINI_MODEL = 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`;

const SYSTEM_PROMPT = `You are a helpful study assistant for a PM onboarding program at Google's Core Data team. Your role is to answer questions based ONLY on the study module content provided below.

Rules:
- Answer questions using ONLY the information in the provided content.
- When referencing information, cite the module name (e.g., "According to Module 1...").
- If the answer is not in the provided content, say: "I don't have information about that in the study modules. Try checking the relevant module directly."
- Keep answers concise and focused.
- Use markdown formatting for readability (bold, lists, etc.).`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

let contentCache: string | null = null;

async function loadContent(base: string): Promise<string> {
  if (contentCache) return contentCache;
  const res = await fetch(`${base}/content-bundle.json`);
  const bundle = await res.json();
  contentCache = bundle
    .map((page: { title: string; sections: { heading: string; text: string }[] }) =>
      `# ${page.title}\n\n${page.sections.map((s) => `## ${s.heading}\n${s.text}`).join('\n\n')}`
    )
    .join('\n\n---\n\n');
  return contentCache;
}

export async function* streamChat(
  apiKey: string,
  userMessage: string,
  history: ChatMessage[],
  base: string
): AsyncGenerator<string> {
  const content = await loadContent(base);

  const contents = [
    {
      role: 'user',
      parts: [{ text: `${SYSTEM_PROMPT}\n\n--- STUDY MODULE CONTENT ---\n\n${content}\n\n--- END CONTENT ---` }],
    },
    {
      role: 'model',
      parts: [{ text: 'I\'ve read all the study module content. I\'m ready to answer your questions about data observability, pipelines, AI strategy, Google\'s ecosystem, and developer experience. What would you like to know?' }],
    },
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const res = await fetch(`${API_URL}?alt=sse&key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 400 && err.includes('API_KEY_INVALID')) {
      throw new Error('Invalid API key. Please check your Gemini API key and try again.');
    }
    if (res.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // skip unparseable chunks
      }
    }
  }
}
