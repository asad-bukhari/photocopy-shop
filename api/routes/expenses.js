const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all expenses with filters
router.get('/', expenseController.getExpenses);

// Get single expense by ID
router.get('/:id', expenseController.getExpenseById);

// Create new expense (admin only)
router.post('/', requireAdmin, expenseController.validateExpense, expenseController.createExpense);

// Update expense (admin only)
router.put('/:id', requireAdmin, expenseController.validateExpenseUpdate, expenseController.updateExpense);

// Delete expense (admin only)
router.delete('/:id', requireAdmin, expenseController.deleteExpense);

module.exports = router;
