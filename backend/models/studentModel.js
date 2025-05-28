const db = require('./db');

// Add student details
exports.createStudent = (student, callback) => {
  const { user_id, department, program, matricule, level } = student;
  const sql = `INSERT INTO students (user_id, department, program, matricule, level) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [user_id, department, program, matricule, level], function (err) {
    if (err) return callback(err);
    callback(null, student);
  });
};

// Get student by user ID
exports.getStudentByUserId = (user_id, callback) => {
  const sql = `SELECT * FROM students WHERE user_id = ?`;
  db.get(sql, [user_id], callback);
};
