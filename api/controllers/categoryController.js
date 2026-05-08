const { prisma } = require('../config/database');
const { body, validationResult } = require('express-validator');

/**
 * Get all categories
 */
exports.getCategories = async (req, res) => {
  try {
    const { includeProductCount } = req.query;

    let categories;

    if (includeProductCount === 'true') {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      // Format the response
      categories = categories.map(cat => ({
        ...cat,
        productCount: cat._count.products,
        _count: undefined
      }));
    } else {
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

/**
 * Get single category by ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        category: {
          ...category,
          productCount: category._count.products,
          _count: undefined
        }
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

/**
 * Create new category (admin only)
 */
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, description } = req.body;

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

/**
 * Update category (admin only)
 */
exports.updateCategory = async (req, res) => {
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
    const { name, description, isActive } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Handle record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

/**
 * Delete category (admin only)
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { reassignToCategoryId } = req.body;

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: parseInt(id) }
    });

    if (productCount > 0) {
      // If products exist, require reassignToCategoryId
      if (!reassignToCategoryId) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category with ${productCount} products. Please provide a category to reassign them to.`,
          requiresReassignment: true,
          productCount
        });
      }

      // Reassign products to new category
      await prisma.product.updateMany({
        where: { categoryId: parseInt(id) },
        data: { categoryId: parseInt(reassignToCategoryId) }
      });
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: productCount > 0
        ? `Category deleted and ${productCount} products reassigned successfully`
        : 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);

    // Handle foreign key constraint
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category. Please reassign products first.'
      });
    }

    // Handle record not found
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

/**
 * Validation rules
 */
exports.validateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
];
