const { prisma } = require('../config/database');
const { body, validationResult } = require('express-validator');

/**
 * Get all customers with optional search
 */
exports.getCustomers = async (req, res) => {
  try {
    const { search, isActive } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: { customers }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
};

/**
 * Calculate aging buckets for customer credit
 */
const calculateAgingBuckets = (bills) => {
  const now = new Date();
  const buckets = {
    current: { amount: 0, count: 0 },      // 0-30 days
    overdue: { amount: 0, count: 0 },      // 31-60 days
    critical: { amount: 0, count: 0 }      // 60+ days
  };

  bills.forEach(bill => {
    if (bill.paymentStatus !== 'paid') {
      const billDate = new Date(bill.billDate);
      const ageInDays = Math.floor((now - billDate) / (1000 * 60 * 60 * 24));
      const amount = Number(bill.total);

      if (ageInDays <= 30) {
        buckets.current.amount += amount;
        buckets.current.count += 1;
      } else if (ageInDays <= 60) {
        buckets.overdue.amount += amount;
        buckets.overdue.count += 1;
      } else {
        buckets.critical.amount += amount;
        buckets.critical.count += 1;
      }
    }
  });

  return buckets;
};

/**
 * Build transaction timeline with running balance
 */
const buildTransactionTimeline = (bills, payments) => {
  const transactions = [];
  let runningBalance = 0;

  // Add credit bills
  bills.forEach(bill => {
    if (bill.paymentStatus === 'credit') {
      const billDate = new Date(bill.billDate);
      const now = new Date();
      const ageInDays = Math.floor((now - billDate) / (1000 * 60 * 60 * 24));

      runningBalance += Number(bill.total);

      transactions.push({
        id: `bill_${bill.id}`,
        type: 'CREDIT_GIVEN',
        date: bill.billDate,
        billNumber: bill.billNumber,
        amount: Number(bill.total),
        runningBalance: runningBalance,
        age: ageInDays,
        paymentMethod: null,
        notes: null,
        allocatedTo: []
      });
    }
  });

  // Sort transactions by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Recalculate running balance in chronological order
  runningBalance = 0;
  transactions.forEach(t => {
    runningBalance += t.amount;
    t.runningBalance = runningBalance;
  });

  // Add payments
  payments.forEach(payment => {
    // Find bills this payment was allocated to
    const allocatedBills = payment.billId
      ? [bills.find(b => b.id === payment.billId)?.billNumber].filter(Boolean)
      : [];

    // Decrease running balance from this point forward
    runningBalance -= Number(payment.amount);

    transactions.push({
      id: `payment_${payment.id}`,
      type: 'PAYMENT_RECEIVED',
      date: payment.createdAt,
      billNumber: null,
      amount: -Number(payment.amount),
      runningBalance: runningBalance,
      age: null,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes,
      allocatedTo: allocatedBills
    });
  });

  // Sort all transactions by date (most recent first for display)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Recalculate running balance in reverse (most recent first)
  // Start with current customer credit balance
  let balanceFromEnd = 0;
  transactions.forEach(t => {
    if (t.type === 'CREDIT_GIVEN') {
      balanceFromEnd += t.amount;
    } else {
      balanceFromEnd -= t.amount;
    }
    t.runningBalance = balanceFromEnd;
  });

  return transactions;
};

/**
 * Get single customer by ID with bills, aging analysis, and transaction timeline
 */
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        bills: {
          orderBy: {
            billDate: 'desc'
          }
          // Remove take limit to get all bills for complete history
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
          // Remove take limit to get all payments for complete history
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Calculate aging buckets
    const agingSummary = calculateAgingBuckets(customer.bills);

    // Build transaction timeline
    const creditTransactions = buildTransactionTimeline(customer.bills, customer.payments);

    // Enhance customer object
    const enhancedCustomer = {
      ...customer,
      agingSummary,
      creditTransactions
    };

    res.json({
      success: true,
      data: { customer: enhancedCustomer }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer'
    });
  }
};

/**
 * Create new customer
 */
exports.createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, phone, email, address } = req.body;

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        address
      }
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Create customer error:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create customer'
    });
  }
};

/**
 * Update customer
 */
exports.updateCustomer = async (req, res) => {
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
    const { name, phone, email, address, isActive } = req.body;

    const customer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer'
    });
  }
};

/**
 * Record customer payment with FIFO allocation
 */
exports.recordPayment = async (req, res) => {
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
    const { amount, paymentMethod, notes } = req.body;

    // Get customer with unpaid credit bills
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
      include: {
        bills: {
          where: {
            paymentStatus: 'credit'
          },
          orderBy: {
            billDate: 'asc' // Oldest first for FIFO
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    let remainingPayment = parseFloat(amount);
    const allocatedBills = [];
    const paymentRecords = [];

    // FIFO Allocation: Pay off oldest bills first
    for (const bill of customer.bills) {
      if (remainingPayment <= 0) break;

      const billTotal = Number(bill.total);
      const allocationAmount = Math.min(remainingPayment, billTotal);

      // Create payment record linked to this bill
      const payment = await prisma.payment.create({
        data: {
          customerId: parseInt(id),
          amount: allocationAmount,
          paymentMethod,
          billId: bill.id,
          notes: notes || `Payment towards ${bill.billNumber}`
        }
      });

      paymentRecords.push(payment);
      allocatedBills.push({
        billId: bill.id,
        billNumber: bill.billNumber,
        amount: allocationAmount
      });

      // If fully paid, update bill status
      if (allocationAmount >= billTotal) {
        await prisma.bill.update({
          where: { id: bill.id },
          data: { paymentStatus: 'paid' }
        });
      }

      remainingPayment -= allocationAmount;
    }

    // Calculate new credit balance and unpaid bills count
    const totalPayment = parseFloat(amount) - remainingPayment;
    const newCreditBalance = Math.max(0, Number(customer.creditBalance) - totalPayment);

    // Recalculate unpaid bills count
    const unpaidBillsCount = await prisma.bill.count({
      where: {
        customerId: parseInt(id),
        paymentStatus: 'credit'
      }
    });

    // Update customer
    await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        creditBalance: newCreditBalance,
        unpaidBills: unpaidBillsCount
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment: {
          amount: totalPayment,
          paymentMethod,
          allocatedTo: allocatedBills.map(b => b.billNumber),
          allocatedCount: allocatedBills.length,
          allocations: allocatedBills
        }
      }
    });
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment'
    });
  }
};

/**
 * Validation rules
 */
exports.validateCustomer = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
];

exports.validatePayment = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'online', 'bank_transfer'])
    .withMessage('Invalid payment method')
];
