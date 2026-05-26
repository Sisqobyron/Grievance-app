const db = require('./db');
const { hashPassword } = require('../utils/passwords');

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

// Create a new user
exports.createUser = (user, callback) => {
  const { name, email, password, role } = user;
  const sql = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;

  hashPassword(password)
    .then((passwordHash) => {
      db.run(sql, [name, email, passwordHash, role], function (err) {
        if (err) return callback(err);
        callback(null, sanitizeUser({ id: this.lastID, ...user, password: passwordHash }));
      });
    })
    .catch((error) => callback(error));
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

exports.updatePassword = (id, password, callback) => {
  const sql = `UPDATE users SET password = ? WHERE id = ?`;
  db.run(sql, [password, id], callback);
};

exports.sanitizeUser = sanitizeUser;
