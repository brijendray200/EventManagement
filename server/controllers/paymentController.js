const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// @desc    Create Razorpay Order
// @route   POST /api/bookings/:bookingId/pay
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.bookingId).populate('event');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        let order;
        if (process.env.RAZORPAY_KEY_ID?.startsWith('your_')) {
            order = { id: 'order_dev_' + Math.random().toString(36).substr(2, 9), amount: booking.totalPrice * 100, currency: "INR" };
        } else {
            const instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            const options = {
                amount: booking.totalPrice * 100, // amount in smallest currency unit (paise)
                currency: "INR",
                receipt: `receipt_order_${booking._id}`,
            };
            order = await instance.orders.create(options);
        }

        // Update booking with Order ID
        booking.razorpayOrderId = order.id;
        await booking.save();

        res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/bookings/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature || (process.env.RAZORPAY_KEY_ID?.startsWith('your_') && razorpay_signature === 'dummy_sig');

        if (isSignatureValid) {
            const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });

            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking reference not found' });
            }

            // Update booking status
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            booking.razorpayPaymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;

            await booking.save();

            // Deduct tickets from Event
            const event = await Event.findById(booking.event);
            if (event) {
                event.ticketsAvailable -= booking.quantity;
                await event.save();
            }

            // Real-time Notification logic
            const io = req.app.get('socketio');
            const message = `Payment confirmed for event: ${event.title}. Your booking ID is ${booking._id}`;
            
            // Save to DB
            await Notification.create({
                user: booking.user,
                message: message,
                type: 'booking'
            });

            // Emit to socket room (userId)
            io.to(booking.user.toString()).emit('notification', {
                message: message,
                bookingId: booking._id
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
