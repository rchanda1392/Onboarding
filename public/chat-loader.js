/**
 * Self-contained chat widget for the Onboarding Resources site.
 * Loaded via <script type="module"> on every page.
 * Calls Azure OpenAI GPT-4o with the full content bundle as context.
 */

const BASE = '/Onboarding';
const CONFIG_STORAGE = 'aoai-config';
const MAX_HISTORY = 10;
const API_VERSION = '2024-10-21';

const SYSTEM_PROMPT = `You are a helpful study assistant for a PM onboarding program at Google's Core Data team. Answer questions based ONLY on the study module content provided below.

Rules:
- Answer using ONLY the provided content.
- Cite the module name when referencing information (e.g. "According to Module 1...").
- If the answer isn't in the content, say so.
- Keep answers concise. Use markdown formatting.`;

let contentCache = null;
let messages = [];
let isLoading = false;

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
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages: apiMessages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    if (res.status === 401) throw new Error('Authentication failed. Check your API key.');
    if (res.status === 404) throw new Error('Deployment not found. Check your endpoint and deployment name.');
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

// --- UI ---
function createChatWidget() {
  const root = document.createElement('div');
  root.id = 'chat-widget';
  root.innerHTML = `
    <button id="chat-toggle" aria-label="Open chat" title="Ask about study modules">💬</button>
    <div id="chat-panel" class="chat-hidden">
      <div id="chat-header">
        <strong>Study Assistant</strong>
        <div id="chat-header-btns">
          <button id="chat-new" title="New chat" class="chat-hbtn" style="display:none">🔄</button>
          <button id="chat-settings" title="Settings" class="chat-hbtn" style="display:none">⚙️</button>
          <button id="chat-close" title="Close" class="chat-hbtn">✕</button>
        </div>
      </div>
      <div id="chat-settings-bar" style="display:none">
        <button id="chat-clear-key">Clear Configuration & Reset</button>
      </div>
      <div id="chat-body">
        <div id="chat-setup">
          <p><strong>Azure OpenAI Setup</strong></p>
          <p>Enter your Azure OpenAI details to enable chat.</p>
          <label class="chat-label">Endpoint</label>
          <input type="text" id="chat-endpoint" placeholder="https://your-resource.openai.azure.com" />
          <label class="chat-label">Deployment Name</label>
          <input type="text" id="chat-deployment" placeholder="gpt-4o" />
          <label class="chat-label">API Key</label>
          <input type="password" id="chat-key-input" placeholder="Your Azure OpenAI API key" />
          <button id="chat-save-key">Save & Start Chatting</button>
        </div>
        <div id="chat-messages" style="display:none">
          <div id="chat-msg-list"></div>
        </div>
      </div>
      <div id="chat-input-bar" style="display:none">
        <input type="text" id="chat-input" placeholder="Ask about the study modules..." />
        <button id="chat-send">→</button>
      </div>
      <div id="chat-footer">Powered by Azure OpenAI</div>
    </div>
  `;
  document.body.appendChild(root);
  injectStyles();
  bindEvents();

  const saved = getConfig();
  if (saved) showChat();
}

function showChat() {
  document.getElementById('chat-setup').style.display = 'none';
  document.getElementById('chat-messages').style.display = 'flex';
  document.getElementById('chat-input-bar').style.display = 'flex';
  document.getElementById('chat-new').style.display = '';
  document.getElementById('chat-settings').style.display = '';
}

function showSetup() {
  localStorage.removeItem(CONFIG_STORAGE);
  messages = [];
  document.getElementById('chat-msg-list').innerHTML = '';
  document.getElementById('chat-setup').style.display = 'block';
  document.getElementById('chat-messages').style.display = 'none';
  document.getElementById('chat-input-bar').style.display = 'none';
  document.getElementById('chat-new').style.display = 'none';
  document.getElementById('chat-settings').style.display = 'none';
  document.getElementById('chat-settings-bar').style.display = 'none';
}

function addMessage(role, text) {
  const list = document.getElementById('chat-msg-list');
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;
  div.textContent = text;
  list.appendChild(div);
  div.scrollIntoView({ behavior: 'smooth' });
  return div;
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || isLoading) return;

  input.value = '';
  isLoading = true;
  document.getElementById('chat-send').disabled = true;

  addMessage('user', text);
  messages.push({ role: 'user', text });

  const botDiv = addMessage('model', '...');

  try {
    const config = getConfig();
    const history = messages.slice(-MAX_HISTORY);
    let botText = '';

    for await (const chunk of streamChat(config, text, history.slice(0, -1))) {
      botText += chunk;
      botDiv.textContent = botText;
      botDiv.scrollIntoView({ behavior: 'smooth' });
    }

    messages.push({ role: 'model', text: botText });
  } catch (e) {
    botDiv.textContent = '';
    botDiv.remove();
    messages.pop();
    const errDiv = document.createElement('div');
    errDiv.className = 'chat-error';
    errDiv.textContent = e.message;
    document.getElementById('chat-msg-list').appendChild(errDiv);
    errDiv.scrollIntoView({ behavior: 'smooth' });
  } finally {
    isLoading = false;
    document.getElementById('chat-send').disabled = false;
    input.focus();
  }
}

