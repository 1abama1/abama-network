import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, UserPlus, Repeat, Zap, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import type { NotificationItem } from '../../hooks/useNotifications';

const TYPE_CONFIG = {
  LIKE: { icon: <Heart size={16} />, color: '#f91880', label: 'liked your post' },
  COMMENT: { icon: <MessageCircle size={16} />, color: '#ff6b00', label: 'commented on your post' },
  FOLLOW: { icon: <UserPlus size={16} />, color: '#1d9bf0', label: 'started following you' },
  REPOST: { icon: <Repeat size={16} />, color: '#00ba7c', label: 'reposted your post' },
  GAME_JOIN: { icon: <Zap size={16} />, color: '#ffd700', label: 'joined your game' },
} as const;

const NotificationCard = ({ n, onClick }: { n: NotificationItem; onClick: () => void }) => {
  const cfg = TYPE_CONFIG[n.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`notification-card ${n.isRead ? '' : 'unread'}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="notif-icon" style={{ color: cfg.color }}>
        {cfg.icon}
      </div>
      <div className="notif-content">
        <p>
          <strong>@{n.actor?.username}</strong> {cfg.label}
        </p>
        <span className="notif-time">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </span>
      </div>
      {!n.isRead && <div className="unread-dot" />}
    </motion.div>
  );
};

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, fetchNotifications, markAllRead } =
    useNotifications(user?.username);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClick = (n: NotificationItem) => {
    if (n.entityType === 'POST') navigate(`/post/${n.entityId}`);
    if (n.entityType === 'GAME') navigate(`/game/${n.entityId}`);
    if (n.entityType === 'USER') navigate(`/profile/${n.actor.username}`);
  };

  return (
    <div className="home-feed">
      <div className="feed-header glass">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <h2>Notifications</h2>
          {unreadCount > 0 && <span className="notif-badge-header">{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button className="btn-outline" onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <AnimatePresence>
        {notifications.length === 0 ? (
          <div className="empty-feed">
            <Bell size={48} color="var(--primary)" style={{ opacity: 0.2 }} />
            <h3>All caught up!</h3>
            <p>Baller activity will appear here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(n => (
              <NotificationCard key={n.id} n={n} onClick={() => handleClick(n)} />
            ))}
          </div>
        )}
      </AnimatePresence>

      <style>{`
                .notifications-list { display: flex; flex-direction: column; }
                .notification-card {
                    display: flex; align-items: center; gap: 1rem;
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid var(--border);
                    transition: all 0.2s;
                    position: relative;
                }
                .notification-card:hover { background: rgba(255,255,255,0.03); }
                .notification-card.unread { background: rgba(255,107,0,0.05); }
                .notif-icon {
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .notif-content { flex: 1; }
                .notif-content p { margin: 0 0 0.25rem; font-size: 0.95rem; color: var(--text); }
                .notif-time { font-size: 0.8rem; color: var(--text-dim); }
                .unread-dot {
                    width: 8px; height: 8px; border-radius: 50%;
                    background: var(--primary);
                    flex-shrink: 0;
                    box-shadow: 0 0 10px var(--primary);
                }
                .notif-badge-header {
                    background: var(--primary);
                    color: black;
                    padding: 0.1rem 0.5rem;
                    border-radius: 1rem;
                    font-size: 0.8rem;
                    font-weight: 800;
                }
            `}</style>
    </div>
  );
};

export default NotificationsPage;
