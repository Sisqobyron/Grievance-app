const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { departmentAccessMiddleware, grievanceDepartmentAccess } = require('../middleware/departmentAccessMiddleware');

// Get grievances by department (for staff) - with proper authentication and department access
router.get('/department', authMiddleware, departmentAccessMiddleware, grievanceController.getGrievancesByDepartment);

// Alternative route for staff to get their department's grievances
router.get('/staff/department', authMiddleware, departmentAccessMiddleware, grievanceController.getGrievancesByDepartment);

// Get grievance statistics
router.get('/stats', grievanceController.getGrievanceStats);

// Get all grievances (for admin)
router.get('/', grievanceController.getAllGrievances);

// Submit a grievance (with optional file upload)
router.post('/submit', upload.single('attachment'), grievanceController.submitGrievance);

// Get a single grievance by ID - with department access control for staff
router.get('/:id', authMiddleware, grievanceDepartmentAccess, grievanceController.getGrievance);

// Get all grievances by student ID
router.get('/student/:student_id', grievanceController.getGrievancesByStudent);

// Update grievance status
router.put('/:id/status', grievanceController.updateStatus);

// Forward grievance to lecturer/department
router.post('/forward', authMiddleware, grievanceController.forwardGrievance);

module.exports = router;
