const db = require('./db');

// Submit a grievance
exports.createGrievance = (grievance, callback) => {
  const {
    student_id,
    type,
    subcategory,
    description,
    file_path,
    submission_date,
    priority_level,
    additional_data
  } = grievance;

  const sql = `
    INSERT INTO grievances (student_id, type, subcategory, description, file_path, submission_date, priority_level, additional_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [student_id, type, subcategory, description, file_path, submission_date, priority_level, additional_data], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...grievance });
  });
};

// Get grievance by ID
exports.getGrievanceById = (id, callback) => {
  const sql = `SELECT * FROM grievances WHERE id = ?`;
  db.get(sql, [id], callback);
};

// Get all grievances for a student
exports.getGrievancesByStudent = (student_id, callback) => {
  const sql = `SELECT * FROM grievances WHERE student_id = ?`;
  db.all(sql, [student_id], callback);
};

// Update grievance status
exports.updateGrievanceStatus = (id, status, callback) => {
  const sql = `UPDATE grievances SET status = ? WHERE id = ?`;
  db.run(sql, [status, id], function (err) {
    if (err) return callback(err);
    callback(null, { id, status });
  });
};

// Get all grievances (for staff)
exports.getAllGrievances = (callback) => {
  const sql = `
    SELECT 
      g.*,
      u.name as student_name,
      s.department,
      s.program,
      s.level
    FROM grievances g
    JOIN students s ON g.student_id = s.user_id
    JOIN users u ON s.user_id = u.id
    ORDER BY g.submission_date DESC`;
  db.all(sql, [], callback);
};