function bindEvents() {
  document.getElementById('chat-toggle').onclick = () => {
    document.getElementById('chat-panel').classList.remove('chat-hidden');
    document.getElementById('chat-toggle').style.display = 'none';
    const inp = document.getElementById('chat-input');
    if (inp.offsetParent) inp.focus();
  };

  document.getElementById('chat-close').onclick = () => {
    document.getElementById('chat-panel').classList.add('chat-hidden');
    document.getElementById('chat-toggle').style.display = '';
  };

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

  document.getElementById('chat-send').onclick = sendMessage;

  document.getElementById('chat-input').onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  document.getElementById('chat-new').onclick = () => {
    messages = [];
    document.getElementById('chat-msg-list').innerHTML = '';
  };

  document.getElementById('chat-settings').onclick = () => {
    const bar = document.getElementById('chat-settings-bar');
    bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
  };

  document.getElementById('chat-clear-key').onclick = showSetup;
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #chat-widget { font-family: var(--sl-font, system-ui, sans-serif); }

    #chat-toggle {
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--sl-color-accent, #6366f1);
      color: var(--sl-color-black, #fff);
      border: none; cursor: pointer; font-size: 24px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999; transition: transform 0.2s;
    }
    #chat-toggle:hover { transform: scale(1.1); }

    #chat-panel {
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      width: min(400px, calc(100vw - 2rem));
      height: min(550px, calc(100vh - 3rem));
      border-radius: 12px;
      background: var(--sl-color-bg, #1a1a2e);
      border: 1px solid var(--sl-color-gray-5, #333);
      display: flex; flex-direction: column;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 9999; overflow: hidden;
    }
    #chat-panel.chat-hidden { display: none; }

    #chat-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--sl-color-gray-5, #333);
      display: flex; justify-content: space-between; align-items: center;
      background: var(--sl-color-bg-nav, #161625);
      color: var(--sl-color-white, #eee);
      font-size: 0.9rem; flex-shrink: 0;
    }
    #chat-header-btns { display: flex; gap: 0.5rem; }
    .chat-hbtn { background: transparent; border: none; cursor: pointer; font-size: 1rem; padding: 0.2rem; line-height: 1; }

    #chat-settings-bar {
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--sl-color-gray-5, #333);
      background: var(--sl-color-bg-nav, #161625);
    }
    #chat-clear-key {
      width: 100%; padding: 0.4rem; border-radius: 6px;
      border: 1px solid var(--sl-color-gray-4, #555);
      background: transparent; color: var(--sl-color-gray-2, #aaa);
      cursor: pointer; font-size: 0.8rem;
    }

    #chat-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

    #chat-setup {
      padding: 1.5rem 1rem; overflow-y: auto;
      color: var(--sl-color-gray-2, #aaa); font-size: 0.85rem; line-height: 1.5;
    }
    #chat-setup p { margin: 0 0 0.75rem; }
    #chat-setup a { color: var(--sl-color-accent, #6366f1); }
    .chat-label {
      display: block; font-size: 0.75rem; font-weight: 600;
      color: var(--sl-color-gray-3, #999); margin: 0.75rem 0 0.25rem;
    }
    .chat-label:first-of-type { margin-top: 0; }
    #chat-endpoint, #chat-deployment, #chat-key-input, #chat-input {
      width: 100%; box-sizing: border-box;
      padding: 0.5rem 0.75rem; border-radius: 8px;
      border: 1px solid var(--sl-color-gray-5, #333);
      background: var(--sl-color-gray-6, #222);
      color: var(--sl-color-white, #eee);
      font-size: 0.85rem; outline: none;
    }
    #chat-save-key {
      margin-top: 1rem; width: 100%; padding: 0.5rem;
      border-radius: 8px; border: none;
      background: var(--sl-color-accent, #6366f1);
      color: var(--sl-color-black, #fff);
      cursor: pointer; font-size: 0.85rem; font-weight: 600;
    }

    #chat-messages { flex: 1; overflow-y: auto; padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
    #chat-msg-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .chat-msg {
      max-width: 85%; padding: 0.6rem 0.8rem;
      font-size: 0.85rem; line-height: 1.5;
      white-space: pre-wrap; word-break: break-word;
    }
    .chat-msg-user {
      align-self: flex-end;
      background: var(--sl-color-accent, #6366f1);
      color: var(--sl-color-black, #fff);
      border-radius: 12px 12px 2px 12px;
    }
    .chat-msg-model {
      align-self: flex-start;
      background: var(--sl-color-gray-6, #222);
      color: var(--sl-color-white, #eee);
      border-radius: 12px 12px 12px 2px;
    }
    .chat-error {
      font-size: 0.8rem; color: #ef4444;
      padding: 0.4rem 0.6rem;
      background: rgba(239,68,68,0.1);
      border-radius: 8px;
    }

    #chat-input-bar {
      padding: 0.6rem 0.75rem;
      border-top: 1px solid var(--sl-color-gray-5, #333);
      display: flex; gap: 0.5rem;
      background: var(--sl-color-bg-nav, #161625);
      flex-shrink: 0;
    }
    #chat-input { flex: 1; }
    #chat-send {
      padding: 0.5rem 1rem; border-radius: 8px; border: none;
      background: var(--sl-color-accent, #6366f1);
      color: var(--sl-color-black, #fff);
      cursor: pointer; font-size: 0.85rem; font-weight: 600;
    }
    #chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

    #chat-footer {
      padding: 0.3rem 0.75rem; text-align: center;
      font-size: 0.65rem; color: var(--sl-color-gray-4, #555);
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);
}

// Mount on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChatWidget);
} else {
  createChatWidget();
}
