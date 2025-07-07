const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-app.onrender.com'
    : ['http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5174'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers,
    query: req.query
  });
  next();
});

// Static files for uploaded attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const statsRoutes = require('./routes/statsRoutes');
const coordinatorRoutes = require('./routes/coordinatorRoutes');
const deadlineRoutes = require('./routes/deadlineRoutes');
const escalationRoutes = require('./routes/escalationRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

// API Route declarations
app.use('/api/auth', authRoutes);                 // Login
app.use('/api/users', userRoutes);                // Register students/staff
app.use('/api/grievances', grievanceRoutes);      // Submit, update, fetch grievances
app.use('/api/notifications', notificationRoutes); // View notifications
app.use('/api/messages', messageRoutes);          // Send and receive messages
app.use('/api/stats', statsRoutes);               // Grievance statistics
app.use('/api/coordinators', coordinatorRoutes);  // Coordinator management
app.use('/api/deadlines', deadlineRoutes);        // Deadline management
app.use('/api/escalation', escalationRoutes);    // Escalation and tracking
app.use('/api/timeline', timelineRoutes);          // Real-time tracking and analytics
app.use('/api/feedback', feedbackRoutes);          // Feedback management
app.use('/api/admin', adminRoutes);               // Admin management

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Student Grievance System API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify server is receiving requests
app.get('/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Server is working!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
