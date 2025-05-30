const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sgs.db');

db.serialize(() => {
  // Users table (all types)
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'staff'))
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
  
});

module.exports = db;
