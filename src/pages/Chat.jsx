import React from 'react';
import './Chat.css';
import userIcon from '../assests/images/default-user-image.png';

const conversations = [
  {
    id: 'c1',
    name: 'Aarav Sharma',
    role: 'Frontend Dev',
    snippet: 'Nice! Can you push the PR today?',
    time: '2m',
    unread: 2,
    status: 'Online',
    avatar: userIcon,
  },
  {
    id: 'c2',
    name: 'Priya Singh',
    role: 'Backend Dev',
    snippet: 'Let’s sync on the auth flow.',
    time: '34m',
    unread: 0,
    status: 'Active 10m ago',
    avatar: userIcon,
  },
  {
    id: 'c3',
    name: 'DevSync Support',
    role: 'Team',
    snippet: 'Your premium benefits are now active.',
    time: '1d',
    unread: 0,
    status: 'Typically replies in a few hours',
    avatar: userIcon,
  },
  {
    id: 'c4',
    name: 'Rahul Verma',
    role: 'Full‑stack Dev',
    snippet: 'Can you share the API contract?',
    time: '3d',
    unread: 0,
    status: 'Offline',
    avatar: userIcon,
  },
];

const messages = [
  { id: 'm1', from: 'them', text: 'Hey! I reviewed the UI—looks clean.', time: '09:14' },
  { id: 'm2', from: 'me', text: 'Thanks! I kept it consistent with the theme tokens.', time: '09:16' },
  { id: 'm3', from: 'them', text: 'Awesome. Can you also add a chat page UI like WhatsApp/Discord vibes?', time: '09:18' },
  { id: 'm4', from: 'me', text: 'Yep — I’ll do a sidebar + thread + composer. UI only (no logic).', time: '09:19' },
  { id: 'm5', from: 'them', text: 'Perfect. Just make sure it looks premium.', time: '09:20' },
];

