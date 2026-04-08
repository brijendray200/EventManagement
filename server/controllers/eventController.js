const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        query = Event.find(JSON.parse(queryStr));

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Event.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const events = await query;

        // Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: events.length,
            pagination,
            data: events
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get events within a radius
// @route   GET /api/events/radius/:lat/:lng/:distance
// @access  Public
exports.getEventsInRadius = async (req, res, next) => {
    try {
        const { lat, lng, distance } = req.params;

        // Radians calculation: divide distance by radius of Earth (3963 miles / 6378 km)
        // Let's use Km
        const radius = distance / 6378;

        const events = await Event.find({
            locationCoords: {
                $geoWithin: { $centerSphere: [[lng, lat], radius] }
            }
        });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
exports.createEvent = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.organizer = req.user.id;
        req.body.organizerName = req.user.name;

        const event = await Event.create(req.body);
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Make sure user is event owner
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'User not authorized to update this event' });
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Make sure user is event owner
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'User not authorized to delete this event' });
        }

        await event.remove();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload photo for event
// @route   PUT /api/events/:id/photo
// @access  Private (Organizer/Admin)
exports.eventPhotoUpload = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Make sure user is event owner
        if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'User not authorized to update this event' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Change the path for the web (from ./public/uploads/file.jpg to /uploads/file.jpg)
        const photoPath = `/uploads/${req.file.filename}`;

        await Event.findByIdAndUpdate(req.params.id, { image: photoPath });

        res.status(200).json({
            success: true,
            data: photoPath
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
