const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const stockController = require('../controllers/stockController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/photocopy/products
 * @desc    Get all products
 * @access  Private
 */
router.get('/', authenticate, productController.getProducts);

/**
 * @route   GET /api/photocopy/products/:id
 * @desc    Get single product
 * @access  Private
 */
router.get('/:id', authenticate, productController.getProductById);

/**
 * @route   GET /api/photocopy/products/:id/price-history
 * @desc    Get price history for a product
 * @access  Admin
 */
router.get(
  '/:id/price-history',
  authenticate,
  requireAdmin,
  productController.getPriceHistory
);

/**
 * @route   POST /api/photocopy/products
 * @desc    Create new product
 * @access  Admin
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  productController.validateProduct,
  validate,
  productController.createProduct
);

/**
 * @route   PUT /api/photocopy/products/:id
 * @desc    Update product
 * @access  Admin
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  productController.validateProduct,
  validate,
  productController.updateProduct
);

/**
 * @route   PATCH /api/photocopy/products/:id/stock
 * @desc    Quick stock adjustment (+/- buttons)
 * @access  Admin
 */
router.patch(
  '/:id/stock',
  authenticate,
  requireAdmin,
  stockController.validateStockAdjustment,
  validate,
  stockController.quickAdjustStock
);

/**
 * @route   PUT /api/photocopy/products/:id/stock
 * @desc    Update stock (set to specific value)
 * @access  Admin
 */
router.put(
  '/:id/stock',
  authenticate,
  requireAdmin,
  stockController.validateStockUpdate,
  validate,
  stockController.updateStock
);

/**
 * @route   DELETE /api/photocopy/products/:id
 * @desc    Delete product
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;
