import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Globe,
  ArrowRight,
  Calendar,
  Ticket,
  Sparkles
} from 'lucide-react';
import './About.css';

const About = () => {
  const stats = [
    { label: 'Events Hosted', value: '15,000+', icon: <Award /> },
    { label: 'Happy Users', value: '1M+', icon: <Users /> },
    { label: 'Global Cities', value: '50+', icon: <Globe /> },
    { label: 'Growth Rate', value: '250%', icon: <TrendingUp /> }
  ];

  const values = [
    { 
      title: 'Innovation First', 
      desc: 'We build simple tools that make event discovery, booking, and management easier for everyone.',
      icon: <Target size={32} /> 
    },
    { 
      title: 'Safe & Secure', 
      desc: 'Your booking information and event access are handled with secure and reliable systems.',
      icon: <ShieldCheck size={32} /> 
    },
    { 
      title: 'Community Driven', 
      desc: 'We support attendees, organizers, and teams who want a better event experience.',
      icon: <Users size={32} /> 
    }
  ];

  const storyHighlights = [
    { label: 'City Focus', value: 'Lucknow First', icon: <Globe size={18} /> },
    { label: 'Booking Experience', value: 'Simple & Fast', icon: <Ticket size={18} /> },
    { label: 'Organizer Tools', value: 'Built In', icon: <Calendar size={18} /> },
  ];

  return (
    <div className="about-page">
      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="gradient-text"
          >
            About <br />EventSphere
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            EventSphere helps people discover events, book tickets, and manage experiences from one place.
          </motion.p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="about-stats container">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }} 
              whileInView={{ opacity: 1, scale: 1 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="stat-card glass-panel"
            >
              <div className="stat-icon">{stat.icon}</div>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="about-mission container">
          <div className="mission-content">
          <div className="mission-text">
            <h2 className="section-title">Our <span className="gradient-text">Story</span></h2>
            <p>EventSphere was built to solve a simple problem: people should be able to find the right event and book it without confusion. Organizers should also be able to publish events and manage attendees without extra complexity.</p>
            <p style={{marginTop: '1.5rem'}}>Today the platform supports event discovery, ticket booking, organizer workflows, payments, notifications, and support features in one connected system.</p>
          </div>
          <div className="mission-image-wrap glass-panel">
            <div className="mission-art-layer mission-art-primary"></div>
            <div className="mission-art-layer mission-art-secondary"></div>
            <div className="mission-story-card">
              <span className="mission-story-kicker">Why EventSphere</span>
              <h3>One platform for attendees and organizers, without the mess.</h3>
              <p>
                We focus on smooth discovery, reliable bookings, and tools that feel easy from the first click.
              </p>
            </div>
            <div className="mission-story-grid">
              {storyHighlights.map((item) => (
                <div key={item.label} className="mission-story-stat">
                  <div className="mission-story-icon">{item.icon}</div>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="mission-story-footer">
              <Sparkles size={16} />
              <span>Designed to make event booking and event publishing feel stress-free.</span>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES SECTION */}
      <section className="about-values container">
        <h2 className="section-title text-center">What We <span className="gradient-text">Stand For</span></h2>
        <div className="values-grid">
          {values.map((v, i) => (
            <motion.div 
               key={i} 
               whileHover={{ y: -10 }} 
               className="value-card glass-panel"
            >
              <div className="v-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="about-cta container">
        <div className="cta-box glass-panel">
          <h2>Ready to <span className="gradient-text">Get Started</span>?</h2>
          <p>Whether you want to attend an event or manage one, EventSphere is ready to help.</p>
          <div className="cta-btns">
            <NavLink to="/signup" className="btn btn-primary">Create Account <ArrowRight size={18}/></NavLink>
            <NavLink to="/contact" className="btn btn-secondary">Contact Us</NavLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

