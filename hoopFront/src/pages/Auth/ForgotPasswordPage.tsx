import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Zap, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api/services/authService';
import { useToast } from '../../components/Common/Toast';
import './Auth.css';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { addToast } = useToast();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setStep('reset');
            setSuccess('Reset code sent! Please check your email.');
            addToast('Reset code sent to your email.', 'success');
        } catch (err: unknown) {
            let message = 'Failed to request password reset.';
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

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email, otp, newPassword);
            setSuccess('Password reset successful! Redirecting to login...');
            addToast('Password reset successful!', 'success');
            timeoutRef.current = setTimeout(() => navigate('/login', { state: { identifier: email } }), 2000);
        } catch (err: unknown) {
            let message = 'Failed to reset password. Check your code.';
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
                    transition={{ duration: 0.8 }}
                    className="visual-content"
                >
                    <ShieldCheck size={80} color="var(--primary)" />
                    <h1>Account Recovery</h1>
                    <p>Securing your court access with triple-team defense.</p>
                </motion.div>
            </div>

            <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="auth-form-wrapper glass"
            >
                <div className="auth-form">
                    <Link to="/login" className="premium-back-link">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>

                    <AnimatePresence mode="wait">
                        {step === 'request' ? (
                            <motion.form
                                key="request"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleRequestReset}
                            >
                                <div className="form-header">
                                    <h2>Reset Password</h2>
                                    <p>Enter your email address to receive a recovery code.</p>
                                </div>

                                {error && <div className="error-message">{error}</div>}

                                <div className="input-group">
                                    <label>Email Address</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            placeholder="johndoe@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
                                    {loading ? <div className="loader" /> : <><Zap size={20} fill="currentColor" /> Send Reset Code</>}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="reset"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleResetPassword}
                            >
                                <div className="form-header">
                                    <h2>Secure Reset</h2>
                                    <p>Check your email (<strong>{email}</strong>) for the 6-digit code.</p>
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
                                    <label>Reset Code</label>
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        style={{ textAlign: 'center', fontSize: '2rem', letterSpacing: '8px' }}
                                        required
                                    />
                                </div>

                                <div className="input-row">
                                    <div className="input-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Confirm</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
                                    {loading ? <div className="loader" /> : <><ShieldCheck size={20} /> Update Password</>}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
