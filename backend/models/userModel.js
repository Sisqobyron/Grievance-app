const db = require('./db');

// Create a new user
exports.createUser = (user, callback) => {
  const { name, email, password, role } = user;
  const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
  db.run(sql, [name, email, password, role], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...user });
  });
};

// Find user by email (for login)
exports.findUserByEmail = (email, callback) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], callback);
};

// Get user by ID
exports.findUserById = (id, callback) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  db.get(sql, [id], callback);
};
