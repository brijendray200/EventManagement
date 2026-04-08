const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res, next) => {
    try {
        const userCount = await User.countDocuments();
        const eventCount = await Event.countDocuments();
        const bookingCount = await Booking.countDocuments();
        
        // Aggregate total revenue
        const revenue = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                events: eventCount,
                bookings: bookingCount,
                totalRevenue: revenue.length > 0 ? revenue[0].total : 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
