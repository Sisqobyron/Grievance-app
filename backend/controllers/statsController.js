const db = require('../models/db');

exports.getGrievanceStats = (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) as submitted,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as inProgress,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
    FROM grievances
  `;

  const deptQuery = `
    SELECT 
      s.department,
      COUNT(*) as count
    FROM grievances g
    JOIN students s ON g.student_id = s.user_id
    GROUP BY s.department
  `;

  db.get(statsQuery, [], (err, stats) => {
    if (err) {
      console.error('Error fetching grievance stats:', err);
      return res.status(500).json({ message: 'Error fetching statistics' });
    }

    db.all(deptQuery, [], (err, departments) => {
      if (err) {
        console.error('Error fetching department stats:', err);
        return res.status(500).json({ message: 'Error fetching statistics' });
      }

      const byDepartment = {};
      departments.forEach(dept => {
        byDepartment[dept.department] = dept.count;
      });

      res.json({
        ...stats,
        byDepartment
      });
    });
  });
};
