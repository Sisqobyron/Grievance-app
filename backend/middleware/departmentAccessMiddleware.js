const staffModel = require('../models/staffModel');

// Middleware to ensure staff can only access their department's data
const departmentAccessMiddleware = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Admin users have access to all departments
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if user is staff
  if (req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Access denied. Staff role required.' });
  }
  
  // Get staff member's department
  staffModel.getStaffByUserId(req.user.id, (err, staff) => {
    if (err) {
      console.error('Error retrieving staff information:', err);
      return res.status(500).json({ message: 'Error retrieving staff information', error: err });
    }
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff profile not found. Please contact administrator.' });
    }
    
    // Add staff department to request object for use in controllers
    req.staffDepartment = staff.department;
    req.staff = staff;
    
    console.log(`Department access granted: ${req.user.name} accessing ${staff.department} department data`);
    next();
  });
};

// Middleware to check if a specific grievance belongs to staff's department
const grievanceDepartmentAccess = (req, res, next) => {
  const grievanceId = req.params.id;
  
  if (!grievanceId) {
    return res.status(400).json({ message: 'Grievance ID required' });
  }
  
  // Admin users have access to all grievances
  if (req.user.role === 'admin') {
    return next();
  }
  
  // For staff, check if grievance belongs to their department
  if (req.user.role === 'staff' && req.staffDepartment) {
    const db = require('../models/db');
    
    db.get(`
      SELECT 
        g.id,
        s.department
      FROM grievances g
      JOIN students s ON g.student_id = s.user_id
      WHERE g.id = ?
    `, [grievanceId], (err, grievance) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking grievance access', error: err });
      }
      
      if (!grievance) {
        return res.status(404).json({ message: 'Grievance not found' });
      }
      
      if (grievance.department !== req.staffDepartment) {
        return res.status(403).json({ 
          message: 'Access denied. This grievance belongs to a different department.',
          yourDepartment: req.staffDepartment,
          grievanceDepartment: grievance.department
        });
      }
      
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  departmentAccessMiddleware,
  grievanceDepartmentAccess
};
