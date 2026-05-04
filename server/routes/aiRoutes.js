const express = require('express');
const { aiChat, getEventSummary, organizerInsights } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// AI Chat — protected, role passed in body
router.post('/chat', protect, aiChat);

// Event summary for AI context (public)
router.get('/event-summary/:eventId', getEventSummary);

// Organizer AI Insights — protected, organizer/admin only
router.post('/organizer-insights', protect, authorize('organizer', 'admin'), organizerInsights);

module.exports = router;
