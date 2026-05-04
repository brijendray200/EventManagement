import React, { useState } from 'react';
import { MessageSquare, X, Send, User as UserIcon, Hash } from 'lucide-react';
import api from '../utils/api';
import './FeedbackWidget.css';

const FeedbackWidget = ({ userRole, userProfile, isOpen, onClose }) => {
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Hide if not authenticated
  if (!userRole) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/feedback', { rating, message });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage('');
        setRating(5);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-panel glass-panel center-modal" onClick={e => e.stopPropagation()}>
        <div className="feedback-header">
          <div className="header-title-box">
            <MessageSquare size={20} color="var(--accent-color)" />
            <h3>Submit Feedback</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-user-context">
          <div className="context-item">
            <UserIcon size={14} />
            <span>{userProfile?.name}</span>
          </div>
          <div className="context-item id-badge">
            <Hash size={14} />
            <span>ID: {userProfile?.id?.slice(-8).toUpperCase() || 'USER-ID'}</span>
          </div>
        </div>
        
        {success ? (
          <div className="feedback-success">
            <div className="success-icon-box">
               <Send size={24} color="#10b981" />
            </div>
            <p>Thank you for your feedback!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            <p className="feedback-desc">
              How is your experience with <strong>EventSphere</strong>?
            </p>
            
            <div className="rating-select">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  type="button" 
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea 
              placeholder="Tell us what you love or what could be improved..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
            ></textarea>

            <button type="submit" className="btn btn-primary" disabled={submitting || !message.trim()}>
              <Send size={16} /> {submitting ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackWidget;
