const db = require('./db');

const feedbackModel = {
  // Submit feedback
  submitFeedback: (feedbackData, callback) => {
    const { grievance_id, user_id, rating, comments, category } = feedbackData;
    const sql = `INSERT INTO feedback (grievance_id, user_id, rating, comments, category) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [grievance_id, user_id, rating, comments, category || 'general'], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...feedbackData });
    });
  },

  // Get feedback for a grievance
  getFeedbackForGrievance: (grievanceId, callback) => {
    const sql = `SELECT f.*, u.name as user_name, f.submitted_at as created_at FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.grievance_id = ? ORDER BY f.submitted_at DESC`;
    db.all(sql, [grievanceId], callback);
  },

  // Get feedback by user
  getFeedbackByUser: (userId, callback) => {
    const sql = `SELECT f.*, u.name as user_name, f.submitted_at as created_at FROM feedback f JOIN users u ON f.user_id = u.id WHERE f.user_id = ? ORDER BY f.submitted_at DESC`;
    db.all(sql, [userId], callback);
  },

  // Get all feedback (admin/staff)
  getAllFeedback: (callback) => {
    const sql = `SELECT f.*, u.name as user_name, g.type as grievance_type, f.submitted_at as created_at FROM feedback f JOIN users u ON f.user_id = u.id JOIN grievances g ON f.grievance_id = g.id ORDER BY f.submitted_at DESC`;
    db.all(sql, [], callback);
  },

  // Get feedback statistics
  getFeedbackStats: (callback) => {
    const statsQuery = `SELECT AVG(rating) as avg_rating, COUNT(*) as total_feedback FROM feedback`;
    const distributionQuery = `SELECT rating, COUNT(*) as count FROM feedback GROUP BY rating`;
    
    db.get(statsQuery, [], (err, stats) => {
      if (err) return callback(err);
      
      if (!stats || stats.total_feedback === 0) {
        return callback(null, { 
          averageRating: 0, 
          totalFeedback: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
      
      db.all(distributionQuery, [], (err, distribution) => {
        if (err) return callback(err);
        
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (distribution) {
          distribution.forEach(item => {
            ratingDistribution[item.rating] = item.count;
          });
        }
        
        callback(null, {
          averageRating: stats.avg_rating || 0,
          totalFeedback: stats.total_feedback || 0,
          ratingDistribution
        });
      });
    });
  },

  // Get feedback statistics for a specific grievance
  getFeedbackStatsForGrievance: (grievanceId, callback) => {
    const statsQuery = `SELECT AVG(rating) as avg_rating, COUNT(*) as total_feedback FROM feedback WHERE grievance_id = ?`;
    const distributionQuery = `SELECT rating, COUNT(*) as count FROM feedback WHERE grievance_id = ? GROUP BY rating`;
    
    db.get(statsQuery, [grievanceId], (err, stats) => {
      if (err) return callback(err);
      
      if (!stats || stats.total_feedback === 0) {
        return callback(null, { 
          averageRating: 0, 
          totalFeedback: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
      
      db.all(distributionQuery, [grievanceId], (err, distribution) => {
        if (err) return callback(err);
        
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        if (distribution) {
          distribution.forEach(item => {
            ratingDistribution[item.rating] = item.count;
          });
        }
        
        callback(null, {
          averageRating: stats.avg_rating || 0,
          totalFeedback: stats.total_feedback || 0,
          ratingDistribution
        });
      });
    });
  }
};

module.exports = feedbackModel;
