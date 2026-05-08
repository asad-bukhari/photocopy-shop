const { prisma } = require('../config/database');
const { body, validationResult } = require('express-validator');

/**
 * Update stock for a product (admin only)
 */
exports.updateStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { stock, reason } = req.body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Don't allow stock updates for services
    if (product.isService) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update stock for services'
      });
    }

    // Update stock
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        stock: parseInt(stock)
      }
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock'
    });
  }
};

/**
 * Quick stock adjustment (+/- buttons) (admin only)
 */
exports.quickAdjustStock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { adjustment, reason } = req.body;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Don't allow stock updates for services
    if (product.isService) {
      return res.status(400).json({
        success: false,
        message: 'Cannot adjust stock for services'
      });
    }

    // Calculate new stock level
    const newStock = product.stock + parseInt(adjustment);

    // Validate stock won't go negative
    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    // Update stock
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        stock: newStock
      }
    });

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Quick adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to adjust stock'
    });
  }
};

/**
 * Validation rules
 */
exports.validateStockUpdate = [
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

exports.validateStockAdjustment = [
  body('adjustment')
    .isInt()
    .withMessage('Adjustment must be an integer')
];
