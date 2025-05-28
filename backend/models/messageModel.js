const db = require('./db');

const Message = {
  create: (grievanceId, senderId, receiverId, content) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO messages (grievance_id, sender_id, receiver_id, content, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `;
      
      db.run(query, [grievanceId, senderId, receiverId, content], function(err) {
        if (err) {
          console.error('Error creating message:', err);
          reject(err);
        } else {
          resolve({ success: true, id: this.lastID });
        }
      });
    });
  },

  getMessagesByGrievance: (grievanceId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          m.id,
          m.grievance_id,
          m.sender_id,
          m.receiver_id,
          m.content,
          m.created_at,
          s.name as sender_name,
          r.name as receiver_name
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.receiver_id = r.id
        WHERE m.grievance_id = ?
        ORDER BY m.created_at ASC
      `;
      
      db.all(query, [grievanceId], (err, rows) => {
        if (err) {
          console.error('Error getting messages:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
};

module.exports = Message;
