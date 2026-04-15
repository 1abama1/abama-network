import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, ArrowLeft, Info, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMessengerStore } from '../../store/messengerStore';
import { useMessengerSocket } from '../../hooks/useMessengerSocket';
import { tokenStorage } from '../../utils/tokenStorage';
import { conversationService } from '../../api/services/conversationService';
import { useToast } from '../../components/Common/Toast';
import type { UserSummary } from '../../types/user';
import type { Message } from '../../types/messenger';
import './Messages.css';

const ChatPage = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [mutuals, setMutuals] = useState<UserSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [targetPartner, setTargetPartner] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messagesByConv,
    activeConvId,
    typingByConv,
    loading,
    setConversations,
    setActiveConv,
    prependMessages,
    addMessage,
    markConvRead,
    setLoading,
    addConversation,
  } = useMessengerStore();

  const token = tokenStorage.getAccessToken();
  const { sendMessage, sendTypingStart, sendTypingStop } = useMessengerSocket(token);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [convsRes, mutualsRes] = await Promise.all([
          conversationService.getConversations(),
          conversationService.getMutuals(),
        ]);
        setConversations(convsRes.data);
        setMutuals(mutualsRes.data);
      } catch {
        addToast('Failed to load messenger', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setConversations, setLoading, addToast]);

  useEffect(() => {
    if (!activeConvId) return;
    setTargetPartner(null);

    const fetchMessages = async () => {
      const currentChat = conversations.find((c) => c.id === activeConvId);

      if (!messagesByConv[activeConvId]) {
        try {
          const res = await conversationService.getMessages(activeConvId, 50);
          const msgs: Message[] = res.data;
          prependMessages(activeConvId, msgs, msgs.length === 50);
        } catch {
          addToast('Failed to load messages', 'error');
        }
      }

      if (currentChat && currentChat.unreadCount > 0) {
        try {
          await conversationService.markRead(activeConvId);
          markConvRead(activeConvId);
        } catch {
          addToast('Failed to mark read', 'error');
        }
      }
    };

    fetchMessages();
  }, [activeConvId, prependMessages, messagesByConv, markConvRead, conversations, addToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeConvId || !currentUser) return;

    if (!newMessage && e.target.value) {
      sendTypingStart(activeConvId);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(activeConvId);
    }, 2000);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    }, 50);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = newMessage.trim();
    if (!content || !currentUser) return;

    const tempId = 'temp-' + Date.now();
    setNewMessage('');

    if (activeConvId) {
      const optimistic: Message = {
        id: -(Date.now()),
        conversationId: activeConvId,
        senderUsername: currentUser.username,
        content,
        sentAt: new Date().toISOString(),
        readAt: null,
        pending: true,
        clientTempId: tempId,
      };
      addMessage(optimistic);

      const activeChat = conversations.find((c) => c.id === activeConvId);
      sendMessage(activeChat?.partnerUsername || '', content, tempId);
    } else if (targetPartner) {
      try {
        const res = await conversationService.sendMessage(targetPartner, content, tempId);
        const newMsg = res.data;

        addConversation({
          id: newMsg.conversationId,
          partnerUsername: targetPartner,
          lastMessage: content,
          lastMessageAt: newMsg.sentAt,
          unreadCount: 0,
          partnerOnline: true,
        });

        setActiveConv(newMsg.conversationId);
      } catch {
        addToast('Failed to start conversation', 'error');
      }
    }
  };

  const handleStartConversation = (partnerUsername: string) => {
    const existing = conversations.find((c) => c.partnerUsername === partnerUsername);
    if (existing) {
      setActiveConv(existing.id);
    } else {
      setActiveConv(null);
      setTargetPartner(partnerUsername);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeChat = conversations.find((c) => c.id === activeConvId);
  const typingUsers = activeConvId ? typingByConv[activeConvId] || [] : [];
  const isTyping = typingUsers.length > 0;
  const currentMessages = activeConvId ? messagesByConv[activeConvId] || [] : [];

  useEffect(() => {
    if (activeConvId && currentMessages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [activeConvId, currentMessages.length]);

  if (loading)
    return (
      <div className="feed-loading">
        <div className="basketball-spinner" />
      </div>
    );

  return (
    <div className={`chat-container${activeConvId ? ' chat-active' : ''}`}>
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="chat-sidebar glass">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <div className="search-chats">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="chats-list">
          {mutuals.length > 0 && !searchTerm && (
            <div className="mutuals-bar">
              <span className="section-title">Active Now</span>
              <div className="mutuals-scroll">
                {mutuals.map((m) => (
                  <div
                    key={m.username}
                    className="mutual-item"
                    onClick={() => handleStartConversation(m.username)}
                  >
                    <div className="mutual-avatar-wrap">
                      <div className="chat-avatar small">
                        {m.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="status-ring" />
                    </div>
                    <span className="mutual-name">{m.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {conversations
            .filter((c) =>
              c.partnerUsername?.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((chat) => (
              <div
                key={chat.id}
                className={`chat-item${activeConvId === chat.id ? ' active' : ''}`}
                onClick={() => setActiveConv(chat.id)}
              >
                <div className="chat-avatar">
                  {chat.partnerUsername.charAt(0).toUpperCase()}
                </div>
                <div className="chat-info">
                  <div className="chat-name-row">
                    <span className="chat-name">{chat.partnerUsername}</span>
                    {chat.unreadCount > 0 && (
                      <span className="unread-badge">{chat.unreadCount}</span>
                    )}
                  </div>
                  <p className="last-message">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </aside>

      {/* ── Main chat ─────────────────────────────────────────────────── */}
      <div className="chat-main">
        {activeChat || targetPartner ? (
          <>
            <header className="chat-header">
              <div className="chat-header-info">
                <button
                  className="mobile-back-btn"
                  onClick={() => setActiveConv(null)}
                >
                  <ArrowLeft size={22} />
                </button>
                <div className="chat-avatar small">
                  {(activeChat?.partnerUsername || targetPartner || '')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <h3>{activeChat?.partnerUsername || targetPartner}</h3>
                {activeChat?.partnerOnline && (
                  <span className="online-dot" />
                )}
              </div>
              <div className="chat-header-actions">
                <button className="btn-premium-icon">
                  <Info size={16} />
                </button>
              </div>
            </header>

            <div className="messages-area">
              <AnimatePresence>
                {currentMessages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`message-wrapper${
                      msg.senderUsername === currentUser?.username
                        ? ' own'
                        : ' other'
                    }`}
                  >
                    <div
                      className={`message-bubble${msg.pending ? ' pending' : ''}${
                        msg.error ? ' error' : ''
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="send-time">{formatTime(msg.sentAt)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="typing-pill"
                >
                  <div className="typing-dots">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                  <span>{typingUsers[0]} is typing...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-area">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="premium-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!newMessage.trim()}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </>
        ) : (
          <div className="messenger-empty">
            <div className="empty-icon">
              <MessageCircle size={36} />
            </div>
            <h2>Your Inbox</h2>
            <p>Select a baller from the list to start a run.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
