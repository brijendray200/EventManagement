import React from 'react';
import { Bell, CheckCheck, Mail, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import './Notifications.css';

const formatDateTime = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (_error) {
    return '';
  }
};

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();

  return (
    <div className="notifications-page container">
      <section className="notifications-hero">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="gradient-text">All <br />Notifications</h1>
          <p>Track payment updates, booking activity, profile changes, and organizer alerts in one place.</p>
        </motion.div>

        <div className="notifications-summary glass-panel">
          <div className="summary-pill">
            <Bell size={18} />
            <span>{notifications.length} total</span>
          </div>
          <div className="summary-pill unread">
            <Mail size={18} />
            <span>{unreadCount} unread</span>
          </div>
        </div>
      </section>

      <section className="notifications-actions glass-panel">
        <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
          <CheckCheck size={16} /> Mark All Read
        </button>
        <button className="btn btn-secondary btn-sm" onClick={clearAll}>
          <Trash2 size={16} /> Clear All
        </button>
      </section>

      {notifications.length === 0 ? (
        <div className="notifications-empty glass-panel">
          <Mail size={42} />
          <h2>No notifications yet</h2>
          <p>New booking, payment, profile, and event updates will show up here.</p>
        </div>
      ) : (
        <div className="notifications-feed">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`notification-row glass-panel ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-row-icon">
                <Bell size={18} />
              </div>
              <div className="notification-row-content">
                <div className="notification-row-top">
                  <h3>{notification.title}</h3>
                  <span>{formatDateTime(notification.time)}</span>
                </div>
                <p>{notification.message}</p>
                <div className="notification-row-meta">
                  <label>{notification.type}</label>
                  {!notification.read && <em>Unread</em>}
                </div>
              </div>
              <div className="notification-row-actions">
                {!notification.read && (
                  <button type="button" onClick={() => markAsRead(notification.id)}>
                    Mark Read
                  </button>
                )}
                <button type="button" onClick={() => deleteNotification(notification.id)}>
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
