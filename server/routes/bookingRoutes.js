const express = require('express');
const {
    createBooking,
    getMyBookings,
    getEventBookings,
    getBookingQR,
    cancelBooking,
    confirmCODBooking
} = require('../controllers/bookingController');
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id/qrcode', protect, getBookingQR);
router.delete('/:id', protect, cancelBooking);
router.post('/:id/cod', protect, confirmCODBooking);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventBookings);

// Payment Routes
router.post('/:bookingId/pay', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
