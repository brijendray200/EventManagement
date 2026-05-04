const Notification = require('../models/Notification');

// @desc    Get user notifications (role-filtered)
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const userRole = req.user.role === 'organizer' || req.user.role === 'admin' ? 'organizer' : 'attendee';

        // Get notifications for this user that match their role OR are 'all'
        const notifications = await Notification.find({
            user: req.user.id,
            $or: [
                { targetRole: userRole },
                { targetRole: 'all' }
            ]
        }).sort('-createdAt').limit(50);

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get only organizer notifications
// @route   GET /api/notifications/organizer
// @access  Private (Organizer/Admin)
exports.getOrganizerNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id,
            $or: [
                { targetRole: 'organizer' },
                { targetRole: 'all' }
            ]
        }).sort('-createdAt').limit(50);

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get only attendee notifications
// @route   GET /api/notifications/attendee
// @access  Private
exports.getAttendeeNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            user: req.user.id,
            $or: [
                { targetRole: 'attendee' },
                { targetRole: 'all' }
            ]
        }).sort('-createdAt').limit(50);

        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = async (req, res, next) => {
    try {
        const { title, message, type, targetRole, actionUrl, relatedEvent } = req.body;

        const notification = await Notification.create({
            user: req.user.id,
            title: title || 'Notification',
            message,
            type: type || 'system',
            targetRole: targetRole || 'all',
            actionUrl: actionUrl || '',
            relatedEvent: relatedEvent || undefined
        });

        // Emit via socket if available
        const io = req.app.get('socketio');
        if (io) {
            io.to(req.user.id).emit('notification', {
                ...notification.toObject(),
                title: notification.title,
                message: notification.message,
                type: notification.type,
                targetRole: notification.targetRole
            });
        }

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a single notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Clear all notifications for the user
// @route   DELETE /api/notifications
// @access  Private
exports.clearAll = async (req, res, next) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ============ HELPER: Create notification for any user (used internally) ============
exports.createNotificationForUser = async (userId, { title, message, type, targetRole, actionUrl, relatedEvent }, io) => {
    try {
        const notification = await Notification.create({
            user: userId,
            title: title || 'Notification',
            message,
            type: type || 'system',
            targetRole: targetRole || 'all',
            actionUrl: actionUrl || '',
            relatedEvent: relatedEvent || undefined
        });

        if (io) {
            io.to(userId.toString()).emit('notification', {
                ...notification.toObject(),
                title: notification.title,
                message: notification.message,
                type: notification.type,
                targetRole: notification.targetRole
            });
        }

        return notification;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
};
