/**
 * Chat sidebar widget — Claude-inspired design.
 * Persistent right-side panel that pushes page content left when open.
 * Calls Azure OpenAI GPT-4o with the full content bundle as context.
 */

const BASE = '/Onboarding';
const CONFIG_STORAGE = 'aoai-config';
const PANEL_STATE_STORAGE = 'chat-panel-open';
const MAX_HISTORY = 10;
const API_VERSION = '2024-10-21';
const PANEL_WIDTH = '420px';

const SYSTEM_PROMPT = `You are a helpful study assistant for a PM onboarding program at Google's Core Data team. Answer questions based ONLY on the study module content provided below.

Rules:
- Answer using ONLY the provided content.
- Cite the module name when referencing information (e.g. "According to Module 1...").
- If the answer isn't in the content, say so.
- Keep answers concise. Use markdown formatting.`;

let contentCache = null;
let messages = [];
let isLoading = false;
let panelOpen = false;

function getConfig() {
  try { return JSON.parse(localStorage.getItem(CONFIG_STORAGE)); } catch { return null; }
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
  const apiMessages = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n--- STUDY MODULE CONTENT ---\n\n${content}\n\n--- END CONTENT ---` },
    ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: userMessage },
  ];

  const url = `${config.endpoint.replace(/\/+$/, '')}/openai/deployments/${config.deployment}/chat/completions?api-version=${API_VERSION}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': config.apiKey },
    body: JSON.stringify({ messages: apiMessages, stream: true }),
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
        const text = parsed?.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch { /* skip */ }
    }
  }
}

/* ── Panel open/close ── */
function openPanel() {
  panelOpen = true;
  document.getElementById('chat-sidebar').classList.add('chat-open');
  document.getElementById('chat-toggle').classList.add('chat-toggle-hidden');
  document.body.style.marginRight = PANEL_WIDTH;
  localStorage.setItem(PANEL_STATE_STORAGE, '1');
  const inp = document.getElementById('chat-input');
  if (inp && inp.offsetParent) setTimeout(() => inp.focus(), 200);
}

function closePanel() {
  panelOpen = false;
  document.getElementById('chat-sidebar').classList.remove('chat-open');
  document.getElementById('chat-toggle').classList.remove('chat-toggle-hidden');
  document.body.style.marginRight = '0';
  localStorage.removeItem(PANEL_STATE_STORAGE);
}

