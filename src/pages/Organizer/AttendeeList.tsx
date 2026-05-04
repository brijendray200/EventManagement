import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Users, Search, ArrowLeft, Download, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import './AttendeeList.css';

const AttendeeList = () => {
  const { eventId } = useParams();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [title, setTitle] = useState('Your Event');

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        let resolvedEventId = eventId;

        if (!resolvedEventId) {
          const dashboardRes = await api.get('/events/organizer/dashboard');
          resolvedEventId = dashboardRes.data?.data?.events?.[0]?._id;
          setTitle(dashboardRes.data?.data?.events?.[0]?.title || 'Your Event');
        }

        if (!resolvedEventId) return;

        const { data } = await api.get(`/bookings/event/${resolvedEventId}`);
        if (data.success) {
          setBookings(data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchAttendees();
  }, [eventId]);

  const filteredBookings = useMemo(() => (
    bookings.filter((item) => {
      const matchesSearch = [item.attendeeName, item.attendeeEmail, item._id].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    })
  ), [bookings, search, filterStatus]);

  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert("No data to export");
      return;
    }
    
    const headers = ["Ticket ID", "Attendee Name", "Attendee Email", "Booking Date", "Status", "Tickets", "Amount"];
    
    const csvContent = [
      headers.join(","),
      ...filteredBookings.map(b => [
        `#${b._id.slice(-6).toUpperCase()}`,
        `"${(b.attendeeName || '').replace(/"/g, '""')}"`,
        `"${(b.attendeeEmail || '').replace(/"/g, '""')}"`,
        new Date(b.createdAt).toLocaleDateString(),
        b.status,
        b.numberOfTickets || 1,
        b.totalPrice || 0
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendees_${title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="attendee-list-page container">
      <div className="page-header">
        <NavLink to="/organizer/dashboard" className="back-link"><ArrowLeft size={16}/> Back to Dashboard</NavLink>
        <div className="ph-content">
          <h1 className="gradient-text">Attendee List</h1>
          <p>{title}</p>
        </div>
      </div>

      <div className="list-controls glass-panel">
        <div className="search-box">
          <Search size={20} />
          <input type="text" placeholder="Search by name, email or ticket ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="control-btns" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="btn btn-secondary btn-sm" 
            style={{ paddingRight: '1rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all" style={{ background: '#0f172a', color: 'white' }}>All Status</option>
            <option value="confirmed" style={{ background: '#0f172a', color: 'white' }}>Confirmed</option>
            <option value="pending" style={{ background: '#0f172a', color: 'white' }}>Pending</option>
            <option value="cancelled" style={{ background: '#0f172a', color: 'white' }}>Cancelled</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Download size={18}/> Export CSV
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="table-card glass-panel">
        <table className="attendee-table">
          <thead><tr><th>Attendee Details</th><th>Ticket ID</th><th>Booking Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredBookings.map(item => (
              <tr key={item._id}>
                <td>
                  <div className="att-info">
                    <strong>{item.attendeeName}</strong>
                    <span>{item.attendeeEmail}</span>
                  </div>
                </td>
                <td><span className="ticket-id-pill">#{item._id.slice(-6).toUpperCase()}</span></td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td><span className={`status-pill ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                <td><div className="table-actions-btns"><button className="icon-btn-sm"><Mail size={16}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default AttendeeList;
