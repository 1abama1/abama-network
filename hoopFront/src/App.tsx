import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage.tsx';
import VerifyOtpPage from './pages/Auth/VerifyOtpPage';
import HomeFeed from './pages/Feed/HomeFeed';
import ExplorePage from './pages/Feed/ExplorePage.tsx';
import NotificationsPage from './pages/Notifications/NotificationsPage.tsx';
import SchedulePage from './pages/Games/SchedulePage';
import ProfilePage from './pages/Profile/ProfilePage';
import ChatPage from './pages/Messages/ChatPage';
import Layout from './components/Layout/Layout';
import './index.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        justifyContent: 'center', 
        alignItems: 'center', 
        fontSize: '2rem',
        fontWeight: 'bold',
        color: 'var(--primary)'
      }}>
        🏀 Loading...
      </div>
    );
  }
  
  return isAuthenticated ? <Layout>{children as React.ReactElement}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          
          {/* Private Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <HomeFeed />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/explore" 
            element={
              <PrivateRoute>
                <ExplorePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/schedule" 
            element={
              <PrivateRoute>
                <SchedulePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile/:username" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
