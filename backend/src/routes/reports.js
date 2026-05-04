const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/photocopy/reports/daily
 * @desc    Get daily sales report
 * @access  Private
 */
router.get('/daily', authenticate, reportController.getDailyReport);

/**
 * @route   GET /api/photocopy/reports/sales
 * @desc    Get sales report for date range
 * @access  Private
 */
router.get('/sales', authenticate, reportController.getSalesReport);

/**
 * @route   GET /api/photocopy/reports/inventory
 * @desc    Get inventory status report
 * @access  Private
 */
router.get('/inventory', authenticate, reportController.getInventoryReport);

/**
 * @route   GET /api/photocopy/reports/profit-loss
 * @desc    Get profit & loss statement for date range
 * @access  Private
 */
router.get('/profit-loss', authenticate, reportController.getProfitLossStatement);

module.exports = router;
