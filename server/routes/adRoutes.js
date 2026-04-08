const express = require('express');
const router = express.Router();
const { 
    createAd, 
    getActiveAds, 
    getMyAds, 
    payForAd, 
    verifyAdPayment,
    updateAd,
    deleteAd,
    getAllAds 
} = require('../controllers/adController');
const { protect, authorize } = require('../middleware/auth');

// Public Category
router.get('/active', getActiveAds);

// Private (User/Brand)
router.post('/', protect, createAd);
router.get('/my-ads', protect, getMyAds);
router.post('/:id/pay', protect, payForAd);
router.post('/verify', protect, verifyAdPayment);
router.put('/:id', protect, updateAd);
router.delete('/:id', protect, deleteAd);

// Admin Only
router.get('/all', protect, authorize('admin'), getAllAds);

module.exports = router;
