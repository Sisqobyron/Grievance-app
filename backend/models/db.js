const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sgs.db');

db.serialize(() => {
  // Users table (all types)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'staff', 'admin'))
  )`);

  // Students table (linked to users)
  db.run(`CREATE TABLE IF NOT EXISTS students (
    user_id INTEGER PRIMARY KEY,
    department TEXT,
    program TEXT,
    matricule TEXT UNIQUE,
    level TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Staff table (linked to users)
  db.run(`CREATE TABLE IF NOT EXISTS staff (
    user_id INTEGER PRIMARY KEY,
    department TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  // Grievances table
  db.run(`CREATE TABLE IF NOT EXISTS grievances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Submitted',
    file_path TEXT,
    submission_date TEXT,
    priority_level TEXT,
    additional_data TEXT,
    FOREIGN KEY(student_id) REFERENCES students(user_id)
  )`);

  // Messages table
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(grievance_id) REFERENCES grievances(id),
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  )`);

  // Notifications table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    date_sent TEXT,
    status TEXT DEFAULT 'unread',
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  
  // Coordinators table (enhanced staff role)
  db.run(`CREATE TABLE IF NOT EXISTS coordinators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    department TEXT,
    specialization TEXT,
    max_concurrent_cases INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Grievance assignments table
  db.run(`CREATE TABLE IF NOT EXISTS grievance_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    coordinator_id INTEGER NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY(grievance_id) REFERENCES grievances(id),
    FOREIGN KEY(coordinator_id) REFERENCES coordinators(id),
    FOREIGN KEY(assigned_by) REFERENCES users(id)
  )`);

  // Deadline management table
  db.run(`CREATE TABLE IF NOT EXISTS grievance_deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    deadline_type TEXT NOT NULL CHECK(deadline_type IN ('initial_response', 'investigation', 'resolution', 'custom')),
    deadline_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    is_met BOOLEAN DEFAULT 0,
    met_at DATETIME,
    notes TEXT,
    FOREIGN KEY(grievance_id) REFERENCES grievances(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
  )`);

  // Escalation rules table
  db.run(`CREATE TABLE IF NOT EXISTS escalation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT NOT NULL,
    grievance_type TEXT,
    priority_level TEXT,
    trigger_condition TEXT NOT NULL CHECK(trigger_condition IN ('deadline_missed', 'time_exceeded', 'status_unchanged', 'manual')),
    trigger_value INTEGER, -- hours/days for time-based triggers
    escalation_action TEXT NOT NULL CHECK(escalation_action IN ('reassign', 'notify_supervisor', 'escalate_priority', 'auto_resolve')),
    escalation_target TEXT, -- department, role, or specific user
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Escalation history table
  db.run(`CREATE TABLE IF NOT EXISTS escalation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    rule_id INTEGER,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    trigger_reason TEXT,
    escalation_action TEXT,
    previous_status TEXT,
    new_status TEXT,
    previous_assignee INTEGER,
    new_assignee INTEGER,
    notes TEXT,
    created_by INTEGER,
    FOREIGN KEY(grievance_id) REFERENCES grievances(id),
    FOREIGN KEY(rule_id) REFERENCES escalation_rules(id),
    FOREIGN KEY(previous_assignee) REFERENCES users(id),
    FOREIGN KEY(new_assignee) REFERENCES users(id),
    FOREIGN KEY(created_by) REFERENCES users(id)
  )`);

  // Grievance timeline table for real-time tracking
  db.run(`CREATE TABLE IF NOT EXISTS grievance_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    action_type TEXT NOT NULL CHECK(action_type IN ('created', 'assigned', 'status_changed', 'message_sent', 'deadline_set', 'escalated', 'resolved')),
    action_description TEXT NOT NULL,
    performed_by INTEGER,
    performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON for additional context
    FOREIGN KEY(grievance_id) REFERENCES grievances(id),
    FOREIGN KEY(performed_by) REFERENCES users(id)
  )`);

  // Real-time tracking metrics
  db.run(`CREATE TABLE IF NOT EXISTS tracking_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    metric_type TEXT NOT NULL CHECK(metric_type IN ('response_time', 'resolution_time', 'escalation_count', 'message_count')),
    metric_value REAL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(grievance_id) REFERENCES grievances(id)
  )`);

  // Feedback table
  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comments TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(grievance_id) REFERENCES grievances(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

module.exports = db;
