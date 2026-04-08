const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity'],
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending' // Default to pending until payment is verified
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    bookingDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
