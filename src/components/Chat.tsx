import { useState, useRef, useEffect } from 'preact/hooks';
import { streamChat, type ChatMessage } from '../lib/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const API_KEY_STORAGE = 'gemini-api-key';
const MAX_HISTORY = 10;

export default function Chat({ base = '' }: { base?: string }) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) {
      setApiKey(stored);
      setHasKey(true);
    }
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && hasKey) inputRef.current?.focus();
  }, [open, hasKey]);

  function saveKey() {
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    localStorage.setItem(API_KEY_STORAGE, trimmed);
    setApiKey(trimmed);
    setHasKey(true);
    setKeyInput('');
    setShowSettings(false);
  }

  function clearKey() {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey('');
    setHasKey(false);
    setMessages([]);
    setShowSettings(false);
  }

  function clearChat() {
    setMessages([]);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history: ChatMessage[] = messages.slice(-MAX_HISTORY).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      let botText = '';
      setMessages((prev) => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of streamChat(apiKey, text, history, base)) {
        botText += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: botText };
          return updated;
        });
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      setMessages((prev) => prev.filter((m) => m.text !== ''));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // --- Render ---
  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--sl-color-accent)',
            color: 'var(--sl-color-black)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            width: 'min(400px, calc(100vw - 2rem))',
            height: 'min(550px, calc(100vh - 3rem))',
            borderRadius: '12px',
            background: 'var(--sl-color-bg)',
            border: '1px solid var(--sl-color-gray-5)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--sl-color-gray-5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--sl-color-bg-nav)',
              flexShrink: 0,
            }}
          >
            <strong style={{ fontSize: '0.9rem', color: 'var(--sl-color-white)' }}>Study Assistant</strong>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {hasKey && (
                <>
                  <button
                    onClick={clearChat}
                    title="New chat"
                    style={headerBtnStyle}
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    title="Settings"
                    style={headerBtnStyle}
                  >
                    ⚙️
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                title="Close"
                style={headerBtnStyle}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Settings dropdown */}
          {showSettings && (
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--sl-color-gray-5)', background: 'var(--sl-color-bg-nav)' }}>
              <button
                onClick={clearKey}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--sl-color-gray-4)',
                  color: 'var(--sl-color-gray-2)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  width: '100%',
                }}
              >
                Clear API Key & Reset
              </button>
            </div>
          )}

          {/* Body */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!hasKey ? (
              /* API Key setup */
              <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--sl-color-gray-2)', margin: 0, lineHeight: 1.5 }}>
                  Enter your Gemini API key to chat with the study content. You can get a free key from{' '}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener"
                    style={{ color: 'var(--sl-color-accent)' }}
                  >
                    Google AI Studio
                  </a>
                  .
                </p>
                <input
                  type="password"
                  placeholder="Paste your API key here"
                  value={keyInput}
                  onInput={(e) => setKeyInput((e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveKey()}
                  style={inputStyle}
                />
                <button onClick={saveKey} style={primaryBtnStyle}>
                  Save & Start Chatting
                </button>
              </div>
            ) : (
              /* Messages */
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.length === 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--sl-color-gray-3)', textAlign: 'center', marginTop: '2rem' }}>
                    Ask me anything about the study modules!
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'user' ? 'var(--sl-color-accent)' : 'var(--sl-color-gray-6)',
                      color: msg.role === 'user' ? 'var(--sl-color-black)' : 'var(--sl-color-white)',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text || (loading && i === messages.length - 1 ? '...' : '')}
                  </div>
                ))}
                {error && (
                  <div style={{ fontSize: '0.8rem', color: '#ef4444', padding: '0.4rem 0.6rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                    {error}
                  </div>
                )}
                <div ref={messagesEnd} />
              </div>
            )}
          </div>

          {/* Input bar */}
          {hasKey && (
            <div
              style={{
                padding: '0.6rem 0.75rem',
                borderTop: '1px solid var(--sl-color-gray-5)',
                display: 'flex',
                gap: '0.5rem',
                background: 'var(--sl-color-bg-nav)',
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about the study modules..."
                value={input}
                onInput={(e) => setInput((e.target as HTMLInputElement).value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={send} disabled={loading || !input.trim()} style={primaryBtnStyle}>
                {loading ? '...' : '→'}
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '0.3rem 0.75rem', textAlign: 'center', fontSize: '0.65rem', color: 'var(--sl-color-gray-4)', flexShrink: 0 }}>
            Powered by Gemini
          </div>
        </div>
      )}
    </>
  );
}

const headerBtnStyle: Record<string, string> = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  padding: '0.2rem',
  lineHeight: '1',
};

const inputStyle: Record<string, string> = {
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid var(--sl-color-gray-5)',
  background: 'var(--sl-color-gray-7, var(--sl-color-gray-6))',
  color: 'var(--sl-color-white)',
  fontSize: '0.85rem',
  outline: 'none',
};

const primaryBtnStyle: Record<string, string> = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  background: 'var(--sl-color-accent)',
  color: 'var(--sl-color-black)',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '600',
};
