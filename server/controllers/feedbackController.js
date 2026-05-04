const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res, next) => {
    try {
        req.body.user = req.user.id;
        req.body.role = req.user.role;
        const feedback = await Feedback.create(req.body);
        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFeedback = async (req, res, next) => {
    try {
        const feedback = await Feedback.find().populate('user', 'name email').sort('-createdAt');
        res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