/* ── Chat state ── */
function showChat() {
  document.getElementById('chat-setup').style.display = 'none';
  document.getElementById('chat-messages').style.display = 'flex';
  document.getElementById('chat-composer').style.display = 'flex';
  document.getElementById('chat-btn-new').style.display = '';
  document.getElementById('chat-btn-config').style.display = '';
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
  bubble.textContent = text;

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
      bubble.textContent = botText;
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
  // Toggle button
  const toggle = document.createElement('button');
  toggle.id = 'chat-toggle';
  toggle.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  toggle.title = 'Open Study Assistant';
  toggle.onclick = openPanel;
  document.body.appendChild(toggle);

  // Sidebar panel
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
        <button id="chat-btn-close" class="chat-icon-btn" title="Close panel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
        <label class="chat-label">Endpoint</label>
        <input type="text" id="chat-endpoint" placeholder="https://your-resource.openai.azure.com" />
        <label class="chat-label">Deployment Name</label>
        <input type="text" id="chat-deployment" placeholder="gpt-4o" />
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
      <div id="chat-composer-footer">Powered by Azure OpenAI GPT-4o</div>
    </div>
  `;
  document.body.appendChild(sidebar);

  injectStyles();
  bindEvents();

  // Restore state
  const saved = getConfig();
  if (saved) showChat();
  if (localStorage.getItem(PANEL_STATE_STORAGE)) openPanel();
}

function bindEvents() {
  document.getElementById('chat-btn-close').onclick = closePanel;

  document.getElementById('chat-save-key').onclick = () => {
    const endpoint = document.getElementById('chat-endpoint').value.trim();
    const deployment = document.getElementById('chat-deployment').value.trim();
    const apiKey = document.getElementById('chat-key-input').value.trim();
    if (!endpoint || !deployment || !apiKey) return;
    localStorage.setItem(CONFIG_STORAGE, JSON.stringify({ endpoint, deployment, apiKey }));
    showChat();
  };
  document.getElementById('chat-key-input').onkeydown = (e) => {
    if (e.key === 'Enter') document.getElementById('chat-save-key').click();
  };

  document.getElementById('chat-send-btn').onclick = sendMessage;
  document.getElementById('chat-input').onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };
  // Auto-resize textarea
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
    /* ── Toggle button ── */
    #chat-toggle {
      position: fixed; bottom: 1.25rem; right: 1.25rem;
      width: 48px; height: 48px; border-radius: 50%;
      background: #d97706; color: #fff;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 10000; transition: transform 0.15s, opacity 0.15s;
    }
    #chat-toggle:hover { transform: scale(1.08); }
    #chat-toggle.chat-toggle-hidden { opacity: 0; pointer-events: none; transform: scale(0.8); }

    /* ── Sidebar panel ── */
    #chat-sidebar {
      position: fixed; top: 0; right: 0;
      width: ${PANEL_WIDTH}; height: 100vh;
      background: var(--sl-color-bg, #1b1b2f);
      border-left: 1px solid var(--sl-color-gray-5, #2a2a3d);
      display: flex; flex-direction: column;
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: var(--sl-font, system-ui, -apple-system, sans-serif);
    }
    #chat-sidebar.chat-open { transform: translateX(0); }
    body { transition: margin-right 0.25s cubic-bezier(0.4, 0, 0.2, 1); }

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
    .chat-setup-inner {
      width: 100%; max-width: 320px;
    }
    .chat-setup-icon {
      color: var(--sl-color-gray-3, #888);
      margin-bottom: 1rem;
    }
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
    #chat-endpoint, #chat-deployment, #chat-key-input {
      width: 100%; box-sizing: border-box;
      padding: 0.6rem 0.75rem; border-radius: 8px;
      border: 1px solid var(--sl-color-gray-5, #2a2a3d);
      background: var(--sl-color-gray-6, #222);
      color: var(--sl-color-white, #e2e2e2);
      font-size: 0.85rem; outline: none;
      transition: border-color 0.15s;
    }
    #chat-endpoint:focus, #chat-deployment:focus, #chat-key-input:focus {
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

    /* Message rows */
    .chat-row {
      display: flex; gap: 0.75rem;
      padding: 1rem 0;
    }
    .chat-row + .chat-row { border-top: 1px solid var(--sl-color-gray-6, #1e1e30); }

    .chat-avatar {
      width: 28px; height: 28px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 700; flex-shrink: 0;
      text-transform: uppercase; letter-spacing: 0.02em;
    }
    .chat-avatar-user {
      background: var(--sl-color-gray-5, #333);
      color: var(--sl-color-white, #e2e2e2);
    }
    .chat-avatar-model {
      background: #d97706;
      color: #fff;
    }

    .chat-bubble {
      flex: 1; font-size: 0.875rem; line-height: 1.65;
      color: var(--sl-color-white, #e2e2e2);
      white-space: pre-wrap; word-break: break-word;
      padding-top: 0.15rem;
    }

    .chat-thinking {
      color: var(--sl-color-gray-4, #666);
      font-style: italic;
    }

    .chat-error {
      margin: 0.5rem 0; padding: 0.6rem 0.8rem;
      font-size: 0.8rem; color: #fca5a5;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px;
    }

    /* ── Composer ── */
    #chat-composer {
      flex-shrink: 0;
      padding: 0.75rem 1rem 0.5rem;
      border-top: 1px solid var(--sl-color-gray-5, #2a2a3d);
    }
    #chat-composer-inner {
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
      font-family: inherit;
      max-height: 120px;
    }
    #chat-input::placeholder { color: var(--sl-color-gray-4, #666); }

    #chat-send-btn {
      width: 32px; height: 32px; border-radius: 8px;
      background: #d97706; color: #fff;
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    #chat-send-btn:hover { background: #b45309; }
    #chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    #chat-composer-footer {
      text-align: center; font-size: 0.65rem;
      color: var(--sl-color-gray-4, #555);
      padding-top: 0.5rem;
    }

    /* ── Responsive: on small screens, overlay instead of push ── */
    @media (max-width: 900px) {
      #chat-sidebar { width: 100%; }
      #chat-sidebar.chat-open ~ #chat-toggle { display: none; }
      body { margin-right: 0 !important; }
    }
  `;
  document.head.appendChild(style);
}

// Mount
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChatWidget);
} else {
  createChatWidget();
}
