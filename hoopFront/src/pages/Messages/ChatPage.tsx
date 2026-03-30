import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image, MoreVertical, Search, MessageSquare } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { getWebSocketClient, disconnectWebSocket } from '../../api/websocket';
import './Messages.css';

const ChatPage = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axiosInstance.get('/messages/chats');
        setChats(response.data || []);
      } catch (error) {
        console.error('Failed to fetch chats');
        setChats([]);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      try {
        const response = await axiosInstance.get(`/messages/${activeChat.otherUsername}`);
        setMessages(response.data.content || []);
      } catch (error) {
        console.error('Failed to fetch messages');
        setMessages([]);
      }
    };
    fetchMessages();

    // WebSocket integration
    const wsClient = getWebSocketClient();
    if (wsClient && activeChat) {
      wsClient.onConnect(() => {
        wsClient.subscribe('/user/queue/messages', (newMessage: any) => {
          // If the message is from the person we are currently chatting with
          if (newMessage.sender.username === activeChat.otherUsername) {
            setMessages((prev) => {
              // Check if we already have this message to prevent duplicates
              if (prev.some(m => m.id === newMessage.id)) return prev;
              
              return [...prev, newMessage];
            });
          }
        });
      });
    }

    return () => {
      // Disconnect or handle cleanup if needed. We might keep the WS alive for notifications.
      // Not calling disconnectWebSocket() here to keep global connection alive.
    };
  }, [activeChat, currentUser?.username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const messageContent = newMessage.trim();
    const tempId = Date.now().toString();
    
    // OPTIMISTIC UPDATE
    const optimisticMsg = {
      id: tempId,
      sender: { username: currentUser?.username },
      content: messageContent,
      sentAt: new Date().toISOString(),
      status: 'sending' // Custom status for UI
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    try {
      const resp = await axiosInstance.post(`/messages/${activeChat.otherUsername}`, { content: messageContent });
      // Update status to 'sent' and use real ID from server
      setMessages(prev => prev.map(m => m.id === tempId ? { ...resp.data, status: 'sent' } : m));
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      alert(errorMsg); // E.g., Follower restriction error
      // Mark as failed instead of removing, so user can potentially retry
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar glass">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <div className="search-chats">
            <Search size={18} />
            <input type="text" placeholder="Search chats..." />
          </div>
        </div>
        <div className="chats-list">
          {chats.map((chat) => (
            <motion.div 
              key={chat.otherUsername}
              className={`chat-item ${activeChat?.otherUsername === chat.otherUsername ? 'active' : ''}`}
              onClick={() => setActiveChat(chat)}
              whileHover={{ x: 5 }}
            >
              <div className="chat-avatar">
                {chat.otherUsername.charAt(0).toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="chat-name-row">
                  <span className="chat-name">{chat.otherUsername}</span>
                  {chat.unreadCount > 0 && <span className="unread-dot" />}
                </div>
                <p className="last-message truncate">{chat.lastMessage}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="chat-main glass">
        {activeChat ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar small">
                  {activeChat.otherUsername.charAt(0).toUpperCase()}
                </div>
                <h3>{activeChat.otherUsername}</h3>
              </div>
              <div className="chat-header-actions">
                <MoreVertical size={20} />
              </div>
            </div>

            <div className="messages-area">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`message-wrapper ${msg.sender?.username === currentUser?.username ? 'own' : 'other'} ${msg.status || ''}`}
                  >
                    <div className="message-bubble">
                      {msg.content}
                      {msg.status === 'sending' && <span className="msg-status-loader">...</span>}
                      {msg.status === 'error' && <span className="msg-status-error" title="Failed to send">!</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <button type="button" className="tool-btn"><Image size={20} /></button>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
