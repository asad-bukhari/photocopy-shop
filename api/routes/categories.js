const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/photocopy/categories
 * @desc    Get all categories
 * @access  Private
 */
router.get('/', authenticate, categoryController.getCategories);

/**
 * @route   GET /api/photocopy/categories/:id
 * @desc    Get single category
 * @access  Private
 */
router.get('/:id', authenticate, categoryController.getCategoryById);

/**
 * @route   POST /api/photocopy/categories
 * @desc    Create new category
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  categoryController.validateCategory,
  validate,
  categoryController.createCategory
);

/**
 * @route   PUT /api/photocopy/categories/:id
 * @desc    Update category
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  categoryController.validateCategory,
  validate,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/photocopy/categories/:id
 * @desc    Delete category
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;
