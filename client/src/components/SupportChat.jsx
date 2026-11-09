import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../apiConfig.js';
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Bot,
  Shield,
  User,
  Sparkles,
  HelpCircle,
  Clock
} from 'lucide-react';

export function SupportChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Guest ID for unauthenticated visitors
  const [guestId] = useState(() => {
    let stored = localStorage.getItem('tt_guest_chat_id');
    if (!stored) {
      stored = 'guest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem('tt_guest_chat_id', stored);
    }
    return stored;
  });

  const activeUserId = user?.id || guestId;

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  // Fetch messages from backend
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('tt_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = `${API_BASE}/api/support/messages?userId=${encodeURIComponent(activeUserId)}`;
      const res = await fetch(url, { headers });
      const data = await res.json();

      if (data.success && Array.isArray(data.messages)) {
        setMessages(prev => {
          // If closed, calculate newly arrived messages from admin/bot
          if (!isOpen && prev.length > 0 && data.messages.length > prev.length) {
            const newAdminMsgs = data.messages.slice(prev.length).filter(m => m.sender === 'ADMIN' || m.sender === 'BOT');
            if (newAdminMsgs.length > 0) {
              setUnreadCount(count => count + newAdminMsgs.length);
            }
          }
          return data.messages;
        });
      }
    } catch (err) {
      console.error('Failed to poll support messages:', err);
    }
  };

  // Polling loop: every 3s when open, every 6s when closed
  useEffect(() => {
    fetchMessages();
    const intervalTime = isOpen ? 3000 : 6000;
    const interval = setInterval(fetchMessages, intervalTime);
    return () => clearInterval(interval);
  }, [isOpen, activeUserId]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text || loading) return;

    setLoading(true);
    setInputVal('');

    try {
      const token = localStorage.getItem('tt_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const payload = {
        text,
        userId: activeUserId,
        userName: user?.fullName || user?.username || 'Guest Trader',
        userEmail: user?.email || ''
      };

      const res = await fetch(`${API_BASE}/api/support/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        // Immediate local append
        const newMsgs = [...messages, data.message];
        if (data.botGreeting) {
          newMsgs.push(data.botGreeting);
        }
        setMessages(newMsgs);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    'How do I deposit funds via USDT?',
    'Explain the Mon-Fri 3% compounding',
    'What is the minimum deposit?',
    'I need help with my account'
  ];

  return (
    <>
      {/* Floating Chat Trigger Launcher */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000
        }}
      >
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setUnreadCount(0);
          }}
          style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0, 242, 254, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#07090e',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isOpen ? 'rotate(90deg)' : 'scale(1)'
          }}
          title={isOpen ? 'Close Customer Support' : 'Open Customer Support Chat'}
        >
          {isOpen ? <X size={26} /> : <Bot size={28} />}

          {/* Unread badge */}
          {!isOpen && unreadCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ff0055',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(255, 0, 85, 0.6)',
                animation: 'pulse 1.8s infinite'
              }}
            >
              {unreadCount}
            </div>
          )}

          {/* Pulse ring for live indicator when closed */}
          {!isOpen && unreadCount === 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#00e676',
                border: '2px solid #07090e'
              }}
            />
          )}
        </button>
      </div>

      {/* Floating Support Window */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 1000,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 242, 254, 0.15)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            background: 'rgba(10, 15, 29, 0.96)',
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.12), rgba(0, 230, 118, 0.08))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(0, 230, 118, 0.2))',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00f2fe'
                }}
              >
                <Bot size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                    Trading Trends Support
                  </h4>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#00e676',
                      display: 'inline-block',
                      boxShadow: '0 0 8px #00e676'
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                  Customer Support • Live
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#9ca3af',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* User Status Bar */}
          <div
            style={{
              padding: '6px 16px',
              background: 'rgba(0, 0, 0, 0.35)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '11px',
              color: '#9ca3af',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              {user ? (
                <>
                  Logged in as <strong style={{ color: '#00f2fe' }}>{user.fullName || user.username}</strong>
                </>
              ) : (
                <>Visitor Session (Direct Desk Link)</>
              )}
            </span>
            <span style={{ color: '#00e676', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={10} /> Fast Reply
            </span>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Welcome Greeting card */}
            <div
              style={{
                background: 'rgba(0, 242, 254, 0.06)',
                border: '1px solid rgba(0, 242, 254, 0.15)',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '12px',
                color: '#cbd5e1',
                lineHeight: 1.5
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#00f2fe', fontWeight: 600 }}>
                <Sparkles size={14} /> Welcome to Trading Trends Desk
              </div>
              Ask any question about your deposit, 3% weekday yield, withdrawals, or account setup. You can chat directly with our Customer Support team.
            </div>

            {/* Quick Prompts if conversation is short */}
            {messages.length <= 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Quick Questions
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        color: '#94a3b8',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00f2fe';
                        e.currentTarget.style.color = '#00f2fe';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#94a3b8';
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'USER';
              const isAdmin = msg.sender === 'ADMIN';
              const isBot = msg.sender === 'BOT';

              const timeStr = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div
                  key={msg.id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      marginBottom: '3px',
                      color: isUser ? '#00f2fe' : isAdmin ? '#00e676' : '#94a3b8',
                      fontWeight: 600
                    }}
                  >
                    {isAdmin ? (
                      <>
                        <Shield size={11} /> Customer Support
                      </>
                    ) : isBot ? (
                      <>
                        <Bot size={11} /> Customer Support
                      </>
                    ) : (
                      <>
                        <User size={11} /> You
                      </>
                    )}
                    <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>{timeStr}</span>
                  </div>

                  {/* Bubble */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      background: isUser
                        ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(79, 172, 254, 0.25))'
                        : isAdmin
                        ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.18), rgba(0, 242, 254, 0.12))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isUser
                        ? '1px solid rgba(0, 242, 254, 0.4)'
                        : isAdmin
                        ? '1px solid rgba(0, 230, 118, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '13px',
                      lineHeight: 1.45,
                      wordBreak: 'break-word',
                      boxShadow: isUser
                        ? '0 4px 12px rgba(0, 242, 254, 0.15)'
                        : isAdmin
                        ? '0 4px 12px rgba(0, 230, 118, 0.12)'
                        : 'none'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div
            style={{
              padding: '12px 14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(7, 10, 18, 0.9)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '4px 6px 4px 12px',
                transition: 'border-color 0.2s'
              }}
            >
              <input
                type="text"
                placeholder="Ask Customer Support a question..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  padding: '6px 0'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputVal.trim() || loading}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: inputVal.trim()
                    ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: inputVal.trim() ? '#07090e' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputVal.trim() && !loading ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                <Send size={15} />
              </button>
            </div>
            <div
              style={{
                marginTop: '6px',
                textAlign: 'center',
                fontSize: '10px',
                color: '#475569'
              }}
            >
              Messages are answered directly by Customer Support.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

