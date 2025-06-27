const db = require('./db');

const timelineModel = {
  // Add timeline entry
  addTimelineEntry: (timelineData, callback) => {
    const { 
      grievance_id, 
      action_type, 
      action_description, 
      performed_by, 
      metadata 
    } = timelineData;
    
    const sql = `
      INSERT INTO grievance_timeline 
      (grievance_id, action_type, action_description, performed_by, metadata) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      grievance_id, 
      action_type, 
      action_description, 
      performed_by, 
      metadata ? JSON.stringify(metadata) : null
    ], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...timelineData });
    });
  },
  // Get timeline for grievance
  getGrievanceTimeline: (grievanceId, callback) => {
    const sql = `
      SELECT 
        gt.id,
        gt.grievance_id,
        gt.action_type as activity_type,
        gt.action_description as description,
        gt.performed_by as user_id,
        gt.performed_at as timestamp,
        gt.metadata,
        u.name as performer_name,
        u.role as performer_role
      FROM grievance_timeline gt
      LEFT JOIN users u ON gt.performed_by = u.id
      WHERE gt.grievance_id = ?
      ORDER BY gt.performed_at ASC
    `;
    
    db.all(sql, [grievanceId], (err, rows) => {
      if (err) return callback(err);
      
      // Parse metadata JSON and format for frontend
      const timeline = rows.map(row => ({
        id: row.id,
        grievance_id: row.grievance_id,
        activity_type: row.activity_type,
        description: row.description,
        user_id: row.user_id,
        timestamp: row.timestamp,
        metadata: row.metadata
      }));
      
      callback(null, timeline);
    });
  },

  // Get recent activity across all grievances
  getRecentActivity: (limit = 50, callback) => {
    const sql = `
      SELECT 
        gt.*,
        g.type as grievance_type,
        g.priority_level,
        u.name as performer_name,
        u.role as performer_role,
        s.name as student_name
      FROM grievance_timeline gt
      JOIN grievances g ON gt.grievance_id = g.id
      LEFT JOIN users u ON gt.performed_by = u.id
      LEFT JOIN students st ON g.student_id = st.user_id
      LEFT JOIN users s ON st.user_id = s.id
      ORDER BY gt.performed_at DESC
      LIMIT ?
    `;
    
    db.all(sql, [limit], (err, rows) => {
      if (err) return callback(err);
      
      const activities = rows.map(row => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));
        callback(null, activities);
    });
  },

  // Get activity by coordinator
  getCoordinatorActivity: (coordinatorId, days = 7, callback) => {
    const sql = `
      SELECT 
        gt.*,
        g.type as grievance_type,
        g.priority_level,
        u.name as performer_name
      FROM grievance_timeline gt
      JOIN grievances g ON gt.grievance_id = g.id
      LEFT JOIN users u ON gt.performed_by = u.id
      WHERE g.assigned_to = ? 
        AND gt.performed_at >= datetime('now', '-${days} days')
      ORDER BY gt.performed_at DESC
    `;
    
    db.all(sql, [coordinatorId], (err, rows) => {
      if (err) return callback(err);
      
      const activities = rows.map(row => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));
      
      callback(null, activities);
    });
  },

  // Record tracking metric
  recordMetric: (metricData, callback) => {
    const { grievance_id, metric_type, metric_value } = metricData;
    
    const sql = `
      INSERT INTO tracking_metrics (grievance_id, metric_type, metric_value) 
      VALUES (?, ?, ?)
    `;
    
    db.run(sql, [grievance_id, metric_type, metric_value], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...metricData });
    });
  },

  // Get metrics for grievance
  getGrievanceMetrics: (grievanceId, callback) => {
    const sql = `
      SELECT * FROM tracking_metrics 
      WHERE grievance_id = ? 
      ORDER BY recorded_at DESC
    `;
    
    db.all(sql, [grievanceId], callback);
  },

  // Calculate response time metrics
  calculateResponseTime: (grievanceId, callback) => {
    const sql = `
      SELECT 
        g.submission_date,
        MIN(gt.performed_at) as first_response_time,
        julianday(MIN(gt.performed_at)) - julianday(g.submission_date) as response_time_days
      FROM grievances g
      LEFT JOIN grievance_timeline gt ON g.id = gt.grievance_id 
        AND gt.action_type IN ('assigned', 'status_changed', 'message_sent')
      WHERE g.id = ?
      GROUP BY g.id
    `;
    
    db.get(sql, [grievanceId], (err, result) => {
      if (err) return callback(err);
      
      if (result && result.response_time_days !== null) {
        const responseTimeHours = result.response_time_days * 24;
        
        // Record the metric
        this.recordMetric({
          grievance_id: grievanceId,
          metric_type: 'response_time',
          metric_value: responseTimeHours
        }, () => {}); // Silent callback
        
        callback(null, {
          ...result,
          response_time_hours: responseTimeHours
        });
      } else {
        callback(null, { response_time_hours: null });
      }
    });
  },

  // Get performance analytics
  getPerformanceAnalytics: (timeframe = 30, callback) => {
    const sql = `
      SELECT 
        AVG(CASE WHEN tm.metric_type = 'response_time' THEN tm.metric_value END) as avg_response_time,
        AVG(CASE WHEN tm.metric_type = 'resolution_time' THEN tm.metric_value END) as avg_resolution_time,
        COUNT(DISTINCT CASE WHEN gt.action_type = 'escalated' THEN gt.grievance_id END) as escalated_cases,
        COUNT(DISTINCT gt.grievance_id) as total_cases,
        (COUNT(DISTINCT CASE WHEN gt.action_type = 'escalated' THEN gt.grievance_id END) * 100.0 / 
         COUNT(DISTINCT gt.grievance_id)) as escalation_rate
      FROM grievance_timeline gt
      LEFT JOIN tracking_metrics tm ON gt.grievance_id = tm.grievance_id
      WHERE gt.performed_at >= datetime('now', '-${timeframe} days')
    `;
    
    db.get(sql, [], callback);
  }
};

module.exports = timelineModel;
