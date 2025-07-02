const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5174'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    body: req.body
  });
  next();
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

try {
  // Import feedback routes
  const feedbackRoutes = require('./routes/feedbackRoutes');
  app.use('/api/feedback', feedbackRoutes);
  console.log('✅ Feedback routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading feedback routes:', error);
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Test Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server is running on port ${PORT}`);
});
