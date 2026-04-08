import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';
import { useNotifications } from '../context/NotificationContext';
import './Booking.css';

const Booking = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { pushNotification } = useNotifications();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', quantity: 1 });

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${eventId}`);
        if (data.success) {
          setEvent(data.data);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/bookings', {
        eventId: eventId,
        quantity: formData.quantity,
        attendeeName: formData.name,
        attendeeEmail: formData.email
      });
      if (data.success) {
        pushNotification(
          'Booking created',
          `Your booking for ${event?.title || 'this event'} was created. Complete payment to confirm your ticket.`,
          'booking'
        );
        navigate(`/payment/${data.data._id}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <PageLoader title="Preparing booking details..." />;
  if (!event) return <div className="container" style={{paddingTop:'150px', textAlign:'center'}}>Event not found</div>;

  return (
    <div className="booking-page container">
      <div className="booking-stepper">
        <div className="step-item active">1. Info</div>
        <div className="step-item">2. Payment</div>
        <div className="step-item">3. Confirm</div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="booking-step glass-panel">
        <div className="booking-summary-mini">
          <img src={event.image} alt={event.title} />
          <div className="bs-text">
            <h3>{event.title}</h3>
            <p>{event.date} • {event.time}</p>
          </div>
        </div>

        <h2>Attendee <span className="gradient-text">Information</span></h2>
        <p>Please enter your details to continue with the booking.</p>
        
        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><User size={16} /> Full Name</label>
            <input type="text" placeholder="John Doe" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label><Mail size={16} /> Email Address</label>
            <input type="email" placeholder="john@example.com" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="booking-terms"><ShieldCheck size={16} /> <span>Secure booking information</span></div>
          <button type="submit" className="btn btn-primary step-btn">Proceed to Payment <ArrowRight size={18}/></button>
        </form>
      </motion.div>
    </div>
  );
};

export default Booking;

