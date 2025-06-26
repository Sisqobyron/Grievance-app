const db = require('./db');

const escalationModel = {
  // Create escalation rule
  createEscalationRule: (ruleData, callback) => {
    const { 
      rule_name, 
      grievance_type, 
      priority_level, 
      trigger_condition, 
      trigger_value, 
      escalation_action, 
      escalation_target 
    } = ruleData;
    
    const sql = `
      INSERT INTO escalation_rules 
      (rule_name, grievance_type, priority_level, trigger_condition, trigger_value, escalation_action, escalation_target) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      rule_name, 
      grievance_type, 
      priority_level, 
      trigger_condition, 
      trigger_value, 
      escalation_action, 
      escalation_target
    ], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...ruleData });
    });
  },

  // Get active escalation rules
  getActiveRules: (callback) => {
    const sql = `SELECT * FROM escalation_rules WHERE is_active = 1 ORDER BY priority_level, trigger_value`;
    db.all(sql, [], callback);
  },

  // Get rules for specific grievance type and priority
  getRulesForGrievance: (grievanceType, priorityLevel, callback) => {
    const sql = `
      SELECT * FROM escalation_rules 
      WHERE is_active = 1 
        AND (grievance_type = ? OR grievance_type IS NULL)
        AND (priority_level = ? OR priority_level IS NULL)
      ORDER BY trigger_value ASC
    `;
    
    db.all(sql, [grievanceType, priorityLevel], callback);
  },

  // Check for escalation triggers
  checkEscalationTriggers: (callback) => {
    const sql = `
      SELECT 
        g.*,
        ga.coordinator_id,
        er.*,
        julianday('now') - julianday(g.submission_date) as days_since_submission,
        julianday('now') - julianday(
          COALESCE(
            (SELECT performed_at FROM grievance_timeline WHERE grievance_id = g.id ORDER BY performed_at DESC LIMIT 1),
            g.submission_date
          )
        ) as days_since_last_activity
      FROM grievances g
      LEFT JOIN grievance_assignments ga ON g.id = ga.grievance_id AND ga.is_active = 1
      JOIN escalation_rules er ON (er.grievance_type = g.type OR er.grievance_type IS NULL)
        AND (er.priority_level = g.priority_level OR er.priority_level IS NULL)
      WHERE g.status NOT IN ('Resolved', 'Rejected')
        AND er.is_active = 1
        AND (
          (er.trigger_condition = 'time_exceeded' AND julianday('now') - julianday(g.submission_date) > er.trigger_value)
          OR (er.trigger_condition = 'status_unchanged' AND julianday('now') - julianday(g.submission_date) > er.trigger_value)
          OR (er.trigger_condition = 'deadline_missed' AND EXISTS (
            SELECT 1 FROM grievance_deadlines gd 
            WHERE gd.grievance_id = g.id 
              AND gd.deadline_date < datetime('now') 
              AND gd.is_met = 0
          ))
        )
    `;
    
    db.all(sql, [], callback);
  },

  // Log escalation action
  logEscalation: (escalationData, callback) => {
    const { 
      grievance_id, 
      rule_id, 
      trigger_reason, 
      escalation_action, 
      previous_status, 
      new_status, 
      previous_assignee, 
      new_assignee, 
      notes, 
      created_by 
    } = escalationData;
    
    const sql = `
      INSERT INTO escalation_history 
      (grievance_id, rule_id, trigger_reason, escalation_action, previous_status, new_status, 
       previous_assignee, new_assignee, notes, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      grievance_id, rule_id, trigger_reason, escalation_action, 
      previous_status, new_status, previous_assignee, new_assignee, notes, created_by
    ], function(err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...escalationData });
    });
  },
  // Get escalation history for grievance
  getGrievanceEscalationHistory: (grievanceId, callback) => {
    const sql = `
      SELECT 
        eh.*,
        er.rule_name,
        u1.name as previous_assignee_name,
        u2.name as new_assignee_name,
        u3.name as created_by_name
      FROM escalation_history eh
      LEFT JOIN escalation_rules er ON eh.rule_id = er.id
      LEFT JOIN users u1 ON eh.previous_assignee = u1.id
      LEFT JOIN users u2 ON eh.new_assignee = u2.id
      LEFT JOIN users u3 ON eh.created_by = u3.id
      WHERE eh.grievance_id = ?
      ORDER BY eh.triggered_at DESC
    `;
    
    db.all(sql, [grievanceId], callback);
  },  // Get all escalation history (for management dashboard)
  getAllEscalationHistory: (limit = 50, offset = 0, callback) => {
    // Convert to integers to ensure proper binding
    const limitInt = parseInt(limit, 10);
    const offsetInt = parseInt(offset, 10);
    
    const sql = `
      SELECT eh.*
      FROM escalation_history eh
      ORDER BY eh.triggered_at DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [limitInt, offsetInt], callback);
  },

  // Update rule status
  updateRuleStatus: (ruleId, isActive, callback) => {
    const sql = `UPDATE escalation_rules SET is_active = ? WHERE id = ?`;
    db.run(sql, [isActive, ruleId], callback);
  },
  // Get escalation metrics (for management dashboard)
  getEscalationMetrics: (timeframe = 30, callback) => {
    const sql = `
      SELECT 
        COUNT(*) as totalEscalations,
        (SELECT COUNT(*) FROM escalation_rules WHERE is_active = 1) as activeRules,
        AVG(CASE WHEN new_status = 'Resolved' THEN 
          julianday(
            (SELECT performed_at FROM grievance_timeline 
             WHERE grievance_id = eh.grievance_id AND action_type = 'resolved' 
             ORDER BY performed_at DESC LIMIT 1)
          ) - julianday(eh.triggered_at) 
        END) as avgResolutionTime,
        (COUNT(*) * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM grievances 
                  WHERE submission_date >= datetime('now', '-${timeframe} days')), 0)
        ) as escalationRate
      FROM escalation_history eh
      WHERE eh.triggered_at >= datetime('now', '-${timeframe} days')
    `;
    
    db.get(sql, [], (err, result) => {
      if (err) return callback(err);
      
      // Ensure all metrics have default values
      const metrics = {
        totalEscalations: result?.totalEscalations || 0,
        activeRules: result?.activeRules || 0,
        avgResolutionTime: result?.avgResolutionTime || 0,
        escalationRate: result?.escalationRate || 0
      };
      
      callback(null, metrics);
    });
  },

  // Get escalation statistics
  getEscalationStats: (timeframe = 30, callback) => {
    const sql = `
      SELECT 
        COUNT(*) as total_escalations,
        COUNT(CASE WHEN escalation_action = 'reassign' THEN 1 END) as reassignments,
        COUNT(CASE WHEN escalation_action = 'notify_supervisor' THEN 1 END) as supervisor_notifications,
        COUNT(CASE WHEN escalation_action = 'escalate_priority' THEN 1 END) as priority_escalations,
        AVG(CASE WHEN new_status = 'Resolved' THEN 
          julianday(
            (SELECT performed_at FROM grievance_timeline 
             WHERE grievance_id = eh.grievance_id AND action_type = 'resolved' 
             ORDER BY performed_at DESC LIMIT 1)
          ) - julianday(eh.triggered_at) 
        END) as avg_resolution_time_after_escalation
      FROM escalation_history eh
      WHERE eh.triggered_at >= datetime('now', '-${timeframe} days')
    `;
    
    db.get(sql, [], callback);
  }
};

module.exports = escalationModel;
