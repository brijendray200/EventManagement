import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  ArrowRight,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import './Dashboard.css';
import api from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, events: 0, bookings: 0, ads: 0, totalRevenue: 0, pendingEvents: [], recentBookings: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Users', value: String(stats.users), icon: <Users size={24}/>, color: '#6366f1', trend: '+15%' },
    { label: 'Total Organizers', value: String(Math.max(0, stats.users - 1)), icon: <Users size={24}/>, color: '#ec4899', trend: '+2' },
    { label: 'Total Events', value: String(stats.events), icon: <Calendar size={24}/>, color: '#3b82f6', trend: `+${Math.min(12, stats.events)}` },
    { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: <DollarSign size={24}/>, color: '#f59e0b', trend: '+18%' },
  ];

  return (
    <div className="dashboard-page admin-dashboard container">
      <div className="dash-header">
        <div className="dh-content">
          <h1 className="gradient-text">Admin Dashboard</h1>
          <p>Monitor users, events, bookings, and approvals.</p>
        </div>
        <div className="dh-actions" style={{ display: 'flex', gap: '1rem' }}>
           <NavLink to="/admin/feedback" className="btn btn-secondary dash-btn">
             <MessageSquare size={18} /> View User Feedback
           </NavLink>
           <button className="btn btn-secondary dash-btn">Platform Settings</button>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((stat, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02, y: -5 }} className="stat-card glass-panel">
            <div className="stat-icon" style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <h3 className="stat-value">{stat.value}</h3>
              <span className="stat-trend" style={{ color: '#10b981' }}>{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dash-sections">
        <div className="dash-main-pane">
          <div className="glass-panel dash-list-card">
            <div className="card-header">
              <h2>Pending <span className="gradient-text">Events</span></h2>
              <NavLink to="/events" className="view-link">View All Events <ArrowRight size={14}/></NavLink>
            </div>
            <div className="dash-table-container">
              <table className="dash-table">
                <thead><tr><th>Event Details</th><th>Organizer</th><th>Category</th><th>Actions</th></tr></thead>
                <tbody>
                  {stats.pendingEvents.length === 0 ? (
                    <tr><td colSpan="4">No pending approvals right now.</td></tr>
                  ) : stats.pendingEvents.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="table-item-info">
                          <strong>{item.title}</strong>
                          <span>{item.date}</span>
                        </div>
                      </td>
                      <td>{item.organizerName}</td>
                      <td><span className="tag-pill">{item.category}</span></td>
                      <td><span className="status-pill live success-pill">{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel dash-list-card" style={{marginTop:'3rem'}}>
            <div className="card-header">
              <h2>Recent <span className="gradient-text">Bookings</span></h2>
              <NavLink to="/events" className="view-link">Reports <ArrowRight size={14}/></NavLink>
            </div>
            <div className="dash-table-container">
              <table className="dash-table">
                <thead><tr><th>Involved User</th><th>Amount</th><th>Timestamp</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recentBookings.length === 0 ? (
                    <tr><td colSpan="4">No recent bookings yet.</td></tr>
                  ) : stats.recentBookings.map((item) => (
                    <tr key={item._id}>
                      <td>{item.user?.name || 'Unknown'}</td>
                      <td className="bold-white">₹{item.totalPrice}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td><span className="status-pill live success-pill">{item.paymentStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
