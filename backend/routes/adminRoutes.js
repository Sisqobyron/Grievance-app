const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/users/role/:role', adminController.getUsersByRole);
router.get('/users/search', adminController.searchUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);

// Statistics routes
router.get('/stats/users', adminController.getUserStats);
router.get('/dashboard', adminController.getAdminDashboardData);

// Grievance management routes (admin can see all)
router.get('/grievances', adminController.getAllGrievances);
router.get('/grievances/category/:category', adminController.getGrievancesByCategory);
router.get('/grievances/status/:status', adminController.getGrievancesByStatus);
router.get('/grievances/department/:department', adminController.getGrievancesByDepartment);
router.get('/grievances/priority/:priority', adminController.getGrievancesByPriority);

module.exports = router;
