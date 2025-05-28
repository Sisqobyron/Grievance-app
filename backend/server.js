const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const statsRoutes = require('./routes/statsRoutes');

// API Route declarations
app.use('/api/auth', authRoutes);                 // Login
app.use('/api/users', userRoutes);                // Register students/staff
app.use('/api/grievances', grievanceRoutes);      // Submit, update, fetch grievances
app.use('/api/notifications', notificationRoutes); // View notifications
app.use('/api/messages', messageRoutes);          // Send and receive messages
app.use('/api/stats', statsRoutes);               // Grievance statistics

// Root endpoint
app.get('/', (req, res) => {
  res.send('Student Grievance System API is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
