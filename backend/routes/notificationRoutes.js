const express = require('express');
const router = express.Router();
const notificationModel = require('../models/notificationModel');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimitMiddleware');

// Get all notifications for a user
router.get('/:user_id', rateLimiter, authMiddleware, (req, res) => {
  const userId = Number(req.params.user_id);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  notificationModel.getUserNotifications(userId, (err, notifications) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch notifications' });
    res.json(notifications);
  });
});

module.exports = router;
