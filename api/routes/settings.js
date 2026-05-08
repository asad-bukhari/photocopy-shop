const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../config/upload');
const {
  getShopSettings,
  updateShopSettings,
  uploadLogo,
  changePin
} = require('../controllers/settingsController');

/**
 * GET /api/photocopy/settings/shop
 * Get shop settings (public)
 */
router.get('/shop', getShopSettings);

/**
 * PUT /api/photocopy/settings/shop
 * Update shop settings (admin only)
 */
router.put('/shop',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Shop name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('email').optional().isEmail().withMessage('Invalid email format').normalizeEmail(),
    body('address').optional().trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    next();
  },
  updateShopSettings
);

/**
 * POST /api/photocopy/settings/logo
 * Upload shop logo (admin only)
 */
router.post('/logo',
  authenticate,
  requireAdmin,
  upload.single('logo'),
  uploadLogo
);

/**
 * POST /api/photocopy/settings/change-pin
 * Change admin PIN (admin only)
 */
router.post('/change-pin',
  authenticate,
  requireAdmin,
  [
    body('currentPin').trim().notEmpty().withMessage('Current PIN is required'),
    body('newPin').trim().isLength({ min: 4, max: 4 }).isNumeric().withMessage('New PIN must be 4 digits')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    next();
  },
  changePin
);

module.exports = router;
