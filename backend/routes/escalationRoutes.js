const express = require('express');
const router = express.Router();
const escalationController = require('../controllers/escalationController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply authentication and admin middleware to all escalation routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Escalation rule management
router.post('/rules', escalationController.createEscalationRule);
router.get('/rules', escalationController.getActiveRules);
router.put('/rules/:ruleId/status', escalationController.toggleRuleStatus);

// Escalation actions
router.post('/run', escalationController.runEscalationCheck);
router.get('/history', escalationController.getAllEscalationHistory);
router.get('/history/:grievanceId', escalationController.getEscalationHistory);
router.get('/metrics', escalationController.getEscalationMetrics);
router.get('/stats', escalationController.getEscalationStats);

module.exports = router;
