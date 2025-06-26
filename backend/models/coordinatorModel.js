const db = require('./db');

const coordinatorModel = {
  // Create a new coordinator
  createCoordinator: (coordinatorData, callback) => {
    const { user_id, department, specialization, max_concurrent_cases } = coordinatorData;
    
    const sql = `INSERT INTO coordinators (user_id, department, specialization, max_concurrent_cases) 
                 VALUES (?, ?, ?, ?)`;
    
    db.run(sql, [user_id, department, specialization, max_concurrent_cases || 10], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...coordinatorData });
    });
  },

  // Get all active coordinators
  getAllCoordinators: (callback) => {
    const sql = `
      SELECT c.*, u.name, u.email 
      FROM coordinators c
      JOIN users u ON c.user_id = u.id
      WHERE c.is_active = 1
      ORDER BY u.name
    `;
    
    db.all(sql, [], callback);
  },

  // Get coordinator by ID
  getCoordinatorById: (id, callback) => {
    const sql = `
      SELECT c.*, u.name, u.email 
      FROM coordinators c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `;
    
    db.get(sql, [id], callback);
  },

  // Get coordinator by user ID
  getCoordinatorByUserId: (userId, callback) => {
    const sql = `
      SELECT c.*, u.name, u.email 
      FROM coordinators c
      JOIN users u ON c.user_id = u.id
      WHERE c.user_id = ?
    `;
    
    db.get(sql, [userId], callback);
  },

  // Get coordinators by department
  getCoordinatorsByDepartment: (department, callback) => {
    const sql = `
      SELECT c.*, u.name, u.email 
      FROM coordinators c
      JOIN users u ON c.user_id = u.id
      WHERE c.department = ? AND c.is_active = 1
      ORDER BY u.name
    `;
    
    db.all(sql, [department], callback);
  },

  // Get coordinator workload
  getCoordinatorWorkload: (coordinatorId, callback) => {
    const sql = `
      SELECT 
        COUNT(ga.grievance_id) as active_cases,
        c.max_concurrent_cases,
        (c.max_concurrent_cases - COUNT(ga.grievance_id)) as available_capacity
      FROM coordinators c
      LEFT JOIN grievance_assignments ga ON c.id = ga.coordinator_id AND ga.is_active = 1
      LEFT JOIN grievances g ON ga.grievance_id = g.id AND g.status NOT IN ('Resolved', 'Rejected')
      WHERE c.id = ?
      GROUP BY c.id
    `;
    
    db.get(sql, [coordinatorId], callback);
  },

  // Assign grievance to coordinator
  assignGrievance: (assignmentData, callback) => {
    const { grievance_id, coordinator_id, assigned_by, notes } = assignmentData;
    
    // First, deactivate any existing assignments for this grievance
    const deactivateSql = `UPDATE grievance_assignments SET is_active = 0 WHERE grievance_id = ?`;
    
    db.run(deactivateSql, [grievance_id], (err) => {
      if (err) return callback(err);
      
      // Create new assignment
      const assignSql = `
        INSERT INTO grievance_assignments (grievance_id, coordinator_id, assigned_by, notes) 
        VALUES (?, ?, ?, ?)
      `;
      
      db.run(assignSql, [grievance_id, coordinator_id, assigned_by, notes], function(err) {
        if (err) return callback(err);
        callback(null, { id: this.lastID, ...assignmentData });
      });
    });
  },

  // Get grievances assigned to coordinator
  getCoordinatorGrievances: (coordinatorId, callback) => {
    const sql = `
      SELECT 
        g.*,
        u.name as student_name,
        u.email as student_email,
        ga.assigned_at,
        ga.notes as assignment_notes
      FROM grievances g
      JOIN grievance_assignments ga ON g.id = ga.grievance_id
      JOIN students s ON g.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      WHERE ga.coordinator_id = ? AND ga.is_active = 1
      ORDER BY g.submission_date DESC
    `;
    
    db.all(sql, [coordinatorId], callback);
  },

  // Update coordinator status
  updateCoordinatorStatus: (id, isActive, callback) => {
    const sql = `UPDATE coordinators SET is_active = ? WHERE id = ?`;
    db.run(sql, [isActive, id], callback);
  },

  // Update coordinator details
  updateCoordinator: (id, updates, callback) => {
    const { department, specialization, max_concurrent_cases } = updates;
    
    const sql = `
      UPDATE coordinators 
      SET department = ?, specialization = ?, max_concurrent_cases = ?
      WHERE id = ?
    `;
    
    db.run(sql, [department, specialization, max_concurrent_cases, id], callback);
  },

  // Get all assignments across all coordinators
  getAllAssignments: (callback) => {
    const sql = `
      SELECT 
        ga.*,
        g.type as grievance_type,
        g.priority_level,
        g.status,
        u.name as student_name,
        u2.name as coordinator_name
      FROM grievance_assignments ga
      JOIN grievances g ON ga.grievance_id = g.id
      JOIN students s ON g.student_id = s.user_id
      JOIN users u ON s.user_id = u.id
      JOIN coordinators c ON ga.coordinator_id = c.id
      JOIN users u2 ON c.user_id = u2.id
      WHERE ga.is_active = 1
      ORDER BY ga.assigned_at DESC
    `;
    
    db.all(sql, [], callback);
  }
};

module.exports = coordinatorModel;
