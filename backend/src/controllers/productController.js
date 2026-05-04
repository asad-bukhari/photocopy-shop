const { prisma } = require('../config/database');
const { body, validationResult } = require('express-validator');

/**
 * Get all products with optional category filter
 */
exports.getProducts = async (req, res) => {
  try {
    console.log('getProducts called, query:', req.query);
    const { category, isActive } = req.query;

    const where = {};
    if (category) {
      where.categoryId = parseInt(category);
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    console.log('Where clause:', where);

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log('Found products:', products.length);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get products error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

/**
 * Get single product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

/**
 * Create new product (admin only)
 */
exports.createProduct = async (req, res) => {
  try {
    console.log('createProduct called, body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      name,
      categoryId,
      isService,
      price,
      cost,
      stock,
      lowStockThreshold
    } = req.body;

    console.log('Creating product with data:', { name, categoryId, isService, price });

    const product = await prisma.product.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        isService: isService || false,
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 10
      },
      include: {
        category: true
      }
    });

    console.log('Product created successfully:', product);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

/**
 * Update product (admin only)
 */
exports.updateProduct = async (req, res) => {
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
    const {
      name,
      categoryId,
      isService,
      price,
      cost,
      stock,
      lowStockThreshold,
      isActive,
      changeReason
    } = req.body;

    // Get existing product to check for price changes
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(isService !== undefined && { isService }),
        ...(price && { price: parseFloat(price) }),
        ...(cost !== undefined && { cost: cost ? parseFloat(cost) : null }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        category: true
      }
    });

    // If price changed, create PriceHistory entry
    if (price && parseFloat(price) !== existingProduct.price) {
      await prisma.priceHistory.create({
        data: {
          productId: parseInt(id),
          oldPrice: existingProduct.price,
          newPrice: parseFloat(price),
          changeReason: changeReason || 'Manual update',
          changedBy: req.user.id
        }
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

/**
 * Delete product (admin only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product has been used in any bills
    const billItemCount = await prisma.billItem.count({
      where: { productId: parseInt(id) }
    });

    if (billItemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete product. It has been used in ${billItemCount} bill(s). Please deactivate it instead.`
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);

    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product. It has been used in bills. Please deactivate it instead.'
      });
    }

    // Handle record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

/**
 * Get price history for a product (admin only)
 */
exports.getPriceHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    const priceHistory = await prisma.priceHistory.findMany({
      where: { productId: parseInt(id) },
      include: {
        changedByUser: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: { priceHistory }
    });
  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price history'
    });
  }
};

/**
 * Validation rules
 */
exports.validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isInt({ min: 1 })
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];
