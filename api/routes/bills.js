const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/photocopy/bills
 * @desc    Get all bills
 * @access  Private
 */
router.get('/', authenticate, billController.getBills);

/**
 * @route   GET /api/photocopy/bills/:id
 * @desc    Get single bill
 * @access  Private
 */
router.get('/:id', authenticate, billController.getBillById);

/**
 * @route   POST /api/photocopy/bills
 * @desc    Create new bill
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  billController.validateBill,
  validate,
  billController.createBill
);

/**
 * @route   DELETE /api/photocopy/bills/:id
 * @desc    Delete bill
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, billController.deleteBill);

module.exports = router;
