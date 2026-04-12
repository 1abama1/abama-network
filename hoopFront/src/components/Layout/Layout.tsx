import React, { useEffect, useState } from 'react';
import Sidebar from '../Navigation/Sidebar';
import { gameService } from '../../api/services/gameService';
import { userService } from '../../api/services/userService';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Game } from '../../types/game';
import type { UserSummary } from '../../types/user';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<UserSummary[]>([]);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [gamesRes, usersRes] = await Promise.all([
          gameService.getTrending(),
          userService.getRecommended()
        ]);
        setTrendingGames(gamesRes.data.slice(0, 3));
        setRecommendedUsers(usersRes.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch sidebar data', error);
      }
    };
    fetchSidebarData();
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="layout-container">
      <header className="mobile-header">
        <div className="mobile-logo">
          <Trophy size={24} color="var(--primary)" />
          <span className="logo-text">HoopConnect</span>
        </div>
        <div className="mobile-header-actions">
          <button className="mobile-logout-btn" onClick={logout}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <Sidebar />
      <main className="main-content">
        <div className="content-inner">
          {children}
        </div>
      </main>
      <aside className="right-sidebar">
        <div className="search-bar-container glass">
          <input
            type="text"
            placeholder="Search the court..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <div className="sidebar-section trending-games glass">
          <div className="section-header">
            <Trophy size={18} color="var(--primary)" />
            <h3>Trending Games</h3>
          </div>
          <div className="trending-list">
            {trendingGames.length > 0 ? trendingGames.map(game => (
              <div
                key={game.id}
                className="trending-item"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <div className="item-info">
                  <span className="item-title">{game.title}</span>
                  <span className="item-meta">
                    <Users size={12} />
                    {game.playerCount} players joined
                  </span>
                </div>
                <div className="item-chevron">→</div>
              </div>
            )) : (
              <p className="empty-state">No games trending yet.</p>
            )}
          </div>
        </div>

        <div className="sidebar-section who-to-follow glass">
          <div className="section-header">
            <Users size={18} color="var(--primary)" />
            <h3>Who to follow</h3>
          </div>
          <div className="follow-list">
            {recommendedUsers.length > 0 ? recommendedUsers.map(user => (
              <div
                key={user.id}
                className="follow-item"
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                <div className="baller-avatar-small">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="item-info">
                  <span className="baller-name">{user.username}</span>
                  <span className="baller-handle">@{user.username}</span>
                </div>
              </div>
            )) : (
              <p className="empty-state">Looking for ballers...</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Layout;
