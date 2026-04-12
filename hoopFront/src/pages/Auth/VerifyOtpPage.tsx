import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services/authService';
import { useToast } from '../../components/Common/Toast';
import '../Auth/Auth.css';

const VerifyOtpPage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const identifier = location.state?.identifier || '';

  useEffect(() => {
    if (!identifier) {
      navigate('/register');
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
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
      await authService.verifyOtp(identifier, code);
      navigate('/login', {
        state: {
          message: 'Verification successful! You can now login.',
          identifier: identifier
        }
      });
    } catch (err: unknown) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      let message = 'Incorrect code.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        message = axiosErr.response?.data?.message || message;
      }

      if (newAttempts >= 5) {
        setError('Too many failed attempts. Security lock triggered. Redirecting to login...');
        addToast('Too many failed attempts.', 'error');
        timeoutRef.current = setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(`${message} ${5 - newAttempts} attempts remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOtp(identifier);
      addToast('Verification code resent!', 'success');
    } catch (err) {
      console.error('Failed to resend OTP');
      addToast('Failed to resend code. Please try again.', 'error');
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
