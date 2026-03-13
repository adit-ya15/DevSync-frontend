import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Chat.css';
import userIcon from '../assests/images/default-user-image.png';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Chat = () => {
  const { targetUserId } = useParams();
  const connections = useSelector((store) => store.connections);

  const threadKey = targetUserId || 'unknown';

  const targetUser = useMemo(() => {
    if (!targetUserId || !Array.isArray(connections)) return null;
    return connections.find((u) => u?._id === targetUserId) || null;
  }, [connections, targetUserId]);

  const targetName = `${targetUser?.firstName || ''} ${targetUser?.lastName || ''}`.trim() || 'User';
  const targetAvatar = targetUser?.photoUrl || userIcon;

  const [threads, setThreads] = useState(() => ({}));
  const [drafts, setDrafts] = useState(() => ({}));
  const messages = threads[threadKey] || [];
  const draft = drafts[threadKey] || '';
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const now = new Date();
    const nextMessage = {
      id: `${now.getTime()}-${Math.random().toString(16).slice(2)}`,
      from: 'me',
      text: trimmed,
      time: formatTime(now),
    };
    setThreads((prev) => ({
      ...prev,
      [threadKey]: [...(prev[threadKey] || []), nextMessage],
    }));
    setDrafts((prev) => ({
      ...prev,
      [threadKey]: '',
    }));
  };

  return (
    <div className="chat-page">
      <div className="chat-shell single">
        <section className="chat-thread" aria-label="Chat thread">
          <header className="chat-thread-header">
            <div className="chat-peer">
              <div className="chat-avatar-wrap large">
                <img className="chat-avatar large" src={targetAvatar} alt={targetName} />
                <span className="chat-presence" aria-hidden="true" />
              </div>
              <div className="chat-peer-meta">
                <div className="chat-peer-name">{targetName}</div>
                <div className="chat-peer-status">
                  <span className="chat-status-dot" aria-hidden="true" />
                  {targetUserId ? `Chatting with: ${targetUserId}` : 'Open from Connections → Chat'}
                </div>
              </div>
            </div>
          </header>

          <div className="chat-thread-body" role="log" aria-label="Messages">
            {messages.length ? (
              <div className="chat-day-divider"><span>Today</span></div>
            ) : (
              <div className="chat-empty" aria-hidden="true">
                Type a message to start.
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.from === 'me' ? 'me' : 'them'}`}>
                <div className={`chat-bubble ${m.from === 'me' ? 'me' : 'them'}`}>
                  <div className="chat-text">{m.text}</div>
                  <div className="chat-meta">
                    <span className="chat-time">{m.time}</span>
                    {m.from === 'me' ? (
                      <span className="chat-check" aria-hidden="true">{doubleCheckIcon}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <footer className="chat-composer" aria-label="Message composer">
            <div className="chat-input-wrap">
              <textarea
                className="chat-input"
                rows={1}
                placeholder="Type a message…"
                aria-label="Type a message"
                value={draft}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [threadKey]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
            </div>

            <button className="chat-send-btn" type="button" aria-label="Send message" onClick={sendMessage}>
              <span className="chat-send-icon" aria-hidden="true">{sendIcon}</span>
              <span className="chat-send-text">Send</span>
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
};

/* ── Icons (inline SVG) ── */
const sendIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 12 16.5-7.5-6.3 16.5-2.7-7.2-7.5-1.8Z" />
  </svg>
);

const doubleCheckIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.75l2.25 2.25L15 9.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 12.75l2.25 2.25L21 9.75" />
  </svg>
);

export default Chat;
