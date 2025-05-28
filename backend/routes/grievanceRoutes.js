const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievanceController');
const upload = require('../middleware/uploadMiddleware');

// Get all grievances (for staff)
router.get('/', grievanceController.getAllGrievances);

// Submit a grievance (with optional file upload)
router.post('/submit', upload.single('attachment'), grievanceController.submitGrievance);

// Get a single grievance by ID
router.get('/:id', grievanceController.getGrievance);

// Get all grievances by student ID
router.get('/student/:student_id', grievanceController.getGrievancesByStudent);

// Update grievance status
router.put('/:id/status', grievanceController.updateStatus);

module.exports = router;
