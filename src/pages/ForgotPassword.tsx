import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            if (data.success) {
                navigate('/reset-password', { state: { email } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card glass-panel">
                <div className="auth-header">
                    <h1 className="gradient-text">Forgot Password?</h1>
                    <p>Enter your email address below and we will send you a 6-digit OTP to reset your password.</p>
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
                        {loading ? 'Sending OTP...' : 'Send OTP'} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-redirect">Remember your password? <NavLink to="/login">Log In</NavLink></p>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;

