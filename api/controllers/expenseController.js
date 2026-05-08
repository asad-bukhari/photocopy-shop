const { prisma } = require('../config/database');
const { body, validationResult } = require('express-validator');

/**
 * Get all expenses with optional filters
 */
exports.getExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 100 } = req.query;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        where.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.expenseDate.lte = new Date(endDate);
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        expenseDate: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: { expenses }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses'
    });
  }
};

/**
 * Get single expense by ID
 */
exports.getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(id) }
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense'
    });
  }
};

/**
 * Create new expense
 */
exports.createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      category,
      title,
      description,
      amount,
      expenseDate,
      paymentMethod,
      referenceNumber,
      notes
    } = req.body;

    // Validate category
    const validCategories = ['OPERATING', 'SUPPLIES', 'STAFF'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        title,
        description,
        amount: parseFloat(amount),
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        paymentMethod,
        referenceNumber,
        notes
      }
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense'
    });
  }
};

/**
 * Update expense
 */
exports.updateExpense = async (req, res) => {
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
      category,
      title,
      description,
      amount,
      expenseDate,
      paymentMethod,
      referenceNumber,
      notes
    } = req.body;

    // Validate category if provided
    if (category) {
      const validCategories = ['OPERATING', 'SUPPLIES', 'STAFF'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
    }

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        category,
        title,
        description,
        amount: amount ? parseFloat(amount) : undefined,
        expenseDate: expenseDate ? new Date(expenseDate) : undefined,
        paymentMethod,
        referenceNumber,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense'
    });
  }
};

/**
 * Delete expense
 */
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.expense.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense'
    });
  }
};

/**
 * Validation rules
 */
exports.validateExpense = [
  body('category')
    .isIn(['OPERATING', 'SUPPLIES', 'STAFF'])
    .withMessage('Valid category is required'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
];

exports.validateExpenseUpdate = [
  body('category')
    .optional()
    .isIn(['OPERATING', 'SUPPLIES', 'STAFF'])
    .withMessage('Category must be OPERATING, SUPPLIES, or STAFF'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0')
];
