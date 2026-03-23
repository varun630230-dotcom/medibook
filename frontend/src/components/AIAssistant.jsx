import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SYSTEM_PROMPT = `You are MediBot, a helpful AI health assistant for MediBook — a doctor appointment booking platform. 

You help users with:
- Finding the right doctor specialty for their symptoms
- Explaining medical terms in simple language
- Answering questions about how to use MediBook
- General health and wellness tips
- Understanding appointment types (In-Person, Video Call, Phone Call)
- Appointment preparation tips

You are NOT a replacement for professional medical advice. Always remind users to consult a real doctor for diagnosis or treatment.

Keep responses concise, friendly, and helpful. Use bullet points for lists. If someone describes serious symptoms (chest pain, difficulty breathing, stroke signs), always tell them to call emergency services immediately.`;

const SUGGESTIONS = [
  "What doctor should I see for back pain?",
  "How do I prepare for my appointment?",
  "What's the difference between Video and In-Person?",
  "I have a headache, which specialist?",
  "How do I cancel an appointment?",
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '12px 16px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#0ea5e9',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', gap: 10, marginBottom: 16,
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg, #0ea5e9, #0369a1)'
          : 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15,
      }}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        background: isUser ? 'linear-gradient(135deg, #0ea5e9, #0369a1)' : '#f8fafc',
        color: isUser ? '#fff' : '#0f172a',
        padding: '10px 14px',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        fontSize: 13.5, lineHeight: 1.65,
        border: isUser ? 'none' : '1px solid #e2e8f0',
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
        <div style={{
          fontSize: 10, marginTop: 5,
          opacity: isUser ? .75 : .5,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.firstName || 'there'}! 👋 I'm MediBot, your AI health assistant.\n\nI can help you find the right doctor, answer health questions, or guide you through MediBook. How can I help you today?`,
      time: now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasKey] = useState(() => !!import.meta.env.VITE_GROQ_API_KEY);
  const bottomRef = useRef();
  const inputRef = useRef();

  function now() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');

    const userMsg = { role: 'user', content, time: now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    if (!hasKey) {
      // Fallback without API key
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I'm MediBot, but I need a Groq API key to respond. Please add VITE_GROQ_API_KEY to your .env.local file.\n\nFor now, here are some quick links:\n• Browse doctors → /doctors\n• Book appointment → pick a doctor and click Book Now\n• View appointments → /appointments`,
          time: now(),
        }]);
        setLoading(false);
      }, 800);
      return;
    }

    try {
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: apiMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'API error');
      }

      const data = await res.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply, time: now() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I ran into an error: ${err.message}\n\nPlease try again or check your API key.`,
        time: now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hi ${user?.firstName || 'there'}! 👋 Chat cleared. How can I help you?`,
      time: now(),
    }]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
          width: 58, height: 58, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
          cursor: 'pointer', fontSize: 26,
          boxShadow: '0 6px 24px rgba(3,105,161,.45)',
          transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: open ? 'rotate(0deg) scale(1.05)' : 'rotate(0deg)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="MediBot AI Assistant"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Unread dot */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 78, right: 28, zIndex: 1001,
          width: 12, height: 12, borderRadius: '50%',
          background: '#10b981', border: '2px solid white',
        }} />
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 98, right: 28, zIndex: 999,
          width: 370, height: 520,
          background: '#fff', borderRadius: 22,
          boxShadow: '0 20px 60px rgba(0,0,0,.18)',
          border: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp .25s ease',
          overflow: 'hidden',
        }}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>MediBot</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                AI Health Assistant
              </div>
            </div>
            <button onClick={clearChat} title="Clear chat" style={{
              background: 'rgba(255,255,255,.2)', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 13, borderRadius: 8, padding: '4px 8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>Clear</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 8px', background: '#fafcff' }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🤖</div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px 18px 18px 18px' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '6px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #f1f5f9' }}>
              {SUGGESTIONS.slice(0, 3).map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1',
                  borderRadius: 100, fontSize: 11, padding: '4px 10px', cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600, transition: 'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e0f2fe'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f0f9ff'; }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid #e2e8f0',
            display: 'flex', gap: 8, alignItems: 'flex-end', background: '#fff',
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask MediBot anything..."
              rows={1}
              style={{
                flex: 1, padding: '9px 13px', borderRadius: 12,
                border: '1.5px solid #e2e8f0', fontSize: 13,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                resize: 'none', outline: 'none', lineHeight: 1.5,
                maxHeight: 80, overflowY: 'auto',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#0ea5e9'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #0ea5e9, #0369a1)'
                  : '#e2e8f0',
                color: input.trim() && !loading ? '#fff' : '#94a3b8',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s', flexShrink: 0,
              }}>
              ↑
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{
            padding: '5px 12px 8px', fontSize: 10, color: '#94a3b8',
            textAlign: 'center', background: '#fff',
          }}>
            MediBot is for guidance only. Always consult a real doctor.
          </div>
        </div>
      )}
    </>
  );
}
