import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Search, MapPin, Info, MessageCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { useMessengerStore } from '../../store/messengerStore';
import { useMessengerSocket } from '../../hooks/useMessengerSocket';
import './Messages.css';

const ChatPage = () => {
  const { user: currentUser } = useAuth();
  const [mutuals, setMutuals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [targetPartner, setTargetPartner] = useState<string | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Store state
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
    markMessageError
  } = useMessengerStore();

  // Hook for real-time events
  const token = localStorage.getItem('accessToken');
  const { sendTypingStart, sendTypingStop } = useMessengerSocket(token);

  // Initial fetch: Conversations & Mutuals
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [convsRes, mutualsRes] = await Promise.all([
          axiosInstance.get('/conversations'),
          axiosInstance.get('/conversations/mutuals')
        ]);
        setConversations(convsRes.data);
        setMutuals(mutualsRes.data);
      } catch (err) {
        console.error('Failed to init messenger', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setConversations, setLoading]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    setTargetPartner(null);

    const fetchMessages = async () => {
      const currentChat = conversations.find(c => c.id === activeConvId);

      if (!messagesByConv[activeConvId]) {
        try {
          const res = await axiosInstance.get(`/conversations/${activeConvId}/messages`, {
            params: { limit: 50 }
          });
          prependMessages(activeConvId, res.data, res.data.length === 50);
        } catch (err) {
          console.error('Failed to fetch messages', err);
        }
      }

      if (currentChat && currentChat.unreadCount > 0) {
        try {
          await axiosInstance.put(`/conversations/${activeConvId}/read`);
          markConvRead(activeConvId);
        } catch (err) {
          console.error('Failed to mark read', err);
        }
      }
    };

    fetchMessages();
  }, [activeConvId, prependMessages, messagesByConv, markConvRead, conversations]);

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = newMessage.trim();
    if (!content || !currentUser) return;

    const tempId = 'temp-' + Date.now();
    setNewMessage('');

    if (activeConvId) {
      const optimistic = {
        id: Math.random() * -1,
        conversationId: activeConvId,
        senderUsername: currentUser.username,
        content: content,
        sentAt: new Date().toISOString(),
        pending: true,
        clientTempId: tempId
      };
      addMessage(optimistic as any);

      try {
        await axiosInstance.post(`/conversations/${activeConvId}/messages`, {
          content,
          clientTempId: tempId
        });
      } catch (err) {
        console.error('Failed to send', err);
        markMessageError(tempId);
      }
    } else if (targetPartner) {
      try {
        const res = await axiosInstance.post(`/conversations/messages?receiver=${targetPartner}`, {
          content,
          clientTempId: tempId
        });
        const newMsg = res.data;

        // Optimistically add the conversation to the list instead of refetching all
        addConversation({
          id: newMsg.conversationId,
          partnerUsername: targetPartner,
          lastMessage: content,
          lastMessageAt: newMsg.sentAt,
          unreadCount: 0,
          partnerOnline: true // Minimal baseline
        } as any);

        setActiveConv(newMsg.conversationId);
      } catch (err) {
        console.error('Failed to start conversation', err);
      }
    }
  };

  const handleStartConversation = (partnerUsername: string) => {
    const existing = conversations.find(c => c.partnerUsername === partnerUsername);
    if (existing) {
      setActiveConv(existing.id);
    } else {
      setActiveConv(null);
      setTargetPartner(partnerUsername);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const activeChat = conversations.find(c => c.id === activeConvId);
  const typingUsers = activeConvId ? (typingByConv[activeConvId] || []) : [];
  const isTyping = typingUsers.length > 0;
  const currentMessages = activeConvId ? (messagesByConv[activeConvId] || []) : [];

  if (loading) return <div className="feed-loading"><div className="basketball-spinner" /></div>;

  return (
    <div className="chat-container">
      <div className="chat-sidebar glass">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <div className="search-chats">
            <Search size={18} />
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
                {mutuals.map(m => (
                  <motion.div
                    key={m.username}
                    className="mutual-item"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleStartConversation(m.username)}
                  >
                    <div className="mutual-avatar-wrap">
                      <div className="chat-avatar small">{m.username.charAt(0).toUpperCase()}</div>
                      <div className="status-ring" />
                    </div>
                    <span className="mutual-name">{m.username}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {conversations
            .filter(c => c.partnerUsername.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((chat) => (
              <motion.div
                key={chat.id}
                className={`chat-item ${activeConvId === chat.id ? 'active' : ''}`}
                onClick={() => setActiveConv(chat.id)}
                whileHover={{ x: 5 }}
              >
                <div className="chat-avatar">
                  {chat.partnerUsername.charAt(0).toUpperCase()}
                </div>
                <div className="chat-info">
                  <div className="chat-name-row">
                    <span className="chat-name">{chat.partnerUsername}</span>
                    {chat.unreadCount > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
                  </div>
                  <p className="last-message truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      <div className="chat-main page-transition">
        {activeChat || targetPartner ? (
          <>
            <header className="chat-header">
              <div className="chat-header-info">
                <MapPin size={20} className="text-primary" />
                <h3>{activeChat?.partnerUsername || targetPartner}</h3>
                {activeChat?.partnerOnline && <span className="status-ring" style={{ position: 'static', marginLeft: 10 }} />}
              </div>
              <div className="chat-header-actions">
                <motion.button whileHover={{ scale: 1.1 }} className="action-circle-btn small"><Info size={18} /></motion.button>
              </div>
            </header>

            <div className="messages-area">
              <AnimatePresence>
                {currentMessages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`message-wrapper ${msg.senderUsername === currentUser?.username ? 'own' : 'other'}`}
                  >
                    <div className="message-bubble glass-card">
                      {msg.content}
                    </div>
                    <span className="send-time">{formatDate(msg.sentAt)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="premium-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!newMessage.trim()}
              >
                <Send size={24} />
              </motion.button>
            </div>
          </>
        ) : (
          <div className="messenger-empty">
            <div className="empty-icon">
              <MessageCircle size={40} />
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
