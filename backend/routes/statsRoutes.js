const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const statsController = require('../controllers/statsController');
const rateLimiter = require('../middleware/rateLimitMiddleware');

router.use(rateLimiter);
router.use(authMiddleware);

// Get grievance statistics
router.get('/', statsController.getGrievanceStats);

module.exports = router;
