const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   POST /api/photocopy/auth/login
 * @desc    Login with PIN
 * @access  Public
 */
router.post(
  '/login',
  authController.validateLogin,
  validate,
  authController.login
);

/**
 * @route   GET /api/photocopy/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
