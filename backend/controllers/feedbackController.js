const feedbackModel = require('../models/feedbackModel');

const feedbackController = {
  // Submit feedback
  submitFeedback: (req, res) => {
    console.log('Feedback submission request received:', req.body);
    
    const { grievanceId, grievance_id, rating, comments, comment } = req.body;
    // Handle both grievanceId and grievance_id for compatibility
    const finalGrievanceId = grievanceId || grievance_id;
    // Handle both comments and comment for compatibility
    const finalComments = comments || comment;
    
    const user_id = req.user ? req.user.id : req.body.user_id || 1; // Default user for testing
    
    console.log('Processed values:', {
      finalGrievanceId,
      user_id,
      rating,
      finalComments
    });
    
    if (!finalGrievanceId || !rating) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Missing required fields: grievanceId and rating',
        received: { grievanceId: finalGrievanceId, rating }
      });
    }
    
    feedbackModel.submitFeedback({ 
      grievance_id: finalGrievanceId, 
      user_id, 
      rating, 
      comments: finalComments 
    }, (err, feedback) => {
      if (err) {
        console.error('Error submitting feedback:', err);
        return res.status(500).json({ message: 'Could not submit feedback', error: err });
      }
      console.log('Feedback submitted successfully:', feedback);
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
  },

  // Get feedback statistics for a specific grievance
  getFeedbackStatsForGrievance: (req, res) => {
    const grievanceId = req.params.grievanceId;
    feedbackModel.getFeedbackStatsForGrievance(grievanceId, (err, stats) => {
      if (err) return res.status(500).json({ message: 'Error retrieving feedback stats', error: err });
      res.json(stats);
    });
  }
};

module.exports = feedbackController;
