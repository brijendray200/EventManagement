const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
