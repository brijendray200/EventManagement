import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer glass-panel">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link to="/" className="logo">
            <Calendar className="logo-icon" size={24} />
            <span>Event<span className="gradient-text">Sphere</span></span>
          </Link>
          <p className="footer-desc">Your ultimate destination for discovering and managing premium events. Experience the future of event planning today.</p>
          <div className="social-links">
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
          </div>
          <div className="footer-rzp-badge" style={{ 
            marginTop: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '8px 16px', 
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            width: 'fit-content'
          }}>
            <div style={{ background: '#3395ff', padding: '4px', borderRadius: '4px', display: 'flex' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.5px' }}>Security Standards</span>
              <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        <div className="footer-links">
          <h4>Navigation</h4>
          <Link to="/">Home</Link>
          <Link to="/events">Browse Events</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <div className="contact-item">
            <Mail size={16} /> <span>support@eventsphere.in</span>
          </div>
          <div className="contact-item">
            <Phone size={16} /> <span>+91 8887626782</span>
          </div>
          <div className="contact-item">
            <MapPin size={16} /> <span>Gomti Nagar, Lucknow, UP 226010</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom container" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        gap: '1rem',
        paddingTop: '3rem',
        paddingBottom: '4rem', // Extra padding to avoid AI Concierge overlap
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <p style={{ opacity: 0.6 }}>&copy; 2026 EventSphere Platform. All rights reserved.</p>
        <div className="crafted-by" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: 'var(--text-dim)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            Crafted by <span style={{ color: 'white', fontWeight: 600 }}>EventSphere</span> • 
            <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Brijendra Yadav
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#3b82f6"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            </span>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Lead Developer & Visionary</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

