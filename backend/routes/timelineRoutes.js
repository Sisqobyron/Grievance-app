const express = require('express');
const router = express.Router();
const timelineModel = require('../models/timelineModel');

// Get timeline for a grievance
router.get('/grievance/:grievanceId', (req, res) => {
  timelineModel.getGrievanceTimeline(req.params.grievanceId, (err, timeline) => {
    if (err) return res.status(500).json({ message: 'Error retrieving timeline', error: err });
    res.json(timeline);
  });
});

// Alternative route for direct grievance ID access (to match frontend expectations)
router.get('/:grievanceId', (req, res) => {
  timelineModel.getGrievanceTimeline(req.params.grievanceId, (err, timeline) => {
    if (err) return res.status(500).json({ message: 'Error retrieving timeline', error: err });
    res.json(timeline);
  });
});

// Get recent activity
router.get('/recent', (req, res) => {
  timelineModel.getRecentActivity(50, (err, activities) => {
    if (err) return res.status(500).json({ message: 'Error retrieving activity', error: err });
    res.json(activities);
  });
});

// Get coordinator activity
router.get('/coordinator/:coordinatorId', (req, res) => {
  timelineModel.getCoordinatorActivity(req.params.coordinatorId, 7, (err, activities) => {
    if (err) return res.status(500).json({ message: 'Error retrieving coordinator activity', error: err });
    res.json(activities);
  });
});

// Get performance analytics
router.get('/analytics', (req, res) => {
  timelineModel.getPerformanceAnalytics(30, (err, analytics) => {
    if (err) return res.status(500).json({ message: 'Error retrieving analytics', error: err });
    res.json(analytics);
  });
});

module.exports = router;
