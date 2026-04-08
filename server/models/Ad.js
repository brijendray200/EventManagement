const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title for the ad']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    linkUrl: {
        type: String,
        required: [true, 'Please add a target link']
    },
    type: {
        type: String,
        enum: ['banner', 'event_boost', 'sidebar'],
        default: 'banner'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'expired', 'rejected'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    paymentId: {
        type: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ad', AdSchema);
