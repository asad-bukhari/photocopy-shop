const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/photocopy/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/', authenticate, dashboardController.getDashboardStats);

module.exports = router;
