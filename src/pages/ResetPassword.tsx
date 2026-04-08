import React, { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords don't match.");
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await api.put(`/auth/resetpassword/${token}`, { password });
            if (data.success) {
                alert('Password reset successful! Please log in.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token. Please request a new one.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card glass-panel">
                <div className="auth-header">
                    <h1 className="gradient-text">Set New Password</h1>
                    <p>Enter your new password below. Make sure it's at least 6 characters long.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><Lock size={16} /> New Password</label>
                        <div className="password-input-wrap">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                minLength={6}
                            />
                            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label><Lock size={16} /> Confirm New Password</label>
                        <div className="password-input-wrap">
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                placeholder="••••••••" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                                minLength={6}
                            />
                            <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Resetting...' : 'Update Password'} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-redirect">Request a <NavLink to="/forgot-password">New Link</NavLink></p>
            </motion.div>
        </div>
    );
};

export default ResetPassword;

