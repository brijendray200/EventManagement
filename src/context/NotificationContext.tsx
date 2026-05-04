import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Bell, Trash2, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../utils/api';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    const normalizeNotification = (notif) => ({
        id: notif._id || notif.id,
        title: notif.title || 'Notification',
        message: notif.message,
        type: notif.type || 'info',
        targetRole: notif.targetRole || 'all',
        read: notif.isRead ?? notif.read ?? false,
        time: notif.createdAt || notif.time || new Date().toISOString(),
        actionUrl: notif.actionUrl || '',
        relatedEvent: notif.relatedEvent || null
    });

    // Get current user role from localStorage
    const getCurrentRole = () => {
        const role = localStorage.getItem('userRole') || 'user';
        return role === 'organizer' || role === 'admin' ? 'organizer' : 'attendee';
    };

    // Fetch initial notifications from DB (role-filtered by backend)
    useEffect(() => {
        if (!localStorage.getItem('token')) return;
        const fetchNotifs = async () => {
            try {
                const { data } = await api.get('/notifications');
                if (data.success) setNotifications((data.data || []).map(normalizeNotification));
            } catch (e) { console.error(e); }
        };
        fetchNotifs();
    }, []);

    // Socket Setup
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || 'null') || JSON.parse(localStorage.getItem('userProfile') || 'null');
        if (user && localStorage.getItem('token')) {
            const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            const newSocket = io(socketUrl);
            setSocket(newSocket);

            newSocket.emit('join', user.id || user._id);

            newSocket.on('notification', (data) => {
                const currentRole = getCurrentRole();
                // Only show if notification matches user's current role
                if (data.targetRole === 'all' || data.targetRole === currentRole) {
                    showNotification(data.message, data.type || 'info');
                    const normalized = normalizeNotification(data);
                    setNotifications(prev => [normalized, ...prev]);
                }
            });

            return () => newSocket.close();
        }
    }, []);

    const showNotification = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const addInAppNotification = useCallback((title, message, type = 'info', targetRole = 'all') => {
        const newNotif = {
            id: Date.now(),
            title,
            message,
            type,
            targetRole,
            read: false,
            time: new Date().toISOString()
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const pushNotification = useCallback(async (title, message, type = 'info', targetRole = 'all') => {
        showNotification(message, ['profile', 'event', 'system', 'booking', 'payment', 'attendee', 'revenue'].includes(type) ? 'info' : type);
        try {
            const { data } = await api.post('/notifications', { title, message, type, targetRole });
            if (data.success && data.data) {
                setNotifications(prev => [normalizeNotification(data.data), ...prev]);
                return;
            }
        } catch (_error) {
            // Fallback below keeps the UX working even if persistence fails.
        }

        addInAppNotification(title, message, type, targetRole);
    }, [addInAppNotification, showNotification]);

    // Filter notifications by role for display
    const getFilteredNotifications = useCallback((role) => {
        const targetRole = role === 'organizer' || role === 'admin' ? 'organizer' : 'attendee';
        return notifications.filter(n => n.targetRole === targetRole || n.targetRole === 'all');
    }, [notifications]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) { console.error(e); }
    };

    const clearAll = () => {
        api.delete('/notifications').catch(() => null);
        setNotifications([]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Role-specific unread counts
    const getUnreadCount = useCallback((role) => {
        const targetRole = role === 'organizer' || role === 'admin' ? 'organizer' : 'attendee';
        return notifications.filter(n => !n.read && (n.targetRole === targetRole || n.targetRole === 'all')).length;
    }, [notifications]);

    const icons = {
        success: <CheckCircle className="notif-icon success" size={20} />,
        error: <AlertCircle className="notif-icon error" size={20} />,
        info: <Info className="notif-icon info" size={20} />,
        bell: <Bell className="notif-icon bell" size={20} />,
    };

    return (
        <NotificationContext.Provider value={{ 
            showNotification, 
            pushNotification,
            notifications, 
            getFilteredNotifications,
            markAsRead, 
            markAllAsRead, 
            deleteNotification, 
            clearAll,
            unreadCount,
            getUnreadCount
        }}>
            {children}
            <div className="notification-container">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div key={toast.id} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8, x: 20 }} className={`notification-item glass-panel ${toast.type}`}>
                            <div className="notif-content">
                                {icons[toast.type] || icons.info}
                                <span className="notif-message">{toast.message}</span>
                            </div>
                            <button className="notif-close" onClick={() => removeToast(toast.id)}><X size={14} /></button>
                            <motion.div className="notif-progress" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 4, ease: 'linear' }} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <style>{`
                .notification-container { position: fixed; top: 6rem; right: 2rem; z-index: 100000; display: flex; flex-direction: column; gap: 1rem; pointer-events: none; }
                .notification-item { pointer-events: auto; min-width: 320px; max-width: 450px; padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; border-radius: 1.25rem; background: rgba(15, 23, 42, 0.9) !important; backdrop-filter: blur(20px) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; box-shadow: 0 20px 40px rgba(0,0,0,0.4); overflow: hidden; position: relative; }
                .notif-content { display: flex; align-items: center; gap: 1rem; flex: 1; }
                .notif-icon.success { color: #10b981; }
                .notif-icon.error { color: #ef4444; }
                .notif-icon.info { color: var(--primary); }
                .notif-icon.bell { color: var(--secondary); }
                .notif-message { color: white; font-size: 0.95rem; font-weight: 600; }
                .notif-close { background: none; border: none; color: var(--text-muted); cursor: pointer; opacity: 0.6; transition: var(--transition); }
                .notif-close:hover { opacity: 1; color: white; }
                .notif-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(to right, var(--primary), var(--secondary)); opacity: 0.4; }
                .notification-item.success .notif-progress { background: #10b981; }
                .notification-item.error .notif-progress { background: #ef4444; }
            `}</style>
        </NotificationContext.Provider>
    );
};
