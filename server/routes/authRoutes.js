const express = require('express');
const passport = require('passport');
const { 
    register, 
    login, 
    getMe, 
    forgotPassword, 
    resetPassword, 
    logout,
    updateDetails,
    updatePassword,
    verifyOtp
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.post('/verifyotp', verifyOtp);
router.put('/resetpassword', resetPassword);

module.exports = router;
