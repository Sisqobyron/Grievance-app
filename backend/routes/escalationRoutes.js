const express = require('express');
const router = express.Router();
const escalationController = require('../controllers/escalationController');

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
