const db = require('./db');

// Get all users with their role-specific details
exports.getAllUsers = (callback) => {
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      s.department as student_department,
      s.program,
      s.matricule,
      s.level,
      st.department as staff_department
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN staff st ON u.id = st.user_id
    ORDER BY u.role, u.name
  `;
  db.all(sql, callback);
};

// Get users by role
exports.getUsersByRole = (role, callback) => {
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      s.department as student_department,
      s.program,
      s.matricule,
      s.level,
      st.department as staff_department
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN staff st ON u.id = st.user_id
    WHERE u.role = ?
    ORDER BY u.name
  `;
  db.all(sql, [role], callback);
};

// Update user role
exports.updateUserRole = (userId, newRole, callback) => {
  const sql = `UPDATE users SET role = ? WHERE id = ?`;
  db.run(sql, [newRole, userId], callback);
};

// Delete user and associated data
exports.deleteUser = (userId, callback) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Delete from role-specific tables first
    db.run(`DELETE FROM students WHERE user_id = ?`, [userId]);
    db.run(`DELETE FROM staff WHERE user_id = ?`, [userId]);
    
    // Delete from users table
    db.run(`DELETE FROM users WHERE id = ?`, [userId], function(err) {
      if (err) {
        db.run('ROLLBACK');
        return callback(err);
      }
      
      db.run('COMMIT');
      callback(null, { deletedUserId: userId });
    });
  });
};

// Get user statistics
exports.getUserStats = (callback) => {
  const sql = `
    SELECT 
      role,
      COUNT(*) as count
    FROM users
    GROUP BY role
  `;
  db.all(sql, callback);
};

// Search users by name or email
exports.searchUsers = (searchTerm, callback) => {
  const sql = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.role,
      s.department as student_department,
      s.program,
      s.matricule,
      s.level,
      st.department as staff_department
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN staff st ON u.id = st.user_id
    WHERE u.name LIKE ? OR u.email LIKE ?
    ORDER BY u.role, u.name
  `;
  const searchPattern = `%${searchTerm}%`;
  db.all(sql, [searchPattern, searchPattern], callback);
};

// Update user details
exports.updateUser = (userId, updates, callback) => {
  const { name, email } = updates;
  const sql = `UPDATE users SET name = ?, email = ? WHERE id = ?`;
  db.run(sql, [name, email, userId], callback);
};

// Get admin-specific dashboard data
exports.getAdminDashboardData = (callback) => {
  const queries = {
    userStats: `
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
    `,
    grievanceStats: `
      SELECT 
        status,
        COUNT(*) as count
      FROM grievances
      GROUP BY status
    `,
    recentUsers: `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        s.department as student_department,
        st.department as staff_department
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      ORDER BY u.id DESC
      LIMIT 5
    `,
    departmentStats: `
      SELECT 
        COALESCE(s.department, st.department) as department,
        COUNT(*) as count
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN staff st ON u.id = st.user_id
      WHERE COALESCE(s.department, st.department) IS NOT NULL
      GROUP BY COALESCE(s.department, st.department)
    `
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, (err, rows) => {
      if (err) {
        console.error(`Error executing ${key} query:`, err);
        results[key] = [];
      } else {
        results[key] = rows;
      }
      
      completed++;
      if (completed === total) {
        callback(null, results);
      }
    });
  });
};
