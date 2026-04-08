import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetUrl, setResetUrl] = useState('');
    const [emailDelivered, setEmailDelivered] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            if (data.success) {
                setResetUrl(data.resetUrl || '');
                setEmailDelivered(!!data.emailDelivered);
                setSent(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="auth-page container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card glass-panel">
                    <div className="auth-header">
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 2rem', color: '#22c55e' }}>
                            <ShieldCheck size={32} style={{margin:'0 auto'}}/>
                        </div>
                        <h1 className="gradient-text">{emailDelivered ? 'Email Sent!' : 'Reset Link Ready!'}</h1>
                        <p>
                          {emailDelivered
                            ? <>We have sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.</>
                            : <>Email service is not configured locally yet, so use the reset link below for testing.</>}
                        </p>
                    </div>
                    {!emailDelivered && resetUrl && (
                        <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.04)', wordBreak: 'break-word', textAlign: 'left' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Reset Link</strong>
                            <a href={resetUrl} style={{ color: '#a78bfa' }}>{resetUrl}</a>
                        </div>
                    )}
                    <NavLink to="/login" className="btn btn-secondary auth-btn" style={{ gap: '0.75rem' }}>
                        <ArrowLeft size={18} /> Back to Login
                    </NavLink>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="auth-page container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card glass-panel">
                <div className="auth-header">
                    <h1 className="gradient-text">Forgot Password?</h1>
                    <p>Enter your email address below and we will send you a link to reset your password.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><Mail size={16} /> Email Address</label>
                        <input 
                            type="email" 
                            placeholder="your@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-redirect">Remember your password? <NavLink to="/login">Log In</NavLink></p>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;

