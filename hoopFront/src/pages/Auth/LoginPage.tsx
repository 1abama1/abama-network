import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Trophy } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/services/authService';
import { useToast } from '../../components/Common/Toast';
import './Auth.css';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const [identifier, setIdentifier] = useState(location.state?.identifier || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(identifier, password);
      const { user, accessToken, refreshToken } = response.data;
      login(user, accessToken, refreshToken);
      navigate('/');
    } catch (err: unknown) {
      let message = 'Login failed. Please check your credentials.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message = axiosErr.response?.data?.message || message;
      }
      setError(message);
      addToast(message, 'error');

      if (message.includes('не подтвержден') || message.includes('not verified')) {
        timeoutRef.current = setTimeout(() => {
          navigate('/verify-otp', { state: { identifier } });
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="visual-content"
        >
          <Trophy size={80} color="var(--primary)" />
          <h1>HoopConnect</h1>
          <p>Where the game never stops.</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="auth-form-wrapper glass"
      >
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Login to your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message" style={{
            padding: '1rem',
            background: 'rgba(0, 255, 128, 0.1)',
            border: '1px solid rgba(0, 255, 128, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: '#00ff80',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>{success}</div>}

          <div className="input-group">
            <label>Username or Email</label>
            <input
              type="text"
              placeholder="Enter your identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="loader" /> : <><LogIn size={20} /> Login</>}
          </button>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
