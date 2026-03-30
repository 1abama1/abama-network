import React from 'react';
import Sidebar from '../Navigation/Sidebar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <div className="content-inner">
          {children}
        </div>
      </main>
      <aside className="right-sidebar">
        <div className="search-bar-container glass">
          <input type="text" placeholder="Search the court..." />
        </div>
        <div className="trending-games glass">
          <h3>Trending Games</h3>
          <div className="trending-list">
            <p className="empty-state">No games trending yet.</p>
          </div>
        </div>
        <div className="who-to-follow glass">
          <h3>Who to follow</h3>
          <div className="follow-list">
            <p className="empty-state">Looking for ballers...</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Layout;
