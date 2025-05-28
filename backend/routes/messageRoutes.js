const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.use(authMiddleware);

// Send a new message
router.post('/', messageController.sendMessage);

// Get all messages for a specific grievance
router.get('/:grievanceId', messageController.getMessages);

module.exports = router;
