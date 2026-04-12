import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import './index.css';

const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/Auth/RegisterPage'));
const VerifyOtpPage = React.lazy(() => import('./pages/Auth/VerifyOtpPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const HomeFeed = React.lazy(() => import('./pages/Feed/HomeFeed'));
const ExplorePage = React.lazy(() => import('./pages/Feed/ExplorePage'));
const PostDetailPage = React.lazy(() => import('./pages/Feed/PostDetailPage'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications/NotificationsPage'));
const SchedulePage = React.lazy(() => import('./pages/Games/SchedulePage'));
const GameDetailsPage = React.lazy(() => import('./pages/Games/GameDetailsPage'));
const ProfilePage = React.lazy(() => import('./pages/Profile/ProfilePage'));
const ChatPage = React.lazy(() => import('./pages/Messages/ChatPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="feed-loading">
        <div className="basketball-spinner" />
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/" element={<PrivateRoute><HomeFeed /></PrivateRoute>} />
          <Route path="/post/:postId" element={<PrivateRoute><PostDetailPage /></PrivateRoute>} />
          <Route path="/explore" element={<PrivateRoute><ExplorePage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute><SchedulePage /></PrivateRoute>} />
          <Route path="/game/:gameId" element={<PrivateRoute><GameDetailsPage /></PrivateRoute>} />
          <Route path="/profile/:username" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><ChatPage /></PrivateRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
