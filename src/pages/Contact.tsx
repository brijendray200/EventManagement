import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  MessageCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import api from '../utils/api';
import './Contact.css';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/support/contact', form);
      setSubmitted(true);
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: <Mail />, title: 'Email Us', info: 'support@eventsphere.com', desc: 'Reach out for help, questions, or general support.' },
    { icon: <Phone />, title: 'Call Us', info: '+91 (234) 567-8901', desc: 'Mon - Fri, 9am - 6pm (IST)' },
    { icon: <MapPin />, title: 'Visit Us', info: 'Lucknow, India', desc: 'Support and operations office' }
  ];
  const supportMapUrl = 'https://www.google.com/maps?q=Lucknow,+Uttar+Pradesh,+India&z=13&output=embed';
  const supportMapsLink = 'https://www.google.com/maps/search/?api=1&query=Lucknow,+Uttar+Pradesh,+India';

  return (
    <div className="contact-page">
      {/* HERO HERO */}
      <section className="contact-hero">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="gradient-text"
          >
            Contact <br />Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            If you have questions about bookings, organizer tools, payments, or support, our team is here to help.
          </motion.p>
        </div>
      </section>

      <div className="container">
        <div className="contact-grid">
          {/* CONTACT INFO SIDEBAR */}
          <aside className="contact-sidebar">
            <div className="info-cards-stack">
              {contactInfo.map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -30 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="contact-info-card glass-panel"
                >
                  <div className="card-icon">{item.icon}</div>
                  <div className="card-body">
                    <h3>{item.title}</h3>
                    <strong>{item.info}</strong>
                    <p>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="social-connect glass-panel">
              <h3>Connect Socially</h3>
              <div className="social-row">
                <a href="#" className="s-link"><Facebook size={20} /></a>
                <a href="#" className="s-link"><Twitter size={20} /></a>
                <a href="#" className="s-link"><Instagram size={20} /></a>
                <a href="#" className="s-link"><Linkedin size={20} /></a>
              </div>
            </div>
          </aside>

          {/* MAIN FORM AREA */}
          <main className="form-container glass-panel">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-header">
                  <MessageCircle size={32} className="gradient-text" />
                  <h2>Send us a <span className="gradient-text">Message</span></h2>
                  <p>We usually respond within a few business hours.</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="John Doe" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="john@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="booking">Booking Issue</option>
                    <option value="organizer">Become an Organizer</option>
                    <option value="billing">Billing & Payments</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Your Message</label>
                  <textarea rows="6" placeholder="How can we help you?" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}></textarea>
                </div>

                <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'} <Send size={18} />
                </button>
                <div className="form-footer">
                  <Clock size={14} /> <span>Average response time: 2-4 business hours</span>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="submission-success"
              >
                <div className="success-icon-wrap"><CheckCircle size={64} /></div>
                <h2>Message <span className="gradient-text">Received!</span></h2>
                <p>Thank you for reaching out. A member of our support team will get back to you on the provided email address.</p>
                <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>Send Another Message</button>
              </motion.div>
            )}
          </main>
        </div>

        {/* MAP SECTION */}
        <section className="contact-map glass-panel">
           <MapPin size={48} className="map-icon" />
           <h3>Our <span className="gradient-text">Location</span></h3>
           <p>We operate from Lucknow and support users across multiple cities.</p>
           <div className="map-placeholder live-map-frame">
              <iframe
                title="EventSphere Lucknow support office"
                src={supportMapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a href={supportMapsLink} target="_blank" rel="noreferrer" className="map-overlay">
                Open in Google Maps
              </a>
           </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;

