const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinatorController');

// Coordinator management routes
router.post('/register', coordinatorController.registerCoordinator);
router.post('/', coordinatorController.createCoordinator);  // Alias for register
router.get('/', coordinatorController.getAllCoordinators);
router.get('/assignments', coordinatorController.getAllAssignments);
router.get('/:coordinatorId/dashboard', coordinatorController.getCoordinatorDashboard);
router.get('/:coordinatorId/workload', coordinatorController.getCoordinatorWorkload);
router.put('/:coordinatorId/status', coordinatorController.updateCoordinatorStatus);
router.put('/:coordinatorId', coordinatorController.updateCoordinator);
router.delete('/:coordinatorId', coordinatorController.deleteCoordinator);
router.get('/department/:department', coordinatorController.getCoordinatorsByDepartment);

// Grievance assignment routes
router.post('/assign', coordinatorController.assignGrievance);
router.post('/auto-assign', coordinatorController.autoAssignGrievance);

module.exports = router;
