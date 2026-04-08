const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    date: {
        type: String,
        required: [true, 'Please add a date']
    },
    time: {
        type: String,
        required: [true, 'Please add a time']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    locationCoords: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'
    },
    organizer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    isSponsored: {
        type: Boolean,
        default: false
    },
    ticketsAvailable: {
        type: Number,
        default: 100
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Event', EventSchema);