const Chat = () => {
  const activeConversationId = 'c1';
  const activeConversation = conversations.find(c => c.id === activeConversationId) || conversations[0];

  return (
    <div className="chat-page">
      <div className="chat-shell">
        {/* Sidebar */}
        <aside className="chat-sidebar" aria-label="Conversations">
          <div className="chat-sidebar-top">
            <div className="chat-sidebar-title">
              <h1 className="chat-title">Messages</h1>
              <p className="chat-subtitle">Your recent conversations</p>
            </div>

            <button className="chat-icon-btn" type="button" aria-label="Start a new chat">
              {composeIcon}
            </button>
          </div>

          <div className="chat-search">
            <span className="chat-search-icon" aria-hidden="true">{searchIcon}</span>
            <input
              className="chat-search-input"
              type="text"
              placeholder="Search messages"
              aria-label="Search messages"
            />
          </div>

          <div className="chat-conversations" role="list">
            {conversations.map((c) => {
              const active = c.id === activeConversationId;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`chat-convo ${active ? 'active' : ''}`}
                  role="listitem"
                  aria-current={active ? 'true' : 'false'}
                >
                  <div className="chat-avatar-wrap">
                    <img className="chat-avatar" src={c.avatar} alt={c.name} />
                    <span className={`chat-presence ${c.status === 'Online' ? 'online' : ''}`} aria-hidden="true" />
                  </div>

                  <div className="chat-convo-meta">
                    <div className="chat-convo-row">
                      <div className="chat-convo-name">{c.name}</div>
                      <div className="chat-convo-time">{c.time}</div>
                    </div>
                    <div className="chat-convo-row">
                      <div className="chat-convo-snippet">{c.snippet}</div>
                      {c.unread ? <div className="chat-unread" aria-label={`${c.unread} unread`}>{c.unread}</div> : <span className="chat-unread-spacer" />}
                    </div>
                    <div className="chat-convo-role">{c.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Thread */}
        <section className="chat-thread" aria-label="Chat thread">
          <header className="chat-thread-header">
            <div className="chat-peer">
              <div className="chat-avatar-wrap large">
                <img className="chat-avatar large" src={activeConversation.avatar} alt={activeConversation.name} />
                <span className={`chat-presence ${activeConversation.status === 'Online' ? 'online' : ''}`} aria-hidden="true" />
              </div>
              <div className="chat-peer-meta">
                <div className="chat-peer-name">{activeConversation.name}</div>
                <div className="chat-peer-status">
                  <span className={`chat-status-dot ${activeConversation.status === 'Online' ? 'online' : ''}`} aria-hidden="true" />
                  {activeConversation.status}
                </div>
              </div>
            </div>

            <div className="chat-thread-actions" aria-label="Chat actions">
              <button className="chat-icon-btn" type="button" aria-label="Voice call">
                {phoneIcon}
              </button>
              <button className="chat-icon-btn" type="button" aria-label="Video call">
                {videoIcon}
              </button>
              <button className="chat-icon-btn" type="button" aria-label="Conversation info">
                {infoIcon}
              </button>
            </div>
          </header>

          <div className="chat-thread-body" role="log" aria-label="Messages">
            <div className="chat-day-divider"><span>Today</span></div>

            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.from === 'me' ? 'me' : 'them'}`}>
                <div className={`chat-bubble ${m.from === 'me' ? 'me' : 'them'}`}>
                  <div className="chat-text">{m.text}</div>
                  <div className="chat-meta">
                    <span className="chat-time">{m.time}</span>
                    {m.from === 'me' ? <span className="chat-check" aria-hidden="true">{doubleCheckIcon}</span> : null}
                  </div>
                </div>
              </div>
            ))}

            <div className="chat-typing" aria-hidden="true">
              <div className="chat-typing-bubble">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

          <footer className="chat-composer" aria-label="Message composer">
            <button className="chat-icon-btn" type="button" aria-label="Attach">
              {plusIcon}
            </button>

            <div className="chat-input-wrap">
              <textarea
                className="chat-input"
                rows={1}
                placeholder="Type a message…"
                aria-label="Type a message"
              />
              <button className="chat-emoji-btn" type="button" aria-label="Emoji">
                {emojiIcon}
              </button>
            </div>

            <button className="chat-send-btn" type="button" aria-label="Send message">
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
const searchIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3m1.55-5.2a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0Z" />
  </svg>
);

const composeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 0 1 3.182 3.182L8.25 18.463 3 19.5l1.037-5.25L16.862 3.487Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.5 16.5 4.5" />
  </svg>
);

const plusIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const emojiIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.75h.008v.008H15V9.75Zm-6 0h.008v.008H9V9.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 14.25s1.5 2.25 3.75 2.25 3.75-2.25 3.75-2.25" />
  </svg>
);

const sendIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 12 16.5-7.5-6.3 16.5-2.7-7.2-7.5-1.8Z" />
  </svg>
);

const phoneIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A4.5 4.5 0 0 1 6.75 2.25h.75a2.25 2.25 0 0 1 2.25 2.25v1.372a2.25 2.25 0 0 1-.659 1.591l-.915.915a.75.75 0 0 0-.178.78 11.05 11.05 0 0 0 6.304 6.304.75.75 0 0 0 .78-.178l.915-.915a2.25 2.25 0 0 1 1.591-.659H19.5A2.25 2.25 0 0 1 21.75 18v.75A4.5 4.5 0 0 1 17.25 23.25h-.75C8.322 23.25 2.25 17.178 2.25 9v-2.25Z" />
  </svg>
);

const videoIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6.75A2.25 2.25 0 0 0 13.5 4.5h-9A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5h9a2.25 2.25 0 0 0 2.25-2.25V13.5l6 3V7.5l-6 3Z" />
  </svg>
);

const infoIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25h1.5V16.5h-1.5V11.25Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25h.008v.008H12V8.25Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z" />
  </svg>
);

const doubleCheckIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.75l2.25 2.25L15 9.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 12.75l2.25 2.25L21 9.75" />
  </svg>
);

export default Chat;
