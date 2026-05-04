import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Users, Star } from 'lucide-react';
import './OrganizerCard.css';

const OrganizerCard = ({ organizer }) => {
  const navigate = useNavigate();

  // Use brandName from organizerProfile if available, else use name
  const name = organizer.organizerProfile?.brandName || organizer.name || 'Organizer';
  const specialty = organizer.organizerProfile?.eventFocus || organizer.specialty || 'Event Planner';
  const avatar = organizer.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200';
  const eventCount = organizer.eventCount || 0;
  const followerCount = organizer.followerCount || '0';
  const rating = organizer.rating || 4.5;
  const reviews = organizer.reviewsCount || organizer.reviews || 0;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="organizer-card glass-panel"
      onClick={() => navigate('/profile')}
      style={{ cursor: 'pointer' }}
    >
      <div className="org-banner">
        <img src={organizer.banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200'} alt="banner" />
      </div>
      <div className="org-profile-pic">
        <img src={avatar} alt={name} />
        <CheckCircle className="verified-badge" size={18} fill="#3b82f6" color="white" />
      </div>
      <div className="org-content">
        <h3>{name}</h3>
        <p className="org-specialty">{specialty}</p>
        
        <div className="org-stats">
          <div className="stat">
            <Calendar size={14} />
            <span>{eventCount} Events</span>
          </div>
          <div className="stat">
            <Users size={14} />
            <span>{followerCount} Followers</span>
          </div>
        </div>

        <div className="org-rating">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span className="rating-val">{rating}</span>
          <span className="total-reviews">({reviews} reviews)</span>
        </div>

        <button className="btn btn-secondary org-btn">View Profile</button>
      </div>
    </motion.div>
  );
};

export default OrganizerCard;
