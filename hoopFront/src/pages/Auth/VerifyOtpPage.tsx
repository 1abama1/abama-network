import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import '../Auth/Auth.css';

const VerifyOtpPage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const identifier = location.state?.identifier || '';

  useEffect(() => {
    if (!identifier) {
      navigate('/register');
    }
  }, [identifier, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/auth/verify-otp', { identifier, code });
      navigate('/login', { state: { message: 'Verification successful! You can now login.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Incorrect code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await axiosInstance.post('/auth/resend-otp', { identifier });
    } catch (err) {
      console.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual">
         <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="visual-content"
        >
          <ShieldCheck size={80} color="var(--primary)" />
          <h1>Secure Your Game</h1>
          <p>We sent a 6-digit code to your email.</p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="auth-form-wrapper glass"
      >
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-header">
            <h2>Verify Identity</h2>
            <p>Entering the code for <strong>{identifier}</strong></p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>Verification Code</label>
            <input 
              type="text" 
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '8px' }}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <div className="loader" /> : <><ShieldCheck size={20} /> Verify Code</>}
          </button>

          <div className="auth-footer">
            Didn't receive a code? 
            <button 
              type="button" 
              onClick={handleResend} 
              disabled={resending}
              style={{ color: 'var(--primary)', fontWeight: '600', marginLeft: '5px' }}
            >
              {resending ? 'Resending...' : 'Resend'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
