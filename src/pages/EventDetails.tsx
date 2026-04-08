import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  User, 
  ArrowRight, 
  Check, 
  Share2, 
  Heart, 
  ShieldCheck, 
  Clock, 
  Image as ImageIcon,
  Zap,
  Info,
  ChevronRight,
  Navigation,
  HelpCircle,
  PlayCircle,
  IndianRupee,
  Ticket
} from 'lucide-react';
import EventCard from '../components/EventCard';
import { useCurrency } from '../context/CurrencyContext';
import { motion } from 'framer-motion';
import api from '../utils/api';
import PageLoader from '../components/PageLoader';
import './EventDetails.css';

const EventDetails = () => {
  const { formatPrice } = useCurrency();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(true);

  const galleryImages = [...new Set([event?.image, ...(event?.galleryImages || [])].filter(Boolean))].slice(0, 20);
  const mediaItems = [
    ...galleryImages.map((url, index) => ({ id: `image-${index}`, type: 'image', url })),
    ...(((event?.videoUrls) || []).filter(Boolean).map((url, index) => ({ id: `video-${index}`, type: 'video', url })))
  ];

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        if (data.success) {
          setEvent(data.data);
          const related = await api.get(`/events?category=${encodeURIComponent(data.data.category)}`);
          if (related.data?.success) {
            setSimilarEvents((related.data.data || []).filter((item) => item._id !== data.data._id).slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    setSelectedMedia(mediaItems[0] || null);
  }, [event?._id, event?.id, mediaItems.length]);

  if (loading) return <PageLoader title="Loading event experience..." />;

  if (!event) return (
    <div className="container" style={{paddingTop:'150px', textAlign:'center', minHeight:'60vh'}}>
      <h1 className="gradient-text" style={{fontSize:'4rem'}}>404</h1>
      <h2>Event Not Found</h2>
      <NavLink to="/events" className="btn btn-primary" style={{marginTop:'2rem'}}>Back to Events</NavLink>
    </div>
  );

  const perks = [
    "Instant booking confirmation",
    "Digital ticket delivery",
    "Venue support information",
    "Easy attendee check-in"
  ];

  const agenda = [
    { time: "05:30 PM", title: "Entry & Registration", desc: "Arrive at the venue and complete your entry formalities." },
    { time: "06:30 PM", title: "Event Starts", desc: "Opening session begins for all attendees." },
    { time: "07:45 PM", title: "Main Session", desc: "The main program for the event takes place here." },
    { time: "09:00 PM", title: "Closing Session", desc: "Event wraps up with final announcements and closing notes." }
  ];

  const faqs = [
    { q: "Is re-entry allowed?", a: "Re-entry depends on the venue policy for this event. Please confirm with the organizer before attending." },
    { q: "Are outside food and drinks allowed?", a: "Most venues do not allow outside food and drinks. Venue rules apply at entry." },
    { q: "Is the venue wheelchair accessible?", a: "Please contact the organizer for accessibility information related to this venue." }
  ];

  const highlightPoints = event.highlightPoints?.length ? event.highlightPoints : perks;
  const locationQuery = encodeURIComponent(event.location || 'Event venue');
  const mapsEmbedUrl = `https://www.google.com/maps?q=${locationQuery}&z=15&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;

  return (
    <div className="event-details-page">
      <div className="container" style={{paddingTop: '60px'}}>
        
        {/* BREADCRUMBS */}
        <div className="breadcrumbs">
          <NavLink to="/">Home</NavLink>
          <ChevronRight size={14} />
          <NavLink to="/events">Events</NavLink>
          <ChevronRight size={14} />
          <span className="current">{event.title}</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="hero-banner glass-panel"
        >
          {selectedMedia?.type === 'video' ? (
            <video src={selectedMedia.url} className="banner-img" controls playsInline />
          ) : (
            <img 
              src={selectedMedia?.url || event.image} 
              alt={event.title} 
              className="banner-img" 
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200'; }}
            />
          )}
          <div className="banner-overlay"></div>
          <div className="hero-info">
            <span className="event-label">{event.category}</span>
            <h1 className="event-title">{event.title}</h1>
            <p className="hero-subtext">View all event photos, videos, schedule, venue details, and booking information in one place.</p>
          </div>
        </motion.div>

        {mediaItems.length > 1 && (
          <section className="media-strip-section">
            <div className="media-strip-header">
              <h2 className="section-heading">All Event <span className="gradient-text">Media</span></h2>
              <p>{mediaItems.length} media items available for this event.</p>
            </div>
            <div className="media-strip">
              {mediaItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`media-thumb glass-panel ${selectedMedia?.id === item.id ? 'active' : ''}`}
                  onClick={() => setSelectedMedia(item)}
                >
                  {item.type === 'video' ? (
                    <div className="media-thumb-video">
                      <video src={item.url} muted playsInline />
                      <span><PlayCircle size={16} /> Video {index + 1}</span>
                    </div>
                  ) : (
                    <>
                      <img src={item.url} alt={`${event.title} media ${index + 1}`} />
                      <span>Photo {index + 1}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="event-main-grid">
          <main className="event-info-panel">
            <div className="event-quick-meta glass-panel">
               <div className="q-item"><Calendar size={22} /><div className="q-text"><strong>{event.date}</strong><span>{event.time} Onwards</span></div></div>
               <div className="q-item"><MapPin size={22} /><div className="q-text"><strong>Location</strong><span>{event.location}</span></div></div>
               <div className="q-item"><User size={22} /><div className="q-text"><strong>Organizer</strong><span>{event.organizerName || event.organizer?.name || 'EventSphere Host'}</span></div></div>
            </div>

            <section className="info-section">
              <h2 className="section-heading">Everything At A <span className="gradient-text">Glance</span></h2>
              <div className="overview-grid">
                <div className="overview-card glass-panel"><Calendar size={18} /><div><strong>Date</strong><span>{event.date}</span></div></div>
                <div className="overview-card glass-panel"><Clock size={18} /><div><strong>Time</strong><span>{event.time}</span></div></div>
                <div className="overview-card glass-panel"><MapPin size={18} /><div><strong>Venue</strong><span>{event.location}</span></div></div>
                <div className="overview-card glass-panel"><User size={18} /><div><strong>Hosted By</strong><span>{event.organizerName || event.organizer?.name || 'EventSphere Host'}</span></div></div>
                <div className="overview-card glass-panel"><IndianRupee size={18} /><div><strong>Price</strong><span>{formatPrice(event.price)}</span></div></div>
                <div className="overview-card glass-panel"><Ticket size={18} /><div><strong>Media Pack</strong><span>{galleryImages.length} photos{event.videoUrls?.length ? `, ${event.videoUrls.length} videos` : ''}</span></div></div>
              </div>
            </section>

            <section className="info-section">
              <h2 className="section-heading">Event <span className="gradient-text">Description</span></h2>
              <p className="desc-text">{event.description}</p>
              <p className="desc-text" style={{marginTop:'1.5rem'}}>Check the schedule, venue details, booking information, and related events before you reserve your seat for {event.title}.</p>
            </section>

            {/* AGENDA SECTION */}
            <section className="info-section">
              <h2 className="section-heading">Event <span className="gradient-text">Agenda</span></h2>
              <div className="agenda-timeline">
                {agenda.map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="agenda-item"
                  >
                    <div className="agenda-dot"></div>
                    <div className="agenda-time">{item.time}</div>
                    <div className="agenda-content">
                      <h3>{item.title}</h3>
                      <p>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="info-section">
              <h2 className="section-heading">Why This <span className="gradient-text">Event Stands Out</span></h2>
              <div className="perks-grid">
                {highlightPoints.map((point, i) => (
                  <div key={i} className="perk-item"><Check size={18} /> <span>{point}</span></div>
                ))}
              </div>
            </section>

            <section className="info-section">
              <h2 className="section-heading">Booking <span className="gradient-text">Benefits</span></h2>
              <div className="perks-grid">
                {perks.map((perk, i) => (
                  <div key={i} className="perk-item"><Check size={18} /> <span>{perk}</span></div>
                ))}
              </div>
            </section>

            <section className="info-section">
              <h2 className="section-heading">Event <span className="gradient-text">Gallery</span></h2>
              <div className="image-grid">
                {mediaItems.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    className="img-box glass-panel"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.type === 'video' ? (
                      <div className="gallery-video-card">
                        <video src={item.url} muted playsInline />
                        <div className="img-box-overlay"><PlayCircle size={14} /> Play Video</div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={item.url}
                          alt={`Gallery ${idx}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }}
                          onError={(e) => { e.target.src = event.image; }}
                        />
                        <div className="img-box-overlay">View Photo {idx + 1}</div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            {/* VENUE SECTION */}
            <section className="info-section">
              <h2 className="section-heading">Venue & <span className="gradient-text">Directions</span></h2>
              <div className="venue-card glass-panel">
                <div className="venue-map">
                  <div className="map-placeholder live-event-map">
                    <iframe
                      title={`${event.title} venue map`}
                      src={mapsEmbedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <a href={mapsLink} target="_blank" rel="noreferrer" className="btn btn-secondary map-btn"><Navigation size={14}/> Get Directions</a>
                </div>
                <div className="venue-details">
                   <h3><MapPin size={20}/> {event.location}</h3>
                   <p>Please check the exact venue details in your ticket and event confirmation.</p>
                   <div className="venue-meta">
                      <div className="v-meta"><Clock size={14}/> Entry opens before the event start time</div>
                      <div className="v-meta"><Info size={14}/> Venue rules will apply at the gate</div>
                   </div>
                </div>
              </div>
            </section>

            {/* FAQ SECTION */}
            <section className="info-section">
              <h2 className="section-heading">Frequently Asked <span className="gradient-text">Questions</span></h2>
              <div className="faq-list">
                {faqs.map((faq, i) => (
                   <div key={i} className="faq-item glass-panel">
                      <div className="faq-title"><HelpCircle size={18} /> {faq.q}</div>
                      <div className="faq-answer">{faq.a}</div>
                   </div>
                ))}
              </div>
            </section>
          </main>

          <aside className="booking-sidebar">
            <div className="booking-card glass-panel sticky-card">
              <div className="price-tag">
                <span className="label">Ticket Price</span>
                <span className="price">{formatPrice(event.price)}</span>
              </div>
              <div className="booking-features">
                 <div className="feature"><Clock size={16} /> <span>Seats may be limited for this event</span></div>
                 <div className="feature pulse"><Zap size={16} /> <span>Popular event in this category</span></div>
              </div>
              <NavLink to={`/booking/${event._id || event.id}`} className="btn btn-primary booking-btn">
                Book Now <ArrowRight size={20} />
              </NavLink>
              <div className="action-row">
                <button className="icon-btn"><Heart size={20}/> Save</button>
                <button className="icon-btn"><Share2 size={20}/> Share</button>
              </div>
              <div className="secure-badge"><ShieldCheck size={14} /> Secure booking and payment support</div>
            </div>
          </aside>
        </div>

        {/* SIMILAR EVENTS */}
        {similarEvents.length > 0 && (
          <section className="similar-section">
             <h2 className="similar-title">Similar <span className="gradient-text">Events</span></h2>
             <div className="listing-grid">
                {similarEvents.map(e => <EventCard key={e._id || e.id} event={e} />)}
             </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EventDetails;

