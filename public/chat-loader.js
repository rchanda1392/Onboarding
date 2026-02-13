/**
 * Chat sidebar — always-visible right panel.
 * Calls Azure OpenAI GPT-4o with the full content bundle as context.
 */

// Detect base path: /Onboarding on GitHub Pages, / on Azure SWA
const BASE = document.querySelector('link[rel="sitemap"]')?.href?.match(/^https?:\/\/[^/]+(\/[^/]+)?\/sitemap/)?.[1] || '';
const CONFIG_STORAGE = 'aoai-config';
const MAX_HISTORY = 10;
// API_VERSION no longer needed — user provides full endpoint URI
const PANEL_WIDTH = '420px';

/* ── Markdown rendering dependencies (loaded lazily from CDN) ── */
let markedParse, DOMPurifyLib;

async function loadMarkdownDeps() {
  if (markedParse && DOMPurifyLib) return;
  try {
    const [markedMod, purifyMod] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js'),
      import('https://cdn.jsdelivr.net/npm/dompurify/dist/purify.es.mjs'),
    ]);
    markedParse = markedMod.marked;
    DOMPurifyLib = purifyMod.default;
    markedParse.setOptions({ breaks: true, gfm: true });
  } catch { /* CDN unavailable — fall back to plain text */ }
}

