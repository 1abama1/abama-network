
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Calendar,
  MessageSquare,
  User,
  LogOut,
  Trophy,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import './Navigation.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications(user?.username);
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <Trophy size={32} color="var(--primary)" />
        <span className="logo-text">HoopConnect</span>
      </div>

      <div className="sidebar-search">
        <button 
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => navigate('/')}
        >
          POST
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Search size={24} />
          <span>Explore</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="nav-unread-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span>Notifications</span>
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <MessageSquare size={24} />
          <span>Messages</span>
        </NavLink>
        <NavLink to="/schedule" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={24} />
          <span>Game Schedule</span>
        </NavLink>
        <NavLink to={user?.username ? `/profile/${user.username}` : '#'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <User size={24} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-brief">
          <div className="avatar-placeholder">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="username">@{user?.username || 'Guest'}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
