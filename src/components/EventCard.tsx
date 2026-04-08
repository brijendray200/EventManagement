import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowRight, Sparkles, Images } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';
import './EventCard.css';

const EventCard = ({ event }) => {
  const { formatPrice } = useCurrency();
  const cardRef = useRef(null);

  // Motion values for tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map mouse position to rotation
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 1000 }}
      whileHover={{ scale: 1.02 }}
      className="event-card-wrapper"
    >
      <div className="event-card glass-panel">
        <div className="event-img-wrapper">
          <img 
            src={event.galleryImages?.[0] || event.image} 
            alt={event.title} 
            className="event-img" 
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200'; }}
          />
          <div className="event-category-badge">{event.category}</div>
          {event.isSponsored && (
            <div className="sponsored-badge">
              <Sparkles size={12} /> SPONSORED
            </div>
          )}
          {event.galleryImages?.length > 1 && (
            <div className="gallery-badge">
              <Images size={12} /> {event.galleryImages.length}
            </div>
          )}
        </div>
        
        <div className="event-details">
          <h3 className="event-title">{event.title}</h3>
          
          <div className="event-meta">
            <div className="meta-item"><Calendar size={16} /> <span>{event.date}</span></div>
            <div className="meta-item"><MapPin size={16} /> <span>{event.location}</span></div>
            <div className="meta-item"><Ticket size={16} /> <span>{formatPrice(event.price)}</span></div>
          </div>
          {!!event.highlightPoints?.length && (
            <div className="event-points">
              {event.highlightPoints.slice(0, 2).map((point, index) => (
                <span key={`${point}-${index}`}>{point}</span>
              ))}
            </div>
          )}
          
          <Link to={`/events/${event._id || event.id}`} className="btn btn-secondary card-btn">
            View Details <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;

