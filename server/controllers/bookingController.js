const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { createNotificationForUser } = require('./notificationController');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
    try {
        const { eventId, quantity, paymentMethod = 'online' } = req.body;

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
            totalPrice,
            paymentMethod,
            status: paymentMethod === 'cod' ? 'confirmed' : 'pending'
        });

        // If COD, deduct tickets immediately
        if (paymentMethod === 'cod') {
            event.ticketsAvailable -= quantity;
            await event.save();
        }

        // === AUTO NOTIFICATIONS ===
        const io = req.app.get('socketio');

        // Notify ATTENDEE
        await createNotificationForUser(req.user.id, {
            title: paymentMethod === 'cod' ? '🎫 Booking Confirmed (COD)' : '🎫 Booking Created',
            message: paymentMethod === 'cod' 
                ? `Your booking for "${event.title}" (${quantity} tickets) is confirmed! Please pay ₹${totalPrice} at the venue.`
                : `Your booking for "${event.title}" (${quantity} ticket${quantity > 1 ? 's' : ''}) has been created. Total: ₹${totalPrice}. Complete payment to confirm.`,
            type: 'booking',
            targetRole: 'attendee',
            actionUrl: paymentMethod === 'cod' ? `/bookings` : `/payment/${booking._id}`,
            relatedEvent: eventId
        }, io);

        // Notify ORGANIZER
        await createNotificationForUser(event.organizer, {
            title: paymentMethod === 'cod' ? '📢 New COD Booking!' : '📢 New Booking!',
            message: paymentMethod === 'cod'
                ? `${req.user.name} booked ${quantity} tickets for "${event.title}" via COD. Collect ₹${totalPrice} at the venue.`
                : `${req.user.name} booked ${quantity} ticket${quantity > 1 ? 's' : ''} for "${event.title}". Revenue: ₹${totalPrice}. Payment pending.`,
            type: 'attendee',
            targetRole: 'organizer',
            actionUrl: `/organizer/attendees/${eventId}`,
            relatedEvent: eventId
        }, io);

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
        const booking = await Booking.findById(req.params.id).populate('event');

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
        const event = await Event.findById(booking.event._id || booking.event);
        if (event && booking.status === 'confirmed') {
            event.ticketsAvailable += booking.quantity;
            await event.save();
        }

        booking.status = 'cancelled';
        await booking.save();

        // === AUTO NOTIFICATIONS ===
        const io = req.app.get('socketio');
        const eventTitle = event?.title || 'an event';

        // Notify ATTENDEE
        await createNotificationForUser(booking.user, {
            title: '❌ Booking Cancelled',
            message: `Your booking for "${eventTitle}" has been cancelled.`,
            type: 'booking',
            targetRole: 'attendee',
            relatedEvent: event?._id
        }, io);

        // Notify ORGANIZER
        if (event) {
            await createNotificationForUser(event.organizer, {
                title: '⚠️ Booking Cancelled',
                message: `A booking for "${eventTitle}" (${booking.quantity} tickets) was cancelled. Tickets have been restored.`,
                type: 'attendee',
                targetRole: 'organizer',
                relatedEvent: event._id
            }, io);
        }

        res.status(200).json({ success: true, data: booking });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Confirm booking with COD
// @route   POST /api/bookings/:id/cod
// @access  Private
exports.confirmCODBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('event');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Only owner or admin can confirm
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Booking is already confirmed or cancelled' });
        }

        const event = await Event.findById(booking.event._id || booking.event);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.ticketsAvailable < booking.quantity) {
            return res.status(400).json({ success: false, message: 'Not enough tickets available' });
        }

        // Update booking
        booking.paymentMethod = 'cod';
        booking.status = 'confirmed';
        await booking.save();

        // Deduct tickets
        event.ticketsAvailable -= booking.quantity;
        await event.save();

        // === AUTO NOTIFICATIONS ===
        const io = req.app.get('socketio');
        
        // Notify ATTENDEE
        await createNotificationForUser(booking.user, {
            title: '🎫 Booking Confirmed (COD)',
            message: `Your booking for "${event.title}" has been confirmed via COD. Please pay ₹${booking.totalPrice} at the venue.`,
            type: 'booking',
            targetRole: 'attendee',
            actionUrl: `/my-bookings`,
            relatedEvent: event._id
        }, io);

        // Notify ORGANIZER
        await createNotificationForUser(event.organizer, {
            title: '📢 New COD Booking!',
            message: `${req.user.name} switched to COD for "${event.title}". Collect ₹${booking.totalPrice} at the venue.`,
            type: 'attendee',
            targetRole: 'organizer',
            actionUrl: `/organizer/attendees/${event._id}`,
            relatedEvent: event._id
        }, io);

        res.status(200).json({ success: true, data: booking });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

