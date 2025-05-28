const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const statsController = require('../controllers/statsController');

router.use(authMiddleware);

// Get grievance statistics
router.get('/', statsController.getGrievanceStats);

module.exports = router;
