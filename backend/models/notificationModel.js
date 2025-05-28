const db = require('./db');

// Save a notification
exports.saveNotification = (user_id, message, callback) => {
  const date_sent = new Date().toISOString();
  const sql = `INSERT INTO notifications (user_id, message, date_sent) VALUES (?, ?, ?)`;
  db.run(sql, [user_id, message, date_sent], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, user_id, message, date_sent });
  });
};

// Mark as read
exports.markAsRead = (id, callback) => {
  const sql = `UPDATE notifications SET status = 'read' WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) return callback(err);
    callback(null, { id, status: 'read' });
  });
};

// Get all notifications for a user
exports.getUserNotifications = (user_id, callback) => {
  const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY date_sent DESC`;
  db.all(sql, [user_id], callback);
};
