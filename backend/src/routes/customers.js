const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/photocopy/customers
 * @desc    Get all customers
 * @access  Private
 */
router.get('/', authenticate, customerController.getCustomers);

/**
 * @route   GET /api/photocopy/customers/:id
 * @desc    Get single customer with bills
 * @access  Private
 */
router.get('/:id', authenticate, customerController.getCustomerById);

/**
 * @route   POST /api/photocopy/customers
 * @desc    Create new customer
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  customerController.validateCustomer,
  validate,
  customerController.createCustomer
);

/**
 * @route   PUT /api/photocopy/customers/:id
 * @desc    Update customer
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  customerController.validateCustomer,
  validate,
  customerController.updateCustomer
);

/**
 * @route   POST /api/photocopy/customers/:id/payments
 * @desc    Record customer payment
 * @access  Private
 */
router.post(
  '/:id/payments',
  authenticate,
  customerController.validatePayment,
  validate,
  customerController.recordPayment
);

module.exports = router;
