const express = require('express');
const {
    getEvents,
    getEvent,
    getEventsInRadius,
    createEvent,
    updateEvent,
    deleteEvent,
    eventPhotoUpload
} = require('../controllers/eventController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/radius/:lat/:lng/:distance', getEventsInRadius);

router.put('/:id/photo', protect, authorize('organizer', 'admin'), upload.single('image'), eventPhotoUpload);

router
    .route('/')
    .get(getEvents)
    .post(protect, authorize('organizer', 'admin'), createEvent);

router
    .route('/:id')
    .get(getEvent)
    .put(protect, authorize('organizer', 'admin'), updateEvent)
    .delete(protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
