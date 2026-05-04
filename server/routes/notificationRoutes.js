const express = require('express');
const {
    getNotifications,
    getOrganizerNotifications,
    getAttendeeNotifications,
    createNotification,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll
} = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

// Get all notifications (role-filtered automatically)
router.get('/', getNotifications);

// Get only organizer notifications
router.get('/organizer', getOrganizerNotifications);

// Get only attendee notifications
router.get('/attendee', getAttendeeNotifications);

// Create a new notification
router.post('/', createNotification);

// Mark all as read
router.put('/mark-all-read', markAllRead);

// Mark single as read
router.put('/:id/read', markRead);

// Delete single notification
router.delete('/:id', deleteNotification);

// Clear all notifications
router.delete('/', clearAll);

module.exports = router;
