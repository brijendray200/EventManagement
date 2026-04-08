import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  Users,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ChevronRight,
  Banknote,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    organizer: { name: '', email: '', organizerProfile: {} },
    stats: { revenue: 0, activeEvents: 0, attendees: 0, avgTicketPrice: 0 },
    events: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/events/organizer/dashboard');
        if (data.success) {
          setDashboard(data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    { label: 'Total Revenue', value: formatPrice(dashboard.stats.revenue), icon: <Banknote size={22}/>, color: '#ec4899', trend: `+${dashboard.stats.activeEvents}`, up: true },
    { label: 'Active Events', value: String(dashboard.stats.activeEvents), icon: <Calendar size={22}/>, color: '#6366f1', trend: `+${Math.min(9, dashboard.stats.activeEvents)}`, up: true },
    { label: 'Total Attendees', value: String(dashboard.stats.attendees), icon: <Users size={22}/>, color: '#3b82f6', trend: `+${Math.min(199, dashboard.stats.attendees)}`, up: true },
    { label: 'Avg Satisfaction', value: dashboard.stats.activeEvents > 0 ? '4.9' : '0.0', icon: <BarChart3 size={22}/>, color: '#f59e0b', trend: '+0.2', up: true },
  ];

  return (
    <div className="dashboard-page container">
      <header className="dash-hero">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dash-title-wrap">
          <h1 className="gradient-text">Organizer <br />Dashboard</h1>
          <p>
            {dashboard.organizer?.organizerProfile?.brandName
              ? `${dashboard.organizer.organizerProfile.brandName} is ready to manage events, attendees, and performance from one place.`
              : 'Manage your events, attendees, and performance from one place.'}
          </p>
          {dashboard.organizer?.organizerProfile?.brandName && (
            <div className="organizer-brand-ribbon glass-panel">
              <span>{dashboard.organizer.organizerProfile.organizationType || 'Organizer Workspace'}</span>
              {dashboard.organizer.organizerProfile.city && <strong>{dashboard.organizer.organizerProfile.city}</strong>}
              {dashboard.organizer.organizerProfile.eventFocus && <em>{dashboard.organizer.organizerProfile.eventFocus}</em>}
            </div>
          )}
        </motion.div>

        <div className="dash-hero-actions">
          <NavLink to="/organizer/create-event" className="btn btn-primary dash-cta-btn"><Plus size={18}/> Create Event</NavLink>
        </div>
      </header>

      <section className="stats-container">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="modern-stat-card glass-panel"
            whileHover={{ y: -5 }}
          >
            <div className="m-stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
            <div className="m-stat-body">
              <span className="m-stat-label">{stat.label}</span>
              <h3 className="m-stat-value">{stat.value}</h3>
              <div className="m-stat-footer">
                <span className={`m-stat-trend ${stat.up ? 'up' : 'down'}`}>
                  {stat.up ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {stat.trend}
                </span>
                <span className="m-stat-period">vs last month</span>
              </div>
            </div>
            <div className="m-stat-glow" style={{ background: stat.color }}></div>
          </motion.div>
        ))}
      </section>

      <div className="dash-layout-grid">
        <main className="dash-primary">
          <div className="section-card glass-panel">
            <div className="s-card-header">
              <div className="s-header-text">
                 <h2>Event <span className="gradient-text">Performance</span></h2>
                 <p>Track sales, attendee count, and event status.</p>
              </div>
              <div className="s-header-actions">
                <button className="btn btn-secondary btn-sm">Export</button>
              </div>
            </div>

            <div className="performance-list">
              {!loading && dashboard.events.length === 0 && (
                <div style={{ padding: '2rem 0', color: 'var(--text-dim)' }}>No events yet. Create your first event to see analytics here.</div>
              )}

              {dashboard.events.map((event, i) => (
                <div key={event._id} className="perf-item-wrap">
                  <div className="perf-item">
                    <div className="perf-info">
                      <div className="perf-status-dot" style={{ background: event.status === 'approved' ? '#10b981' : '#f59e0b' }}></div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong>{event.title}</strong>
                          {event.isSponsored && <span className="promoted-tag-mini"><Sparkles size={10}/> Promoted</span>}
                        </div>
                        <span>{event.date}</span>
                      </div>
                    </div>
                    <div className="perf-stats">
                      <div className="ps-block">
                        <label>Tickets</label>
                        <strong>{`${event.ticketsSold || 0}/${(event.ticketsSold || 0) + event.ticketsAvailable}`}</strong>
                      </div>
                      <div className="ps-block">
                        <label>Gross</label>
                        <strong>{formatPrice((event.ticketsSold || 0) * event.price)}</strong>
                      </div>
                    </div>
                    <div className="perf-progress-wrap">
                      <div className="progress-label">
                        <span>Sales Progress</span>
                        <span>{Math.round(Math.min(100, ((event.ticketsSold || 0) / Math.max(1, ((event.ticketsSold || 0) + event.ticketsAvailable))) * 100))}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, ((event.ticketsSold || 0) / ((event.ticketsSold || 0) + event.ticketsAvailable || 1)) * 100)}%`, background: `linear-gradient(90deg, var(--primary), var(--secondary))` }}></div></div>
                    </div>
                    <div className="perf-actions">
                      <NavLink to={`/organizer/attendees/${event._id}`} className="icon-btn-round"><ChevronRight size={20}/></NavLink>
                    </div>
                  </div>
                  {i < dashboard.events.length - 1 && <div className="perf-divider"></div>}
                </div>
              ))}
            </div>

            <NavLink to="/organizer/create-event" className="dash-footer-link">Create Another Event <ArrowRight size={16}/></NavLink>
          </div>
        </main>

        <aside className="dash-secondary">
          <div className="section-card glass-panel side-card">
            <h3>Quick <span className="gradient-text">Actions</span></h3>
            <nav className="side-dash-nav">
              <NavLink to="/organizer/attendees" className="s-nav-item">
                <div className="s-nav-icon"><Users size={18}/></div>
                <span>Attendee List</span>
              </NavLink>
              <NavLink to="/organizer/create-event" className="s-nav-item">
                <div className="s-nav-icon"><BarChart3 size={18}/></div>
                <span>Create Event</span>
              </NavLink>
              <NavLink to="/place-ad" className="s-nav-item">
                <div className="s-nav-icon"><Calendar size={18}/></div>
                <span>Place Ad</span>
              </NavLink>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
