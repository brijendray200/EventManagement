const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Import routes
const auth = require('./routes/authRoutes');
const events = require('./routes/eventRoutes');
const bookings = require('./routes/bookingRoutes');
const ai = require('./routes/aiRoutes');
const admin = require('./routes/adminRoutes');
const notification = require('./routes/notificationRoutes');
const ads = require('./routes/adRoutes');
const feedback = require('./routes/feedbackRoutes');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// For controllers to access
app.set('socketio', io);

// Socket logic
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Middlewares
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Cookie parser
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
})); // Enable CORS with credentials
app.use(morgan('dev')); // Logging

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/events', events);
app.use('/api/bookings', bookings);
app.use('/api/ai', ai);
app.use('/api/admin', admin);
app.use('/api/notifications', notification);
app.use('/api/ads', ads);
app.use('/api/feedback', feedback);

// Root Route
app.get('/', (req, res) => {
  res.send('Event Sphere API is running...');
});

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
