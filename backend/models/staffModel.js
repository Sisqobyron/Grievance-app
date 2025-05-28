const db = require('./db');

// Add staff details
exports.createStaff = (staff, callback) => {
  const { user_id, department } = staff;
  const sql = `INSERT INTO staff (user_id, department) VALUES (?, ?)`;
  db.run(sql, [user_id, department], function (err) {
    if (err) return callback(err);
    callback(null, staff);
  });
};

// Get staff by user ID
exports.getStaffByUserId = (user_id, callback) => {
  const sql = `SELECT * FROM staff WHERE user_id = ?`;
  db.get(sql, [user_id], callback);
};
