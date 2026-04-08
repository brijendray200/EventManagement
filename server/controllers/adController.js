const Ad = require('../models/Ad');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create an Ad Request
// @route   POST /api/ads
// @access  Private
exports.createAd = async (req, res, next) => {
    try {
        const { title, description, imageUrl, linkUrl, type, days } = req.body;
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + Number(days));

        const rateMap = { banner: 1000, event_boost: 500, sidebar: 300 };
        const dailyRate = rateMap[type] || 500;
        const totalAmount = dailyRate * Number(days);

        const ad = await Ad.create({
            user: req.user.id,
            title,
            description,
            imageUrl,
            linkUrl,
            type,
            startDate,
            endDate,
            totalAmount
        });

        res.status(201).json({ success: true, data: ad });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Active Ads (Public)
exports.getActiveAds = async (req, res, next) => {
    try {
        const ads = await Ad.find({
            status: 'active',
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        }).sort('-createdAt');
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get My Ads
exports.getMyAds = async (req, res, next) => {
    try {
        const ads = await Ad.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Ad
exports.updateAd = async (req, res, next) => {
    try {
        let ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
        if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete Ad
exports.deleteAd = async (req, res, next) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
        if (ad.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        await ad.remove();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get All Ads (Admin Only)
exports.getAllAds = async (req, res, next) => {
    try {
        const ads = await Ad.find().populate('user', 'name email').sort('-createdAt');
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Ad Payment
exports.payForAd = async (req, res, next) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });

        let order;
        if (process.env.RAZORPAY_KEY_ID?.startsWith('your_')) {
            order = { id: 'order_ad_dev_' + Math.random().toString(36).substr(2, 9), amount: ad.totalAmount * 100, currency: "INR" };
        } else {
            const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
            order = await instance.orders.create({ amount: ad.totalAmount * 100, currency: "INR", receipt: `receipt_ad_${ad._id}` });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyAdPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, adId } = req.body;
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");
        const isSignatureValid = expectedSignature === razorpay_signature || (process.env.RAZORPAY_KEY_ID?.startsWith('your_') && razorpay_signature === 'dummy_sig');

        if (isSignatureValid) {
            const ad = await Ad.findById(adId);
            if (!ad) return res.status(404).json({ success: false, message: 'Ad not found' });
            ad.status = 'active';
            ad.paymentId = razorpay_payment_id;
            await ad.save();
            res.status(200).json({ success: true, message: 'Ad activated' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
