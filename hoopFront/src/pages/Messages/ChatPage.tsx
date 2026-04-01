import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, MoreVertical, Search, MessageSquare } from 'lucide-react';
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
    setConversations,
    setActiveConv,
    prependMessages,
    addMessage,
    markConvRead,
    setLoading
  } = useMessengerStore();

  // Hook for real-time events
  const token = localStorage.getItem('accessToken');
  const { sendTypingStart, sendTypingStop } = useMessengerSocket(token);

  // 1. Initial fetch: Conversations & Mutuals
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

  // 2. Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    setTargetPartner(null); // Clear ghost target

    const fetchMessages = async () => {
      // Only fetch if we don't have messages yet or history is empty
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
      // Mark as read
      try {
        await axiosInstance.put(`/conversations/${activeConvId}/read`);
        markConvRead(activeConvId);
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    };

    fetchMessages();
  }, [activeConvId, prependMessages, messagesByConv, markConvRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentMessages = activeConvId ? (messagesByConv[activeConvId] || []) : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeConvId || !currentUser) return;

    // Start typing
    if (!newMessage && e.target.value) {
      sendTypingStart(activeConvId);
    }

    // Stop typing debounce
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStop(activeConvId);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !currentUser) return;

    const tempId = 'temp-' + Date.now();
    setNewMessage('');

    if (activeConvId) {
      // Existing conversation
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
      }
    } else if (targetPartner) {
      // First message to a mutual follower
      try {
        const res = await axiosInstance.post(`/conversations/messages?receiver=${targetPartner}`, {
          content,
          clientTempId: tempId
        });
        const newMsg = res.data;

        // Refresh conversations to include the new one
        const convsRes = await axiosInstance.get('/conversations');
        setConversations(convsRes.data);

        // Switch to the new conversation
        setActiveConv(newMsg.conversationId);
      } catch (err) {
        console.error('Failed to start conversation', err);
      }
    }
  };

  // Handling click on a mutual follower (start new or open existing)
  const handleStartConversation = (partnerUsername: string) => {
    const existing = conversations.find(c => c.partnerUsername === partnerUsername);
    if (existing) {
      setActiveConv(existing.id);
    } else {
      setActiveConv(null);
      setTargetPartner(partnerUsername);
    }
  };

  const activeChat = conversations.find(c => c.id === activeConvId);
  const typingUsers = activeConvId ? (typingByConv[activeConvId] || []) : [];

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
            <div className="mutuals-section">
              <span className="section-title">Mutual Followers</span>
              <div className="mutuals-grid">
                {mutuals.map(m => (
                  <motion.div
                    key={m.username}
                    className="mutual-bubble"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleStartConversation(m.username)}
                  >
                    <div className="chat-avatar small">{m.username.charAt(0).toUpperCase()}</div>
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
                <div className={`chat-avatar ${chat.partnerOnline ? 'online' : ''}`}>
                  {chat.partnerUsername.charAt(0).toUpperCase()}
                </div>
                <div className="chat-info">
                  <div className="chat-name-row">
                    <span className="chat-name">{chat.partnerUsername}</span>
                    {chat.unreadCount > 0 && <span className="unread-dot">{chat.unreadCount}</span>}
                  </div>
                  <p className="last-message truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      <div className="chat-main glass">
        {(activeConvId || targetPartner) ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className={`chat-avatar small ${activeChat?.partnerOnline ? 'online' : ''}`}>
                  {(activeChat?.partnerUsername || targetPartner || '').charAt(0).toUpperCase()}
                </div>
                <h3>{activeChat?.partnerUsername || targetPartner}</h3>
              </div>
              <div className="chat-header-actions">
                <MoreVertical size={20} />
              </div>
            </div>

            <div className="messages-area">
              {currentMessages.length > 0 ? (
                <AnimatePresence>
                  {currentMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`message-wrapper ${msg.senderUsername === currentUser?.username ? 'own' : 'other'} ${msg.pending ? 'pending' : ''} ${msg.error ? 'error' : ''}`}
                    >
                      <div className="message-bubble">
                        {msg.content}
                        {msg.pending && <span className="msg-status-loader">...</span>}
                        {msg.error && <span className="msg-status-error" title="Failed to send">!</span>}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="first-message-hint">
                  <p>Start your conversation with {activeChat?.partnerUsername || targetPartner}!</p>
                </div>
              )}
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="typing-indicator"
                >
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <span className="typing-text">
                    {typingUsers[0]} is typing...
                  </span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <button type="button" className="tool-btn"><Image size={20} /></button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleInputChange}
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <MessageSquare size={80} color="var(--primary)" />
            <h2>Court Direct</h2>
            <p>Select a baller to start talking strategy.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
