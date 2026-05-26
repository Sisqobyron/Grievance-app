const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const rateLimiter = require('../middleware/rateLimitMiddleware');
const { departmentAccessMiddleware, grievanceDepartmentAccess } = require('../middleware/departmentAccessMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Get grievances by department (for staff) - with proper authentication and department access
router.get('/department', rateLimiter, authMiddleware, departmentAccessMiddleware, grievanceController.getGrievancesByDepartment);

// Alternative route for staff to get their department's grievances
router.get('/staff/department', rateLimiter, authMiddleware, departmentAccessMiddleware, grievanceController.getGrievancesByDepartment);

// Get grievance statistics
router.get('/stats', rateLimiter, authMiddleware, requireRole('admin', 'staff'), grievanceController.getGrievanceStats);

// Get all grievances (for admin)
router.get('/', rateLimiter, authMiddleware, requireRole('admin'), grievanceController.getAllGrievances);

// Submit a grievance (with optional file upload)
router.post('/submit', rateLimiter, authMiddleware, requireRole('student'), upload.single('attachment'), grievanceController.submitGrievance);

// Get a single grievance by ID - with department access control for staff
router.get('/:id', rateLimiter, authMiddleware, grievanceDepartmentAccess, grievanceController.getGrievance);

// Get all grievances by student ID
router.get('/student/:student_id', rateLimiter, authMiddleware, grievanceController.getGrievancesByStudent);

// Update grievance status
router.put('/:id/status', rateLimiter, authMiddleware, requireRole('admin', 'staff'), grievanceDepartmentAccess, grievanceController.updateStatus);

// Forward grievance to lecturer/department
router.post('/forward', rateLimiter, authMiddleware, requireRole('admin', 'staff'), grievanceController.forwardGrievance);

module.exports = router;
