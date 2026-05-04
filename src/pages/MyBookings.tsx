import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Download, 
  Ticket, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Receipt,
  QrCode,
  AlertCircle,
  CreditCard,
  Lock,
  RefreshCcw,
  IndianRupee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import RazorpayModal from '../components/RazorpayModal';
import PageLoader from '../components/PageLoader';
import './MyBookings.css';

const QRDisplay = ({ bookingId }) => {
    const [qr, setQr] = useState(null);
    const [loadingQr, setLoadingQr] = useState(true);

    useEffect(() => {
        const fetchQR = async () => {
            if (!bookingId) {
                setLoadingQr(false);
                return;
            }

            try {
                const { data } = await api.get(`/bookings/${bookingId}/qrcode`);
                if (data.success) setQr(data.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingQr(false);
            }
        };
        fetchQR();
    }, [bookingId]);

    if (loadingQr) {
      return <div className="qr-loading">Generating QR...</div>;
    }

    return qr ? <img src={qr} alt="QR Code" className="qr-image" /> : <div className="qr-fallback"><QrCode size={48} /><span>QR unavailable</span></div>;
};

const parseEventDate = (dateValue) => {
  if (!dateValue) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getStartOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRzpOpen, setIsRzpOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true);
    try {
      const { data } = await api.get('/bookings/my-bookings');
      if (data.success) {
        setAllBookings(data.data);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setErrorMessage(error.response?.data?.message || 'Unable to load your bookings right now.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePayNow = (booking) => {
    setSelectedBooking(booking);
    setIsRzpOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchBookings();
    setIsRzpOpen(false);
    setSelectedBooking(null);
  };

  const handleDownloadTicket = async (booking) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert('Unable to generate ticket image right now.');
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#06101f');
    gradient.addColorStop(0.42, '#11213f');
    gradient.addColorStop(1, '#1f4fdb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardX = 90;
    const cardY = 80;
    const cardW = canvas.width - 180;
    const cardH = canvas.height - 160;
    const leftW = 1030;
    const rightX = cardX + leftW + 30;
    const accent = '#8fd0ff';
    const whiteSoft = 'rgba(255,255,255,0.78)';
    const panelFill = 'rgba(255,255,255,0.075)';

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(cardX, cardY, cardW, cardH);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cardX, cardY, cardW, cardH);

    ctx.fillStyle = panelFill;
    ctx.fillRect(cardX + 34, cardY + 34, leftW - 68, cardH - 68);

    ctx.fillStyle = accent;
    ctx.font = '700 24px Arial';
    ctx.fillText('EVENTSPHERE', cardX + 72, cardY + 78);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 18px Arial';
    ctx.fillText('Premium Event Pass', cardX + 250, cardY + 78);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 58px Arial';
    ctx.fillText(booking.event?.title || 'Event Booking', cardX + 72, cardY + 150, 760);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '24px Arial';
    ctx.fillText((booking.event?.category || 'Live Event').toUpperCase(), cardX + 75, cardY + 196);

    const dateBoxX = cardX + 72;
    const dateBoxY = cardY + 230;
    const miniBoxW = 210;
    const miniBoxH = 92;
    const miniBoxes = [
      { label: 'DATE', value: booking.event?.date || 'TBA' },
      { label: 'TIME', value: booking.event?.time || 'TBA', x: dateBoxX + miniBoxW + 18 },
      { label: 'QTY', value: String(booking.quantity || 1), x: dateBoxX + (miniBoxW + 18) * 2 },
    ];

    miniBoxes.forEach((box, index) => {
      const x = box.x || dateBoxX + index * (miniBoxW + 18);
      ctx.fillStyle = 'rgba(255,255,255,0.085)';
      ctx.fillRect(x, dateBoxY, miniBoxW, miniBoxH);
      ctx.fillStyle = accent;
      ctx.font = '700 18px Arial';
      ctx.fillText(box.label, x + 24, dateBoxY + 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 26px Arial';
      ctx.fillText(box.value, x + 24, dateBoxY + 66, miniBoxW - 40);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(cardX + 72, cardY + 350, 720, 1);

    const infoRows = [
      ['Attendee', booking.attendeeName || 'Guest'],
      ['Venue', booking.event?.location || 'Venue to be announced'],
      ['Status', String(booking.status || '').toUpperCase()],
    ];

    let rowY = cardY + 405;
    infoRows.forEach(([label, value]) => {
      ctx.fillStyle = whiteSoft;
      ctx.font = '600 24px Arial';
      ctx.fillText(label, cardX + 74, rowY);
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px Arial';
      ctx.fillText(value, cardX + 300, rowY, 520);
      rowY += 60;
    });

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(cardX + 72, cardY + 685, 760, 96);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 24px Arial';
    ctx.fillText('ACCESS NOTE', cardX + 100, cardY + 720);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '22px Arial';
    ctx.fillText('Carry this QR ticket with a valid photo ID. Entry is subject to venue security check.', cardX + 100, cardY + 758, 700);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(cardX + leftW, cardY + 40);
    ctx.lineTo(cardX + leftW, cardY + cardH - 40);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.arc(cardX + leftW, cardY + 130, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cardX + leftW, cardY + cardH - 130, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eef4ff';
    ctx.font = '700 36px Arial';
    ctx.fillText('ENTRY PASS', rightX + 78, cardY + 92);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '22px Arial';
    ctx.fillText('Verified digital admission', rightX + 48, cardY + 126);

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(rightX + 48, cardY + 162, 265, 265);

    try {
      const { data } = await api.get(`/bookings/${booking._id}/qrcode`);
      if (data?.success && data?.data) {
        const qrImage = new Image();
        qrImage.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          qrImage.onload = resolve;
          qrImage.onerror = reject;
          qrImage.src = data.data;
        });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(rightX + 77, cardY + 191, 205, 205);
        ctx.drawImage(qrImage, rightX + 92, cardY + 206, 175, 175);
      }
    } catch (_error) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 26px Arial';
      ctx.fillText('QR UNAVAILABLE', rightX + 62, cardY + 290);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px Arial';
    ctx.fillText('SCAN FOR ENTRY', rightX + 82, cardY + 470);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '22px Arial';
    ctx.fillText(`Admission: ${booking.quantity} Ticket`, rightX + 76, cardY + 515);
    ctx.fillText('Present this pass at the venue gate.', rightX + 55, cardY + 572);
    ctx.fillText('Support: eventsphere.com/help', rightX + 50, cardY + 614);

    const barcodeX = rightX + 64;
    const barcodeY = cardY + 655;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 34; i += 1) {
      const barW = i % 3 === 0 ? 5 : i % 2 === 0 ? 3 : 2;
      const barH = i % 4 === 0 ? 52 : 40;
      const x = barcodeX + i * 6;
      ctx.fillRect(x, barcodeY, barW, barH);
    }
    ctx.font = '600 15px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.fillText(String(booking._id || '').slice(-12).toUpperCase(), barcodeX, barcodeY + 72);

    if (booking.event?.image) {
      try {
        const poster = new Image();
        poster.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          poster.onload = resolve;
          poster.onerror = reject;
          poster.src = booking.event.image;
        });
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.drawImage(poster, cardX + 660, cardY + 78, 220, 150);
        ctx.restore();
      } catch (_error) {
        // Ignore poster rendering failures and keep ticket generation stable.
      }
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `eventsphere-ticket-${booking._id}.png`;
    link.click();
  };

  const today = getStartOfToday();
  const upcomingBookings = allBookings.filter((booking) => {
    if (!booking.event || booking.status === 'cancelled') return false;
    const eventDate = parseEventDate(booking.event.date);
    return eventDate ? eventDate >= today : false;
  });

  const pastBookings = allBookings.filter((booking) => {
    if (!booking.event) return false;
    if (booking.status === 'cancelled') return true;
    const eventDate = parseEventDate(booking.event.date);
    return eventDate ? eventDate < today : false;
  });

  const filteredBookings = (activeTab === 'upcoming' ? upcomingBookings : pastBookings).slice().sort((a, b) => {
    const firstDate = parseEventDate(a.event?.date)?.getTime() || 0;
    const secondDate = parseEventDate(b.event?.date)?.getTime() || 0;
    return activeTab === 'upcoming' ? firstDate - secondDate : secondDate - firstDate;
  });

  const totalSpent = allBookings
    .filter((booking) => booking.paymentStatus === 'paid')
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

  const pendingPayments = allBookings.filter((booking) => booking.status === 'pending').length;
  const confirmedBookings = allBookings.filter((booking) => booking.status === 'confirmed').length;

  if (loading) return <PageLoader title="Loading your bookings..." />;

  return (
    <div className="my-bookings-page container">
      <section className="bookings-hero">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <h1 className="gradient-text">My <br />Bookings</h1>
          <p>Access your tickets, manage upcoming experiences, and view your history.</p>
        </motion.div>

        <div className="bookings-side-panel">
          <div className="tab-control glass-panel">
            <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
              Upcoming Events <span className="tab-count">{upcomingBookings.length}</span>
            </button>
            <button className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
              Past Experiences <span className="tab-count">{pastBookings.length}</span>
            </button>
          </div>
          <button className="refresh-bookings-btn" onClick={() => fetchBookings(true)} disabled={refreshing}>
            <RefreshCcw size={16} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      <section className="booking-summary-strip">
        <div className="booking-summary-card glass-panel">
          <Ticket size={18} />
          <div><strong>{allBookings.length}</strong><span>Total bookings</span></div>
        </div>
        <div className="booking-summary-card glass-panel">
          <CheckCircle size={18} />
          <div><strong>{confirmedBookings}</strong><span>Confirmed</span></div>
        </div>
        <div className="booking-summary-card glass-panel">
          <CreditCard size={18} />
          <div><strong>{pendingPayments}</strong><span>Pending payments</span></div>
        </div>
        <div className="booking-summary-card glass-panel">
          <IndianRupee size={18} />
          <div><strong>₹{totalSpent.toLocaleString('en-IN')}</strong><span>Total spent</span></div>
        </div>
      </section>

      <div className="bookings-container">
        {errorMessage && (
          <div className="bookings-error glass-panel">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {filteredBookings.length > 0 ? (
            <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bookings-list">
              {filteredBookings.map((booking, i) => (
                <motion.div key={booking._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="booking-ticket glass-panel">
                  <div className="ticket-visual">
                    <img src={booking.event.image} alt={booking.event.title} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800'; }} />
                    <div className={`status-chip status-${booking.status}`}>
                      {booking.status === 'confirmed' ? <CheckCircle size={14} /> : <Clock size={14} />} {booking.status}
                    </div>
                  </div>
                  
                  <div className="ticket-info">
                    <div className="info-top">
                       <span className="booking-id-tag"><Receipt size={14}/> {booking._id}</span>
                       <span className="event-cat-tag">{booking.event.category}</span>
                    </div>
                    <h2>{booking.event.title}</h2>
                    <div className="ticket-meta-grid">
                      <div className="meta-point"><Calendar size={18} className="meta-icon" /><div><label>Date & Time</label><strong>{booking.event.date} • {booking.event.time}</strong></div></div>
                      <div className="meta-point"><MapPin size={18} className="meta-icon" /><div><label>Location</label><strong>{booking.event.location}</strong></div></div>
                    </div>
                    <div className="booking-extra-meta">
                      <span>Qty: <strong>{booking.quantity}</strong></span>
                      <span>Amount: <strong>₹{Number(booking.totalPrice || 0).toLocaleString('en-IN')}</strong></span>
                      <span>Payment: <strong>{booking.paymentStatus}</strong></span>
                    </div>
                    <div className="ticket-controls">
                      {booking.status === 'pending' ? (
                        <button className="btn btn-primary action-btn rzp-btn-ticket" onClick={() => handlePayNow(booking)}><CreditCard size={18}/> Pay Now</button>
                      ) : booking.status === 'confirmed' ? (
                        <button className="btn btn-secondary action-btn" onClick={() => handleDownloadTicket(booking)}><Download size={18}/> Get E-Ticket</button>
                      ) : (
                        <button className="btn btn-secondary action-btn" disabled><Lock size={18}/> Cancelled</button>
                      )}
                      <NavLink to={`/events/${booking.event?._id || booking.event?.id}`} className="btn btn-secondary action-btn">Details <ArrowRight size={18}/></NavLink>
                    </div>
                  </div>

                  <div className="ticket-stub">
                    <div className="stub-divider"></div>
                    <div className="qr-box">
                      {booking.status === 'confirmed' ? <QRDisplay bookingId={booking._id} /> : (
                        <div className="locked-qr"><Lock size={32} className="lock-icon" /><QrCode size={64} strokeWidth={1.5} className="blurred-qr" /><p>{booking.status === 'cancelled' ? 'Booking Cancelled' : 'Payment Required'}</p></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-bookings-state glass-panel">
              <div className="empty-icon-wrap"><AlertCircle size={48} /></div>
              <h2>No {activeTab} bookings</h2>
              <p>Explore what's trending and secure your spot!</p>
              <NavLink to="/events" className="btn btn-primary">Find Your Next Event</NavLink>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isRzpOpen && selectedBooking && (
          <RazorpayModal 
            isOpen={isRzpOpen} 
            onClose={() => { setIsRzpOpen(false); setSelectedBooking(null); }}
            amount={selectedBooking.totalPrice}
            targetId={selectedBooking._id}
            onSuccess={handlePaymentSuccess}
            eventTitle={selectedBooking.event.title}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;

