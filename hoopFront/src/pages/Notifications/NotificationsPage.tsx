import { Bell, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationsPage = () => {
  return (
    <div className="feed-container">
      <div className="feed-header">
        <div className="header-title">
          <h2>Notifications</h2>
          <p>Stay up to date with your crew</p>
        </div>
      </div>

      <div className="notifications-placeholder glass">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state"
        >
          <Bell size={64} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
          <h3>Coming Soon</h3>
          <p>Real-time alerts for likes, follows, and new game registrations are in the lab.</p>
          <div className="info-badge">
            <Info size={16} />
            <span>Sneak peek: Court Direct notifications & social pings.</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        .notifications-placeholder {
          margin-top: 2rem;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .info-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 107, 0, 0.1);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-top: 2rem;
          font-size: 0.9rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
