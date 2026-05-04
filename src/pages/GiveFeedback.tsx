import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Send, User, Mail, Hash } from 'lucide-react';
import api from '../utils/api';
import './Auth.css'; // Reusing some auth styles for consistency

const GiveFeedback = ({ userProfile, userRole }) => {
    const [rating, setRating] = useState(5);
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/feedback', { rating, message });
            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            console.error('Failed to submit feedback', error);
            alert('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page container" style={{ paddingTop: '120px', minHeight: '90vh' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card glass-panel feedback-card"
                style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}
            >
                <div className="auth-header">
                    <h1 className="gradient-text">Give Feedback</h1>
                    <p>We value your thoughts! Help us improve EventSphere.</p>
                </div>

                <div className="user-context-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Identity</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={16} color="#a78bfa" />
                            <span style={{ fontSize: '0.95rem' }}>{userProfile?.name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Hash size={16} color="#a78bfa" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>ID: {userProfile?.id?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Mail size={16} color="#a78bfa" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>{userProfile?.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Star size={16} color="#a78bfa" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{userRole} Account</span>
                        </div>
                    </div>
                </div>

                {success ? (
                    <div className="feedback-success-state" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Send size={30} color="#10b981" />
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>Feedback Submitted!</h2>
                        <p style={{ color: 'var(--text-dim)' }}>Thank you for helping us make EventSphere better. Redirecting you home...</p>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span>Rating</span>
                                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{rating} / 5</span>
                            </label>
                            <div className="rating-selector" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        key={star} 
                                        type="button" 
                                        onClick={() => setRating(star)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            fontSize: '2rem', 
                                            cursor: 'pointer',
                                            color: rating >= star ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                            transition: 'transform 0.2s ease',
                                            transform: rating === star ? 'scale(1.2)' : 'scale(1)'
                                        }}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Your Message</label>
                            <textarea 
                                placeholder="Describe your experience or suggest improvements..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={6}
                                style={{ 
                                    width: '100%', 
                                    padding: '1rem', 
                                    borderRadius: '0.75rem', 
                                    background: 'rgba(0,0,0,0.2)', 
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    resize: 'none'
                                }}
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary auth-btn" 
                            disabled={submitting || !message.trim()}
                            style={{ marginTop: '2rem', width: '100%' }}
                        >
                            {submitting ? 'Sending...' : 'Submit Feedback'} <Send size={18} style={{ marginLeft: '10px' }} />
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default GiveFeedback;
