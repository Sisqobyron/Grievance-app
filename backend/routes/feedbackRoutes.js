const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Submit feedback
router.post('/', feedbackController.submitFeedback);
// Get feedback for a grievance
router.get('/grievance/:grievanceId', feedbackController.getFeedbackForGrievance);
// Get feedback by user
router.get('/user/:userId', feedbackController.getFeedbackByUser);
// Get all feedback
router.get('/all', feedbackController.getAllFeedback);
// Get feedback statistics
router.get('/stats', feedbackController.getFeedbackStats);

module.exports = router;
