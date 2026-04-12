import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services/authService';
import { useToast } from '../../components/Common/Toast';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData.username, formData.email, formData.password);
      navigate('/verify-otp', { state: { identifier: formData.email } });
    } catch (err: unknown) {
      let message = 'Registration failed. Try again.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message = axiosErr.response?.data?.message || message;
      }
      setError(message);
      addToast(message, 'error');
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
          <h1>Join the Court</h1>
          <p>Connect with players, find games, and level up.</p>
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
            <h2>Create Account</h2>
            <p>Fill in your details below</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Confirm</label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? <div className="loader" /> : <><UserPlus size={20} /> Create Account</>}
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