function renderMarkdown(text) {
  if (!markedParse || !DOMPurifyLib) return escapeHtml(text);
  return DOMPurifyLib.sanitize(markedParse.parse(text));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const SYSTEM_PROMPT = `You are a helpful study assistant for a PM onboarding program at Google's Core Data team. Answer questions based ONLY on the study module content provided below.

Rules:
- Answer using ONLY the provided content.
- Cite the module name when referencing information (e.g. "According to Module 1...").
- If the answer isn't in the content, say so.
- Keep answers concise. Use markdown formatting.`;

let contentCache = null;
let messages = [];
let isLoading = false;
let embeddedConfig = null; // Loaded from chat-config.json on Azure

function getConfig() {
  if (embeddedConfig) return embeddedConfig;
  try { return JSON.parse(localStorage.getItem(CONFIG_STORAGE)); } catch { return null; }
}

async function loadEmbeddedConfig() {
  try {
    const res = await fetch(`${BASE}/chat-config.json`);
    if (!res.ok) return null;
    const cfg = await res.json();
    if (cfg.endpointUri && cfg.apiKey) {
      embeddedConfig = cfg;
      return cfg;
    }
  } catch { /* no config file — show setup form */ }
  return null;
}

async function loadContent() {
  if (contentCache) return contentCache;
  const res = await fetch(`${BASE}/content-bundle.json`);
  const bundle = await res.json();
  contentCache = bundle
    .map(p => `# ${p.title}\n\n${p.sections.map(s => `## ${s.heading}\n${s.text}`).join('\n\n')}`)
    .join('\n\n---\n\n');
  return contentCache;
}

async function* streamChat(config, userMessage, history) {
  const content = await loadContent();
  const systemInstruction = `${SYSTEM_PROMPT}\n\n--- STUDY MODULE CONTENT ---\n\n${content}\n\n--- END CONTENT ---`;

  // Build conversation input for the Responses API
  const input = [
    ...history.map(m => ({
      type: 'message',
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text,
    })),
    { type: 'message', role: 'user', content: userMessage },
  ];

  // Ensure api-version is in the URL
  let url = config.endpointUri;
  if (!url.includes('api-version')) {
    url += (url.includes('?') ? '&' : '?') + 'api-version=2024-12-01-preview';
  }

  const model = 'gpt-5.2-chat';

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': config.apiKey },
    body: JSON.stringify({
      ...(model && { model }),
      input,
      instructions: systemInstruction,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new Error('Authentication failed. Check your API key.');
    if (res.status === 404) throw new Error(`Deployment not found (404). URL: ${url.replace(config.apiKey, '***')}`);
    if (res.status === 429) throw new Error('Rate limit reached. Wait a moment and try again.');
    throw new Error(`Azure OpenAI error (${res.status}): ${err.substring(0, 200)}`);
  }

  const reader = res.body.getReader();
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
        // Responses API format
        const delta = parsed?.delta;
        if (delta) { yield delta; continue; }
        // Also check for output_text delta event type
        if (parsed?.type === 'response.output_text.delta' && parsed?.delta) {
          yield parsed.delta;
          continue;
        }
        // Fallback: Chat Completions format
        const text = parsed?.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch { /* skip */ }
    }
  }
}

/* ── Chat state ── */
function showChat() {
  document.getElementById('chat-setup').style.display = 'none';
  document.getElementById('chat-messages').style.display = 'flex';
  document.getElementById('chat-composer').style.display = 'flex';
  document.getElementById('chat-btn-new').style.display = '';
  // Only show settings gear if NOT using embedded config (i.e. GitHub Pages)
  if (!embeddedConfig) {
    document.getElementById('chat-btn-config').style.display = '';
  }
}

function showSetup() {
  localStorage.removeItem(CONFIG_STORAGE);
  messages = [];
  document.getElementById('chat-msg-list').innerHTML = '';
  document.getElementById('chat-setup').style.display = 'flex';
  document.getElementById('chat-messages').style.display = 'none';
  document.getElementById('chat-composer').style.display = 'none';
  document.getElementById('chat-btn-new').style.display = 'none';
  document.getElementById('chat-btn-config').style.display = 'none';
  document.getElementById('chat-config-dropdown').style.display = 'none';
}

/* ── Messages ── */
function addMessage(role, text) {
  const list = document.getElementById('chat-msg-list');

  const row = document.createElement('div');
  row.className = `chat-row chat-row-${role}`;

  const avatar = document.createElement('div');
  avatar.className = `chat-avatar chat-avatar-${role}`;
  avatar.textContent = role === 'user' ? 'You' : 'AI';

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${role}`;
  if (role === 'model') {
    bubble.classList.add('chat-md');
    bubble.innerHTML = renderMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  row.appendChild(avatar);
  row.appendChild(bubble);
  list.appendChild(row);
  row.scrollIntoView({ behavior: 'smooth' });
  return bubble;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || isLoading) return;

  await loadMarkdownDeps();

  input.value = '';
  input.style.height = 'auto';
  isLoading = true;
  document.getElementById('chat-send-btn').disabled = true;

  addMessage('user', text);
  messages.push({ role: 'user', text });

  const bubble = addMessage('model', '');
  const thinkingDot = document.createElement('span');
  thinkingDot.className = 'chat-thinking';
  thinkingDot.textContent = 'Thinking...';
  bubble.appendChild(thinkingDot);

  try {
    const config = getConfig();
    const history = messages.slice(-MAX_HISTORY);
    let botText = '';

    for await (const chunk of streamChat(config, text, history.slice(0, -1))) {
      if (thinkingDot.parentNode) thinkingDot.remove();
      botText += chunk;
      bubble.innerHTML = renderMarkdown(botText);
      bubble.parentElement.scrollIntoView({ behavior: 'smooth' });
    }
    messages.push({ role: 'model', text: botText });
  } catch (e) {
    if (thinkingDot.parentNode) thinkingDot.remove();
    bubble.textContent = '';
    bubble.parentElement.remove();
    messages.pop();
    const errRow = document.createElement('div');
    errRow.className = 'chat-error';
    errRow.textContent = e.message;
    document.getElementById('chat-msg-list').appendChild(errRow);
    errRow.scrollIntoView({ behavior: 'smooth' });
  } finally {
    isLoading = false;
    document.getElementById('chat-send-btn').disabled = false;
    input.focus();
  }
}

/* ── Build DOM ── */
function createChatWidget() {
  // Push page content left to make room for the sidebar
  document.body.style.marginRight = PANEL_WIDTH;

  const sidebar = document.createElement('div');
  sidebar.id = 'chat-sidebar';
  sidebar.innerHTML = `
    <!-- Header -->
    <div id="chat-header">
      <div id="chat-header-left">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>Study Assistant</span>
      </div>
      <div id="chat-header-right">
        <button id="chat-btn-new" class="chat-icon-btn" title="New conversation" style="display:none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button id="chat-btn-config" class="chat-icon-btn" title="Settings" style="display:none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
    </div>

    <!-- Config dropdown -->
    <div id="chat-config-dropdown" style="display:none">
      <button id="chat-clear-config">Reset API Configuration</button>
    </div>

    <!-- Setup screen -->
    <div id="chat-setup">
      <div class="chat-setup-inner">
        <div class="chat-setup-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3>Connect to Azure OpenAI</h3>
        <p>Enter your Azure OpenAI details to start asking questions about the study modules.</p>
        <label class="chat-label">Endpoint URI</label>
        <input type="text" id="chat-endpoint-uri" placeholder="https://resource.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21" />
        <label class="chat-label">API Key</label>
        <input type="password" id="chat-key-input" placeholder="Your API key" />
        <button id="chat-save-key">Connect</button>
        <p class="chat-setup-note">Your credentials are stored locally in your browser and never sent to our servers.</p>
      </div>
    </div>

    <!-- Messages area -->
    <div id="chat-messages" style="display:none">
      <div id="chat-msg-list">
        <div class="chat-welcome">
          <p><strong>Ask me anything</strong> about the study modules.</p>
          <p>I can help with data pipelines, observability, Snowflake &amp; Databricks, Google's ecosystem, AI strategy, and developer experience.</p>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <div id="chat-composer" style="display:none">
      <div id="chat-composer-inner">
        <textarea id="chat-input" rows="1" placeholder="Ask a question..."></textarea>
        <button id="chat-send-btn" title="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      <div id="chat-composer-footer">Powered by Azure OpenAI GPT-5.2</div>
    </div>
  `;
  document.body.appendChild(sidebar);

  injectStyles();
  bindEvents();

  // Try loading embedded config (Azure), then fall back to localStorage (GitHub Pages)
  loadEmbeddedConfig().then((cfg) => {
    if (cfg) {
      // Azure: auto-configure, completely remove setup UI
      showChat();
      const setup = document.getElementById('chat-setup');
      if (setup) setup.remove();
      const configDropdown = document.getElementById('chat-config-dropdown');
      if (configDropdown) configDropdown.remove();
      const configBtn = document.getElementById('chat-btn-config');
      if (configBtn) configBtn.remove();
    } else if (getConfig()) {
      // GitHub Pages: user has saved credentials before
      showChat();
    }
  });
}

function bindEvents() {
  document.getElementById('chat-save-key').onclick = () => {
    const endpointUri = document.getElementById('chat-endpoint-uri').value.trim();
    const apiKey = document.getElementById('chat-key-input').value.trim();
    if (!endpointUri || !apiKey) return;
    localStorage.setItem(CONFIG_STORAGE, JSON.stringify({ endpointUri, apiKey }));
    showChat();
  };
  document.getElementById('chat-key-input').onkeydown = (e) => {
    if (e.key === 'Enter') document.getElementById('chat-save-key').click();
  };

  document.getElementById('chat-send-btn').onclick = sendMessage;
  document.getElementById('chat-input').onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };
  document.getElementById('chat-input').oninput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  document.getElementById('chat-btn-new').onclick = () => {
    messages = [];
    const list = document.getElementById('chat-msg-list');
    list.innerHTML = `<div class="chat-welcome"><p><strong>Ask me anything</strong> about the study modules.</p><p>I can help with data pipelines, observability, Snowflake &amp; Databricks, Google's ecosystem, AI strategy, and developer experience.</p></div>`;
  };

  document.getElementById('chat-btn-config').onclick = () => {
    const dd = document.getElementById('chat-config-dropdown');
    dd.style.display = dd.style.display === 'none' ? 'flex' : 'none';
  };
  document.getElementById('chat-clear-config').onclick = showSetup;
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── Page layout: make room for sidebar ── */
    body { margin-right: ${PANEL_WIDTH}; }

    /* ── Sidebar panel: always visible ── */
    #chat-sidebar {
      position: fixed; top: 0; right: 0;
      width: ${PANEL_WIDTH}; height: 100vh;
      background: var(--sl-color-bg, #1b1b2f);
      border-left: 1px solid var(--sl-color-gray-5, #2a2a3d);
      display: flex; flex-direction: column;
      z-index: 9999;
      font-family: var(--sl-font, system-ui, -apple-system, sans-serif);
    }

    /* ── Header ── */
    #chat-header {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid var(--sl-color-gray-5, #2a2a3d);
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0;
    }
    #chat-header-left {
      display: flex; align-items: center; gap: 0.5rem;
      color: var(--sl-color-white, #e2e2e2);
      font-size: 0.875rem; font-weight: 600;
    }
    #chat-header-right { display: flex; gap: 0.25rem; }
    .chat-icon-btn {
      width: 32px; height: 32px; border-radius: 8px;
      background: transparent; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--sl-color-gray-3, #999);
      transition: background 0.15s, color 0.15s;
    }
    .chat-icon-btn:hover {
      background: var(--sl-color-gray-6, #2a2a3d);
      color: var(--sl-color-white, #e2e2e2);
    }

    /* ── Config dropdown ── */
    #chat-config-dropdown {
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--sl-color-gray-5, #2a2a3d);
      display: flex;
    }
    #chat-clear-config {
      width: 100%; padding: 0.5rem; border-radius: 8px;
      border: 1px solid var(--sl-color-gray-5, #2a2a3d);
      background: transparent; color: var(--sl-color-gray-2, #bbb);
      cursor: pointer; font-size: 0.8rem;
      transition: background 0.15s;
    }
    #chat-clear-config:hover { background: var(--sl-color-gray-6, #2a2a3d); }

    /* ── Setup screen ── */
    #chat-setup {
      flex: 1; display: flex; align-items: center; justify-content: center;
      padding: 2rem 1.5rem; overflow-y: auto;
    }
    .chat-setup-inner { width: 100%; max-width: 320px; }
    .chat-setup-icon { color: var(--sl-color-gray-3, #888); margin-bottom: 1rem; }
    .chat-setup-inner h3 {
      margin: 0 0 0.5rem; font-size: 1.1rem;
      color: var(--sl-color-white, #e2e2e2);
    }
    .chat-setup-inner p {
      margin: 0 0 1.25rem; font-size: 0.85rem;
      color: var(--sl-color-gray-3, #999); line-height: 1.5;
    }
    .chat-label {
      display: block; font-size: 0.75rem; font-weight: 600;
      color: var(--sl-color-gray-3, #999);
      margin: 1rem 0 0.35rem; text-transform: uppercase; letter-spacing: 0.04em;
    }
    #chat-endpoint-uri, #chat-key-input {
      width: 100%; box-sizing: border-box;
      padding: 0.6rem 0.75rem; border-radius: 8px;
      border: 1px solid var(--sl-color-gray-5, #2a2a3d);
      background: var(--sl-color-gray-6, #222);
      color: var(--sl-color-white, #e2e2e2);
      font-size: 0.85rem; outline: none;
      transition: border-color 0.15s;
    }
    #chat-endpoint-uri:focus, #chat-key-input:focus {
      border-color: #d97706;
    }
    #chat-save-key {
      margin-top: 1.25rem; width: 100%; padding: 0.65rem;
      border-radius: 8px; border: none;
      background: #d97706; color: #fff;
      cursor: pointer; font-size: 0.875rem; font-weight: 600;
      transition: background 0.15s;
    }
    #chat-save-key:hover { background: #b45309; }
    .chat-setup-note {
      font-size: 0.75rem !important; color: var(--sl-color-gray-4, #666) !important;
      margin-top: 1rem !important;
    }

    /* ── Messages ── */
    #chat-messages {
      flex: 1; overflow-y: auto; padding: 1rem 0;
      display: flex; flex-direction: column;
    }
    #chat-msg-list {
      display: flex; flex-direction: column; gap: 0;
      padding: 0 1rem;
    }
    .chat-welcome {
      text-align: center; padding: 3rem 1rem 1rem;
      color: var(--sl-color-gray-3, #888); font-size: 0.875rem; line-height: 1.6;
    }
    .chat-welcome strong { color: var(--sl-color-white, #e2e2e2); }

    .chat-row { display: flex; gap: 0.75rem; padding: 1rem 0; }
    .chat-row + .chat-row { border-top: 1px solid var(--sl-color-gray-6, #1e1e30); }

    .chat-avatar {
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 700; flex-shrink: 0;
      text-transform: uppercase; letter-spacing: 0.02em;
    }
    .chat-avatar-user { background: var(--sl-color-gray-5, #333); color: var(--sl-color-white, #e2e2e2); }
    .chat-avatar-model { background: #d97706; color: #fff; }

    .chat-bubble {
      flex: 1; font-size: 0.875rem; line-height: 1.65;
      color: var(--sl-color-white, #e2e2e2);
      white-space: pre-wrap; word-break: break-word;
      padding-top: 0.15rem;
    }
    .chat-thinking { color: var(--sl-color-gray-4, #666); font-style: italic; }

    /* ── Markdown rendering in bot messages ── */
    .chat-bubble.chat-md { white-space: normal; }

    .chat-md h1, .chat-md h2, .chat-md h3, .chat-md h4 {
      color: var(--sl-color-white, #e2e2e2);
      margin: 0.75rem 0 0.35rem; line-height: 1.3;
    }
    .chat-md h1 { font-size: 1.1rem; }
    .chat-md h2 { font-size: 1rem; }
    .chat-md h3 { font-size: 0.925rem; }
    .chat-md h4 { font-size: 0.875rem; }
    .chat-md h1:first-child, .chat-md h2:first-child,
    .chat-md h3:first-child, .chat-md h4:first-child { margin-top: 0; }

    .chat-md p { margin: 0.4rem 0; line-height: 1.65; }
    .chat-md p:first-child { margin-top: 0; }
    .chat-md p:last-child  { margin-bottom: 0; }

    .chat-md strong { color: var(--sl-color-white, #fff); font-weight: 600; }
    .chat-md em { font-style: italic; }

    .chat-md ul, .chat-md ol { margin: 0.4rem 0; padding-left: 1.4rem; }
    .chat-md li { margin: 0.2rem 0; line-height: 1.55; }
    .chat-md li > p { margin: 0.15rem 0; }

    .chat-md code {
      background: var(--sl-color-gray-6, #2a2a3d);
      padding: 0.15rem 0.4rem; border-radius: 4px;
      font-size: 0.8rem;
      font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
    }
    .chat-md pre {
      background: var(--sl-color-gray-6, #1a1a2e);
      border: 1px solid var(--sl-color-gray-5, #2a2a3d);
      border-radius: 8px; padding: 0.75rem 1rem;
      margin: 0.5rem 0; overflow-x: auto;
      font-size: 0.8rem; line-height: 1.5;
    }
    .chat-md pre code {
      background: none; padding: 0; border-radius: 0; font-size: inherit;
    }

    .chat-md table {
      width: 100%; border-collapse: collapse;
      margin: 0.5rem 0; font-size: 0.8rem;
    }
    .chat-md th {
      background: var(--sl-color-gray-6, #2a2a3d);
      color: var(--sl-color-white, #e2e2e2);
      font-weight: 600; text-align: left;
      padding: 0.45rem 0.6rem;
      border: 1px solid var(--sl-color-gray-5, #333);
    }
    .chat-md td {
      padding: 0.4rem 0.6rem;
      border: 1px solid var(--sl-color-gray-5, #333);
      color: var(--sl-color-gray-2, #ccc);
    }
    .chat-md tr:nth-child(even) { background: rgba(255,255,255,0.02); }

    .chat-md blockquote {
      border-left: 3px solid #d97706;
      margin: 0.5rem 0; padding: 0.3rem 0 0.3rem 0.8rem;
      color: var(--sl-color-gray-2, #bbb);
    }
    .chat-md blockquote p { margin: 0.2rem 0; }

    .chat-md hr {
      border: none; border-top: 1px solid var(--sl-color-gray-5, #2a2a3d);
      margin: 0.75rem 0;
    }

    .chat-md a { color: #d97706; text-decoration: underline; text-underline-offset: 2px; }
    .chat-md a:hover { color: #f59e0b; }

    .chat-error {
      margin: 0.5rem 0; padding: 0.6rem 0.8rem;
      font-size: 0.8rem; color: #fca5a5;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
    }

    /* ── Composer: textarea takes 90% width ── */
    #chat-composer {
      flex-shrink: 0;
      padding: 0.75rem 1rem 0;
      border-top: 1px solid var(--sl-color-gray-5, #2a2a3d);
      display: flex; flex-direction: column; align-items: center;
    }
    #chat-composer-inner {
      width: 90%;
      display: flex; align-items: flex-end; gap: 0.5rem;
      background: var(--sl-color-gray-6, #222);
      border: 1px solid var(--sl-color-gray-5, #2a2a3d);
      border-radius: 12px; padding: 0.5rem 0.5rem 0.5rem 0.85rem;
      transition: border-color 0.15s;
    }
    #chat-composer-inner:focus-within { border-color: #d97706; }

    #chat-input {
      flex: 1; border: none; background: transparent;
      color: var(--sl-color-white, #e2e2e2);
      font-size: 0.875rem; line-height: 1.5;
      resize: none; outline: none;
      font-family: inherit; max-height: 120px;
    }
    #chat-input::placeholder { color: var(--sl-color-gray-4, #666); }

    #chat-send-btn {
      width: 32px; height: 32px; border-radius: 8px;
      background: #d97706; color: #fff;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s;
    }
    #chat-send-btn:hover { background: #b45309; }
    #chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    #chat-composer-footer {
      text-align: center; font-size: 0.65rem;
      color: var(--sl-color-gray-4, #555);
      padding: 0.5rem 0 0.6rem;
    }

    /* ── Responsive: on small screens, stack vertically ── */
    @media (max-width: 900px) {
      body { margin-right: 0 !important; }
      #chat-sidebar { display: none; }
    }
  `;
  document.head.appendChild(style);
}

/* ── Move ToC into left sidebar ── */
function relocateToc() {
  const toc = document.querySelector('starlight-toc, .right-sidebar-panel');
  const sidebar = document.querySelector('#starlight__sidebar .sidebar-content');
  if (!toc || !sidebar) return;

  // Extract the inner nav from the ToC
  const tocNav = toc.querySelector('nav');
  if (!tocNav) return;

  // Create a wrapper that looks like a sidebar section
  const wrapper = document.createElement('div');
  wrapper.id = 'sidebar-toc';
  wrapper.innerHTML = `<div class="sidebar-toc-label">On this page</div>`;

  // Style the ToC links to match sidebar nav
  const list = tocNav.querySelector('ul');
  if (list) {
    list.className = 'sidebar-toc-list';
    wrapper.appendChild(list.cloneNode(true));
  }

  // Append to left sidebar
  sidebar.appendChild(wrapper);

  // Hide the original right-side ToC
  toc.style.display = 'none';
}

// Mount
function init() {
  createChatWidget();
  relocateToc();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
