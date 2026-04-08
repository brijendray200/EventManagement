import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Lock, CheckCircle, ArrowRight, ShieldCheck, BadgeCheck, Receipt, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';
import RazorpayModal from '../components/RazorpayModal';
import PageLoader from '../components/PageLoader';
import './Payment.css';

const Payment = () => {
  const { formatPrice } = useCurrency();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRzpOpen, setIsRzpOpen] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await api.get(`/bookings/my-bookings`);
        const currentBooking = data.data.find(b => b._id === bookingId);
        if (currentBooking) {
          setBooking(currentBooking);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleRzpSuccess = () => {
    setIsRzpOpen(false);
    setIsSuccess(true);
  };

  if (loading) return <PageLoader title="Loading payment details..." />;
  if (!booking) return <div className="container" style={{paddingTop:'150px', textAlign:'center'}}>Booking not found</div>;

  if (isSuccess) {
    return (
      <div className="payment-page container">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="success-card glass-panel text-center">
          <CheckCircle size={80} color="#10b981" className="success-icon" />
          <h1 className="gradient-text">Booking Confirmed!</h1>
          <p className="success-msg">Your ticket has been booked successfully. You can find your ticket in the My Bookings section.</p>
          <div className="booking-info">
            <div className="bi-row"><span>Booking ID:</span> <strong>{bookingId}</strong></div>
            <div className="bi-row"><span>Status:</span> <strong style={{color:'#10b981'}}>Paid</strong></div>
          </div>
          <div className="success-actions">
            <NavLink to="/my-bookings" className="btn btn-primary">View Tickets <ArrowRight size={18}/></NavLink>
            <NavLink to="/" className="btn btn-secondary">Go to Home</NavLink>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="payment-page container">
      <div className="booking-stepper">
        <div className="step-item active">1. Info</div>
        <div className="step-item active">2. Payment</div>
        <div className="step-item">3. Confirm</div>
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="payment-card glass-panel">
        <div className="payment-shell">
          <div className="payment-main-column">
            <div className="payment-header-with-logo">
              <div>
                <span className="payment-kicker">Secure Checkout</span>
                <h2>Complete <span className="gradient-text">Payment</span></h2>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="rzp-title-logo" />
            </div>
            <p>Review your booking details below and complete the payment securely with Razorpay.</p>

            <div className="payment-feature-grid">
              <div className="payment-feature">
                <ShieldCheck size={18} />
                <span>256-bit secure payment</span>
              </div>
              <div className="payment-feature">
                <BadgeCheck size={18} />
                <span>Instant booking confirmation</span>
              </div>
            </div>

            <div className="payment-summary glass-panel">
              <div className="summary-heading">
                <Receipt size={18} />
                <span>Payment Summary</span>
              </div>
              <div className="summary-row"><span>Event</span> <strong>{booking.event.title}</strong></div>
              <div className="summary-row"><span>Ticket Price</span> <span>{formatPrice(booking.event.price)}</span></div>
              <div className="summary-row"><span>Quantity</span> <span>{booking.quantity}</span></div>
              <div className="summary-row"><span>Subtotal</span> <span>{formatPrice(booking.totalPrice)}</span></div>
              <div className="summary-row total"><span>Total Amount</span> <span>{formatPrice(booking.totalPrice)}</span></div>
            </div>

            <div className="rzp-pay-section">
              <button 
                className="btn btn-primary rzp-main-btn" 
                onClick={() => setIsRzpOpen(true)}
              >
                Pay with Razorpay <ArrowRight size={20} />
              </button>
              <div className="trust-badges">
                <div className="t-badge"><Lock size={14}/> SSL Encrypted</div>
                <div className="t-badge"><CheckCircle size={14}/> Verified Payment</div>
              </div>
            </div>
          </div>

          <div className="payment-side-column">
            <div className="booking-preview glass-panel">
              <div className="booking-preview-label"><Ticket size={16} /> Booking Details</div>
              <h3>{booking.event.title}</h3>
              <p>{booking.event.date} • {booking.event.time}</p>
              <p>{booking.event.location}</p>
              <div className="preview-total">
                <span>Total Payable</span>
                <strong>{formatPrice(booking.totalPrice)}</strong>
              </div>
            </div>

            <div className="payment-help glass-panel">
              <h4>Need help?</h4>
              <p>If the payment window does not open or payment fails, retry once and then check My Bookings for the latest status.</p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isRzpOpen && (
          <RazorpayModal 
            isOpen={isRzpOpen} 
            onClose={() => setIsRzpOpen(false)}
            amount={booking.totalPrice}
            targetId={booking._id}
            type="booking"
            onSuccess={handleRzpSuccess}
            eventTitle={booking.event.title}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;

