import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Calendar, 
  Quote,
  Zap,
  Shield,
  Award,
  Music,
  Heart,
  Briefcase,
  Monitor,
  Ticket
} from 'lucide-react';
import EventCard from '../components/EventCard';
import { useLocation } from '../context/LocationContext';
import { motion } from 'framer-motion';
import api from '../utils/api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { city, loading: locLoading } = useLocation();
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  const userRole = localStorage.getItem('userRole') || 'user';
  const [searchQuery, setSearchQuery] = useState('');
  const [realEvents, setRealEvents] = useState([]);
  const [activeAds, setActiveAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [eventRes, adRes] = await Promise.all([
          api.get('/events'),
          api.get('/ads/active')
        ]);
        if (eventRes.data.success) setRealEvents(eventRes.data.data);
        if (adRes.data.success) setActiveAds(adRes.data.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const displayEvents = realEvents;

  const nearbyEvents = displayEvents.filter(event => 
    event.location.toLowerCase().includes(city.toLowerCase())
  );

  const displayNearby = nearbyEvents.length > 0 ? nearbyEvents.slice(0, 3) : displayEvents.slice(0, 3);

  const trendingEvents = displayEvents.filter(event => 
    !event.location.toLowerCase().includes(city.toLowerCase())
  ).slice(0, 3);
  
  const categories = [
    { name: 'Concerts', icon: <Music />, color: '#ec4899', count: 12 },
    { name: 'Workshops', icon: <Monitor />, color: '#6366f1', count: 8 },
    { name: 'Corporate', icon: <Briefcase />, color: '#3b82f6', count: 15 },
    { name: 'Weddings', icon: <Heart />, color: '#f59e0b', count: 5 },
  ];

  const steps = [
    { 
      title: 'Discover Events',
      desc: 'Browse upcoming events in your city and find the one that fits you best.',
      icon: <Search size={32} /> 
    },
    { 
      title: 'Book Tickets',
      desc: 'Reserve your seat in a few steps with a smooth and secure booking flow.',
      icon: <Ticket size={32} /> 
    },
    { 
      title: 'Enjoy the Event',
      desc: 'Attend your event, scan your booking, and enjoy the full experience.',
      icon: <Award size={32} /> 
    }
  ];

  const testimonials = [
    { name: 'Sarah Jenkins', role: 'Event Attendee', text: 'The booking process was easy and I found good events in one place without any confusion.' },
    { name: 'Marcus Chen', role: 'Organizer', text: 'Managing event listings and attendee details has become much simpler for our team.' },
    { name: 'Elena Rodriguez', role: 'Concert Goer', text: 'I was able to check event details, book tickets, and get updates without any hassle.' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleCategoryClick = (catName) => {
    navigate(`/events?category=${encodeURIComponent(catName)}`);
  };

  const handlePrimaryCta = () => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    if (userRole === 'organizer') {
      navigate('/organizer/dashboard');
      return;
    }

    if (userRole === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    navigate('/profile');
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="hero-text"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="gradient-text hero-tagline"
              style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}
            >
              <Zap size={14} style={{ marginRight: '8px' }} /> Discover. Book. Enjoy.
            </motion.div>
            <h1 className="hero-title">Discover and Book <br /><span className="gradient-text">Amazing Events</span></h1>
            <p className="hero-subtitle">Find concerts, workshops, weddings, seminars, and corporate events with a simple booking experience.</p>
            
            <form className="hero-search-bar" onSubmit={handleSearch}>
              <div className="search-field">
                <Search size={22} className="search-icon" style={{ color: 'var(--primary)' }} />
                <input 
                  type="text" 
                  placeholder="Search events, cities, or categories..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">Find Events <ArrowRight size={20}/></button>
            </form>
            
            <div className="hero-stats" style={{ display: 'flex', gap: '3rem', marginTop: '5rem' }}>
              <div className="stat">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>12k+</h3>
                <p style={{ color: 'var(--text-muted)' }}>Tickets Booked</p>
              </div>
              <div className="stat">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>500k+</h3>
                <p style={{ color: 'var(--text-muted)' }}>Happy Users</p>
              </div>
              <div className="stat">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>50+</h3>
                <p style={{ color: 'var(--text-muted)' }}>Cities Covered</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 2 }} 
            animate={{ opacity: 1, x: 0, rotate: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }} 
            className="hero-image-wrapper"
          >
            <div className="hero-bg-accent"></div>
            <img 
              src={activeAds.length > 0 ? activeAds[0].imageUrl : "/assets/hero.png"} 
              alt="Featured Ad" 
              className="hero-img" 
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2000'; }}
              onClick={() => activeAds.length > 0 && window.open(activeAds[0].linkUrl, '_blank')}
              style={{ cursor: activeAds.length > 0 ? 'pointer' : 'default' }}
            />
          </motion.div>
        </div>
      </section>

      {/* NEARBY EXPERIENCES */}
      <section className="featured-section container nearby-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">
              {nearbyEvents.length > 0 ? (
                <>Events Near <span className="gradient-text">{city}</span></>
              ) : (
                <>Global <span className="gradient-text">Trending</span></>
              )}
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
              {nearbyEvents.length > 0 
                ? `Personalized experiences within your immediate vicinity in ${city}.` 
                : 'Popular events people are checking out right now.'}
            </p>
          </div>
          <NavLink to="/events" className="btn btn-secondary">
            See More <ArrowRight size={16} />
          </NavLink>
        </div>

        <div className="event-grid">
          {displayNearby.map((event, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={event._id || event.id}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRENDING EXPERIENCES */}
      <section className="featured-section container">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Trending <span className="gradient-text">Events</span></h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Popular events that users are booking right now.</p>
          </div>
          <NavLink to="/events" className="btn btn-secondary">Explore All <ArrowRight size={16} /></NavLink>
        </div>
        <div className="event-grid">
          {trendingEvents.map((event, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              key={event._id || event.id}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container">
        <div className="how-it-works">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              <h2 className="section-title text-center">How It <span className="gradient-text">Works</span></h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>Everything you need to discover, book, and manage events in one place.</p>
            </div>
            <div className="steps-grid">
              {steps.map((step, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -10 }} 
                  className="step-card glass-panel"
                >
                  <div className="step-icon">{step.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-dim)', lineHeight: '1.6' }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="categories-section container">
        <div className="section-title-group" style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <h2 className="section-title">Browse by <span className="gradient-text">Category</span></h2>
          <p style={{ color: 'var(--text-dim)' }}>Choose a category and explore events that match your interest.</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="category-card glass-panel"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="cat-icon" style={{ color: cat.color }}>{cat.icon}</div>
              <h3 className="cat-name">{cat.name}</h3>
              <p className="cat-count" style={{ fontSize: '0.9rem', opacity: 0.6 }}>{cat.count}+ Events</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials section container">
        <div className="section-header">
           <div className="section-title-group">
            <h2 className="section-title">What Users <span className="gradient-text">Say</span></h2>
            <p style={{ color: 'var(--text-dim)' }}>Feedback from attendees and organizers using the platform.</p>
          </div>
        </div>
        <div className="testi-grid">
          {testimonials.map((testi, i) => (
            <motion.div 
              key={i} 
              className="testi-card glass-panel"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Quote className="quote-icon" size={32} />
              <p className="testi-text">"{testi.text}"</p>
              <div className="testi-author">
                <strong>{testi.name}</strong>
                <p>{testi.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="container" style={{ margin: '10rem auto' }}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="cta-banner" 
          style={{ 
            padding: '8rem 4rem', 
            borderRadius: '3.5rem', 
            textAlign: 'center', 
            background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', top: '-50px', right: '-50px', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'var(--secondary)', filter: 'blur(100px)', bottom: '-50px', left: '-50px', opacity: 0.2 }}></div>
          
          <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '2rem', position: 'relative' }}>Ready to Book Your <span className="gradient-text">Next Event?</span></h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '3.5rem', maxWidth: '600px', margin: '0 auto 3.5rem', position: 'relative' }}>Create your account, explore upcoming events, and reserve tickets in minutes.</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', position: 'relative' }}>
            <button type="button" onClick={handlePrimaryCta} className="btn btn-primary home-cta-btn" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
              {!isAuthenticated ? 'Get Started Now' : userRole === 'organizer' ? 'Open Organizer Hub' : userRole === 'admin' ? 'Open Admin Panel' : 'Open My Profile'} <ArrowRight size={20}/>
            </button>
            <NavLink to="/events" className="btn btn-secondary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>Browse Events</NavLink>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;

