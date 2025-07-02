console.log('Starting import test...');

try {
  console.log('Testing db import...');
  const db = require('./models/db');
  console.log('✅ Database imported successfully');

  console.log('Testing feedback model import...');
  const feedbackModel = require('./models/feedbackModel');
  console.log('✅ Feedback model imported successfully');

  console.log('Testing feedback controller import...');
  const feedbackController = require('./controllers/feedbackController');
  console.log('✅ Feedback controller imported successfully');

  console.log('All imports successful!');
} catch (error) {
  console.error('❌ Import error:', error);
}
