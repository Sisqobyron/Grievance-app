const db = require('./db');

const feedbackModel = {
  // Submit feedback
  submitFeedback: (feedbackData, callback) => {
    const { grievance_id, user_id, rating, comments } = feedbackData;
    const sql = `INSERT INTO feedback (grievance_id, user_id, rating, comments) VALUES (?, ?, ?, ?)`;
    db.run(sql, [grievance_id, user_id, rating, comments], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...feedbackData });
    });
  },

  // Get feedback for a grievance
  getFeedbackForGrievance: (grievanceId, callback) => {
    const sql = `SELECT * FROM feedback WHERE grievance_id = ?`;
    db.all(sql, [grievanceId], callback);
  },

  // Get feedback by user
  getFeedbackByUser: (userId, callback) => {
    const sql = `SELECT * FROM feedback WHERE user_id = ?`;
    db.all(sql, [userId], callback);
  },

  // Get all feedback (admin/staff)
  getAllFeedback: (callback) => {
    const sql = `SELECT f.*, u.name as user_name, g.type as grievance_type FROM feedback f JOIN users u ON f.user_id = u.id JOIN grievances g ON f.grievance_id = g.id ORDER BY f.submitted_at DESC`;
    db.all(sql, [], callback);
  },

  // Get feedback statistics
  getFeedbackStats: (callback) => {
    const sql = `SELECT AVG(rating) as avg_rating, COUNT(*) as total_feedback FROM feedback`;
    db.get(sql, [], callback);
  }
};

module.exports = feedbackModel;
