const feedbackModel = require('../models/feedbackModel');

const feedbackController = {
  // Submit feedback
  submitFeedback: (req, res) => {
    const { grievance_id, rating, comments } = req.body;
    const user_id = req.user ? req.user.id : req.body.user_id;
    if (!grievance_id || !user_id || !rating) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    feedbackModel.submitFeedback({ grievance_id, user_id, rating, comments }, (err, feedback) => {
      if (err) return res.status(500).json({ message: 'Could not submit feedback', error: err });
      res.status(201).json({ message: 'Feedback submitted successfully', feedback });
    });
  },

  // Get feedback for a grievance
  getFeedbackForGrievance: (req, res) => {
    feedbackModel.getFeedbackForGrievance(req.params.grievanceId, (err, feedback) => {
      if (err) return res.status(500).json({ message: 'Error retrieving feedback', error: err });
      res.json(feedback);
    });
  },

  // Get feedback by user
  getFeedbackByUser: (req, res) => {
    feedbackModel.getFeedbackByUser(req.params.userId, (err, feedback) => {
      if (err) return res.status(500).json({ message: 'Error retrieving feedback', error: err });
      res.json(feedback);
    });
  },

  // Get all feedback
  getAllFeedback: (req, res) => {
    feedbackModel.getAllFeedback((err, feedback) => {
      if (err) return res.status(500).json({ message: 'Error retrieving feedback', error: err });
      res.json(feedback);
    });
  },

  // Get feedback statistics
  getFeedbackStats: (req, res) => {
    feedbackModel.getFeedbackStats((err, stats) => {
      if (err) return res.status(500).json({ message: 'Error retrieving feedback stats', error: err });
      res.json(stats);
    });
  }
};

module.exports = feedbackController;
