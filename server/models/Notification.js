const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'Notification'
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['booking', 'event', 'system', 'payment', 'attendee', 'revenue', 'profile'],
        default: 'system'
    },
    // Role-based targeting: which role sees this notification
    targetRole: {
        type: String,
        enum: ['organizer', 'attendee', 'all'],
        default: 'all'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    // Optional: link to navigate when clicked
    actionUrl: {
        type: String,
        default: ''
    },
    // Optional: link to related event
    relatedEvent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
