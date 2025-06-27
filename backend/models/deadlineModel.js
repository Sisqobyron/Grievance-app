const db = require('./db');

const deadlineModel = {
  // Create deadline for grievance
  createDeadline: (deadlineData, callback) => {
    const { grievance_id, deadline_type, deadline_date, created_by, notes } = deadlineData;
    
    const sql = `
      INSERT INTO grievance_deadlines (grievance_id, deadline_type, deadline_date, created_by, notes) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [grievance_id, deadline_type, deadline_date, created_by, notes], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...deadlineData });
    });
  },

  // Get deadlines for grievance
  getGrievanceDeadlines: (grievanceId, callback) => {
    const sql = `
      SELECT gd.*, u.name as created_by_name
      FROM grievance_deadlines gd
      LEFT JOIN users u ON gd.created_by = u.id
      WHERE gd.grievance_id = ?
      ORDER BY gd.deadline_date ASC
    `;
    
    db.all(sql, [grievanceId], callback);
  },
  // Get upcoming deadlines (next 7 days)
  getUpcomingDeadlines: (coordinatorId, callback) => {
    const sql = `
      SELECT 
        gd.*,
        g.id as grievance_id,
        g.type as grievance_type,
        g.priority_level,
        u.name as student_name,
        JULIANDAY(gd.deadline_date) - JULIANDAY('now') as days_remaining
      FROM grievance_deadlines gd
      JOIN grievances g ON gd.grievance_id = g.id
      JOIN students s ON g.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE g.assigned_to = ? 
        AND gd.is_met = 0
        AND gd.deadline_date <= datetime('now', '+7 days')
      ORDER BY gd.deadline_date ASC
    `;
    
    db.all(sql, [coordinatorId], callback);
  },

  // Get overdue deadlines
  getOverdueDeadlines: (coordinatorId, callback) => {
    const sql = `
      SELECT 
        gd.*,
        g.id as grievance_id,
        g.type as grievance_type,
        g.priority_level,
        u.name as student_name,
        JULIANDAY('now') - JULIANDAY(gd.deadline_date) as days_overdue
      FROM grievance_deadlines gd
      JOIN grievances g ON gd.grievance_id = g.id
      JOIN students s ON g.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      JOIN grievance_assignments ga ON g.id = ga.grievance_id
      WHERE ga.coordinator_id = ? 
        AND ga.is_active = 1
        AND gd.is_met = 0
        AND gd.deadline_date < datetime('now')
      ORDER BY gd.deadline_date ASC
    `;
    
    db.all(sql, [coordinatorId], callback);
  },

  // Mark deadline as met
  markDeadlineMet: (deadlineId, callback) => {
    const sql = `
      UPDATE grievance_deadlines 
      SET is_met = 1, met_at = datetime('now') 
      WHERE id = ?
    `;
    
    db.run(sql, [deadlineId], callback);
  },

  // Update deadline date
  updateDeadlineDate: (deadlineId, newDate, callback) => {
    const sql = `UPDATE grievance_deadlines SET deadline_date = ? WHERE id = ?`;
    db.run(sql, [newDate, deadlineId], callback);
  },

  // Auto-create standard deadlines for new grievance
  createStandardDeadlines: (grievanceId, priorityLevel, createdBy, callback) => {
    const deadlines = [];
    const now = new Date();
    
    // Calculate deadlines based on priority
    const deadlineHours = {
      'Urgent': { initial_response: 2, investigation: 24, resolution: 72 },
      'High': { initial_response: 4, investigation: 48, resolution: 120 },
      'Medium': { initial_response: 8, investigation: 72, resolution: 168 },
      'Low': { initial_response: 24, investigation: 120, resolution: 240 }
    };
    
    const priority = deadlineHours[priorityLevel] || deadlineHours['Medium'];
    
    // Initial response deadline
    const initialResponse = new Date(now.getTime() + priority.initial_response * 60 * 60 * 1000);
    deadlines.push({
      grievance_id: grievanceId,
      deadline_type: 'initial_response',
      deadline_date: initialResponse.toISOString(),
      created_by: createdBy,
      notes: 'Auto-generated initial response deadline'
    });
    
    // Investigation deadline
    const investigation = new Date(now.getTime() + priority.investigation * 60 * 60 * 1000);
    deadlines.push({
      grievance_id: grievanceId,
      deadline_type: 'investigation',
      deadline_date: investigation.toISOString(),
      created_by: createdBy,
      notes: 'Auto-generated investigation deadline'
    });
    
    // Resolution deadline
    const resolution = new Date(now.getTime() + priority.resolution * 60 * 60 * 1000);
    deadlines.push({
      grievance_id: grievanceId,
      deadline_type: 'resolution',
      deadline_date: resolution.toISOString(),
      created_by: createdBy,
      notes: 'Auto-generated resolution deadline'
    });
      // Insert all deadlines
    let completed = 0;
    const results = [];
    
    deadlines.forEach((deadline) => {
      deadlineModel.createDeadline(deadline, (err, result) => {
        if (err) return callback(err);
        results.push(result);
        completed++;
        if (completed === deadlines.length) {
          callback(null, results);
        }
      });
    });
  },
  // Get deadline statistics for dashboard
  getDeadlineStats: (coordinatorId, callback) => {
    const sql = `
      SELECT 
        COUNT(CASE WHEN gd.deadline_date < datetime('now') AND gd.is_met = 0 THEN 1 END) as overdue,
        COUNT(CASE WHEN gd.deadline_date <= datetime('now', '+1 day') AND gd.is_met = 0 THEN 1 END) as due_today,
        COUNT(CASE WHEN gd.deadline_date <= datetime('now', '+7 days') AND gd.is_met = 0 THEN 1 END) as due_this_week,
        COUNT(CASE WHEN gd.is_met = 1 THEN 1 END) as completed
      FROM grievance_deadlines gd
      JOIN grievances g ON gd.grievance_id = g.id
      WHERE g.assigned_to = ?
    `;
      db.get(sql, [coordinatorId], callback);
  },
  // Get all deadlines
  getAllDeadlines: (callback) => {
    const sql = `
      SELECT 
        gd.*,
        g.id as grievance_id,
        g.type as grievance_type,
        g.priority_level,
        u.name as student_name,
        creator.name as created_by_name,
        JULIANDAY(gd.deadline_date) - JULIANDAY('now') as days_remaining
      FROM grievance_deadlines gd
      JOIN grievances g ON gd.grievance_id = g.id
      JOIN students s ON g.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users creator ON gd.created_by = creator.id
      ORDER BY gd.deadline_date ASC
    `;
    
    db.all(sql, [], callback);
  },

  // Get general upcoming deadlines (for dashboard)
  getGeneralUpcomingDeadlines: (callback) => {
    const sql = `
      SELECT 
        gd.*,
        g.id as grievance_id,
        g.type as grievance_type,
        g.priority_level,
        u.name as student_name,
        creator.name as created_by_name,
        JULIANDAY(gd.deadline_date) - JULIANDAY('now') as days_remaining
      FROM grievance_deadlines gd
      JOIN grievances g ON gd.grievance_id = g.id
      JOIN students s ON g.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users creator ON gd.created_by = creator.id
      WHERE gd.is_met = 0 
        AND JULIANDAY(gd.deadline_date) >= JULIANDAY('now')
      ORDER BY gd.deadline_date ASC
      LIMIT 10
    `;
    
    db.all(sql, [], callback);
  }
};

module.exports = deadlineModel;
