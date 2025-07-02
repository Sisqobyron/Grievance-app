const express = require('express');
const router = express.Router();
const deadlineController = require('../controllers/deadlineController');
const authMiddleware = require('../middleware/authMiddleware');

// Deadline management routes
router.get('/', deadlineController.getAllDeadlines);
router.get('/upcoming', authMiddleware, deadlineController.getGeneralUpcomingDeadlines);
router.post('/', deadlineController.createDeadline);
router.get('/grievance/:grievanceId', deadlineController.getGrievanceDeadlines);
router.get('/coordinator/:coordinatorId/upcoming', deadlineController.getUpcomingDeadlines);
router.get('/coordinator/:coordinatorId/overdue', deadlineController.getOverdueDeadlines);
router.get('/coordinator/:coordinatorId/stats', deadlineController.getDeadlineStats);
router.put('/:deadlineId/met', deadlineController.markDeadlineMet);
router.put('/:deadlineId/date', deadlineController.updateDeadlineDate);
router.put('/:deadlineId/extend', deadlineController.extendDeadline);
router.put('/:deadlineId/complete', deadlineController.markDeadlineMet);

// Reminder functionality
router.post('/coordinator/:coordinatorId/reminders', deadlineController.sendDeadlineReminders);

module.exports = router;
