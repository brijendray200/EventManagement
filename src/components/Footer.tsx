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
          <div className="footer-rzp-badge">
            <span>Powered by</span>
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" />
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
            <Mail size={16} /> <span>support@eventsphere.com</span>
          </div>
          <div className="contact-item">
            <Phone size={16} /> <span>+1 (234) 567-890</span>
          </div>
          <div className="contact-item">
            <MapPin size={16} /> <span>Cybercity, Tech Village 2045</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; 2026 EventSphere Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

