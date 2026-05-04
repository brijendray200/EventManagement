import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, User, Calendar, Mail, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data } = await api.get('/feedback');
        if (data.success) {
          setFeedback(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch feedback', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <div className="dashboard-page container" style={{ paddingTop: '120px' }}>
      <div className="dash-header">
        <div className="dh-content">
          <h1 className="gradient-text">Feedback Management</h1>
          <p>Read what users and organizers are saying about the platform.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-state glass-panel">Loading feedback...</div>
      ) : feedback.length === 0 ? (
        <div className="empty-state glass-panel">
          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No feedback received yet.</p>
        </div>
      ) : (
        <div className="feedback-list-grid" style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
          {feedback.map((item: any) => (
            <motion.div 
              key={item._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel feedback-item-card"
              style={{ padding: '1.5rem', position: 'relative' }}
            >
              <div className="feedback-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="white" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.userName}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {item.userEmail}
                    </span>
                  </div>
                </div>
                <div className="rating-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '50px' }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontWeight: 600 }}>{item.rating}</span>
                </div>
              </div>

              <div className="feedback-message" style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem', borderLeft: '3px solid var(--accent-color)' }}>
                {item.event && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Review for: {item.event.title}
                  </div>
                )}
                <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1rem', fontStyle: 'italic' }}>"{item.message}"</p>
              </div>

              {item.media && item.media.length > 0 && (
                <div className="feedback-media" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {item.media.map((m: any, idx: number) => (
                    <div key={idx} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {m.type === 'video' ? (
                        <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                      ) : (
                        <img src={m.url} alt="attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={() => window.open(m.url, '_blank')} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="feedback-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`role-pill ${item.userRole}`} style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: item.userRole === 'organizer' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: item.userRole === 'organizer' ? '#a78bfa' : '#10b981'
                  }}>
                    {item.userRole.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
