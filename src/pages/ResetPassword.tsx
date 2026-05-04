import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Auth.css';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState(location.state?.devOtp || '');
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post(`/auth/verifyotp`, { email, otp });
            if (data.success) {
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please check your email.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords don't match.");
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await api.put(`/auth/resetpassword`, { email, otp, password });
            if (data.success) {
                alert('Password reset successful! Please log in.');
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page container">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card glass-panel">
                <div className="auth-header">
                    <h1 className="gradient-text">{step === 1 ? 'Verify OTP' : 'Set New Password'}</h1>
                    <p>{step === 1 ? 'Enter the 6-digit OTP sent to your email.' : "Enter your new password below. Make sure it's at least 6 characters long."}</p>
                    {step === 1 && location.state?.devOtp && (
                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.04)', textAlign: 'left' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>OTP (Dev Mode Only)</strong>
                            <span style={{ color: '#a78bfa', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '4px' }}>{location.state.devOtp}</span>
                        </div>
                    )}
                </div>

                <form className="auth-form" onSubmit={step === 1 ? handleVerifyOtp : handleResetPassword}>
                    {step === 1 ? (
                        <>
                            {!location.state?.email && (
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
                            )}

                            <div className="form-group">
                                <label><KeyRound size={16} /> 6-Digit OTP</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter the OTP from your email" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required 
                                    maxLength={6}
                                    style={{ letterSpacing: '2px', fontWeight: 600 }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
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
                                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword((prev) => !prev)}>
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
                                    <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword((prev) => !prev)}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
                        {loading ? 'Processing...' : step === 1 ? 'Verify OTP' : 'Update Password'} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="auth-redirect">Request a <NavLink to="/forgot-password">New Link</NavLink></p>
            </motion.div>
        </div>
    );
};

export default ResetPassword;

