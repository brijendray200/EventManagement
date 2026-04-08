const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { eventId, quantity } = req.body;

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.ticketsAvailable < quantity) {
            return res.status(400).json({ success: false, message: 'Not enough tickets available' });
        }

        const totalPrice = event.price * quantity;

        const booking = await Booking.create({
            event: eventId,
            user: req.user.id,
            quantity,
            totalPrice
        });

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all bookings for a user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('event');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all bookings for an event (for organizer)
// @route   GET /api/bookings/event/:eventId
// @access  Private (Organizer/Admin)
exports.getEventBookings = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const bookings = await Booking.find({ event: req.params.eventId }).populate('user', 'name email');

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Generate QR Code for a booking
// @route   GET /api/bookings/:id/qrcode
// @access  Private
exports.getBookingQR = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Only user who booked or admin can see QR
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Only confirmed bookings have real QR
        if (booking.status !== 'confirmed') {
            return res.status(400).json({ success: false, message: 'Please complete payment first' });
        }

        // Generate QR code (Data URL)
        const qrData = JSON.stringify({
            bookingId: booking._id,
            user: booking.user,
            event: booking.event,
        });

        const qrCodeUrl = await QRCode.toDataURL(qrData);

        res.status(200).json({
            success: true,
            data: qrCodeUrl
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Only owner or admin can cancel
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Already cancelled' });
        }

        // Restore tickets to Event
        const event = await Event.findById(booking.event);
        if (event && booking.status === 'confirmed') {
            event.ticketsAvailable += booking.quantity;
            await event.save();
        }

        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({ success: true, data: booking });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

