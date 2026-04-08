const express = require('express');
const { getNotifications, markRead } = require('../controllers/notificationController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markRead);

module.exports = router;
