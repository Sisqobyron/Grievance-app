const express = require('express');
const router = express.Router();
const notificationModel = require('../models/notificationModel');

// Get all notifications for a user
router.get('/:user_id', (req, res) => {
  const { user_id } = req.params;
  notificationModel.getUserNotifications(user_id, (err, notifications) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch notifications' });
    res.json(notifications);
  });
});

module.exports = router;
