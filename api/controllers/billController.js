const { prisma } = require('../config/database');
const { body, validationResult } = require('express-validator');

/**
 * Generate unique bill number
 */
async function generateBillNumber() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  const lastBill = await prisma.bill.findFirst({
    where: {
      billNumber: {
        startsWith: `BILL-${dateStr}`
      }
    },
    orderBy: {
      billNumber: 'desc'
    }
  });

  let sequence = 1;
  if (lastBill) {
    const lastSequence = parseInt(lastBill.billNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `BILL-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Get all bills with optional filters
 */
exports.getBills = async (req, res) => {
  try {
    const { customerId, paymentStatus, startDate, endDate, limit = 50 } = req.query;

    const where = {};

    if (customerId) {
      where.customerId = parseInt(customerId);
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (startDate || endDate) {
      where.billDate = {};
      if (startDate) {
        where.billDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.billDate.lte = new Date(endDate);
      }
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        items: true
      },
      orderBy: {
        billDate: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: { bills }
    });
  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    });
  }
};

/**
 * Get single bill by ID
 */
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true
          }
        },
        items: true,
        payments: true
      }
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    res.json({
      success: true,
      data: { bill }
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill'
    });
  }
};

/**
 * Create new bill with items
 */
exports.createBill = async (req, res) => {
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
      isGuest,
      customerId,
      items,
      tax,
      discount,
      payments,
      notes
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bill must contain at least one item'
      });
    }

    // Validate customer for non-guest bills
    if (!isGuest && !customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer is required for non-guest bills'
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate totals
      let subtotal = 0;
      const billItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const quantity = parseFloat(item.quantity);
        const itemSubtotal = quantity * Number(product.price);
        subtotal += itemSubtotal;

        // Capture cost at time of sale
        const unitCost = Number(product.cost) || 0;
        const costTotal = unitCost * quantity;

        billItems.push({
          productId: item.productId,
          productName: product.name,
          category: product.category?.name || 'Uncategorized',
          quantity: quantity,
          unitPrice: Number(product.price),
          subtotal: itemSubtotal,
          unitCost: unitCost,
          costTotal: costTotal
        });

        // Update stock for non-service items
        if (!product.isService) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: Math.floor(quantity)
              }
            }
          });
        }
      }

      const total = subtotal + (tax || 0);
      let discountAmount = discount || 0;

      // Validate discount doesn't exceed total
      if (discountAmount > total) {
        return res.status(400).json({
          success: false,
          message: `Discount (₹${discountAmount}) cannot exceed total (₹${total})`
        });
      }

      const totalAfterDiscount = total - discountAmount;

      // Calculate total paid from payments array
      const totalPaid = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

      // Determine payment status automatically
      let paymentStatus;
      if (totalPaid >= totalAfterDiscount) {
        paymentStatus = 'paid';
      } else if (totalPaid === 0) {
        paymentStatus = 'credit';
      } else {
        paymentStatus = 'partial';
      }

      // Validate guest customer must pay full amount
      if (isGuest && totalPaid < totalAfterDiscount) {
        throw new Error('Guest customers must pay the full amount');
      }

      // Validate payments don't exceed total
      if (totalPaid > totalAfterDiscount) {
        throw new Error(`Total payments (₹${totalPaid}) cannot exceed bill total (₹${totalAfterDiscount})`);
      }

      // Generate bill number
      const billNumber = await generateBillNumber();

      // Prepare payment records
      const paymentRecords = payments?.map(p => ({
        customerId: customerId ? parseInt(customerId) : null,
        amount: parseFloat(p.amount),
        paymentMethod: p.paymentMethod
      })) || [];

      // Create bill
      const bill = await tx.bill.create({
        data: {
          billNumber,
          billDate: new Date(),
          isGuest: isGuest || false,
          customerId: customerId ? parseInt(customerId) : null,
          subtotal,
          tax: tax || 0,
          discount: discount || 0,
          total: totalAfterDiscount,
          paymentStatus,
          paymentMethod: paymentRecords.length > 0 ? paymentRecords[0].paymentMethod : 'cash',
          notes,
          items: {
            create: billItems
          },
          payments: {
            create: paymentRecords
          }
        },
        include: {
          items: true,
          payments: true
        }
      });

      // Update customer credit balance for credit or partial payments
      if (!isGuest && paymentStatus !== 'paid') {
        const creditAmount = totalAfterDiscount - totalPaid;
        await tx.customer.update({
          where: { id: parseInt(customerId) },
          data: {
            creditBalance: {
              increment: creditAmount
            },
            unpaidBills: {
              increment: 1
            }
          }
        });
      }

      return bill;
    });

    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: { bill: result }
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create bill'
    });
  }
};

/**
 * Delete bill (admin only)
 */
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    const bill = await prisma.bill.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: true
      }
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Start transaction to restore stock
    await prisma.$transaction(async (tx) => {
      // Restore stock for non-service items
      for (const item of bill.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        });

        if (product && !product.isService) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: Math.floor(Number(item.quantity))
              }
            }
          });
        }
      }

      // Delete bill
      await tx.bill.delete({
        where: { id: parseInt(id) }
      });
    });

    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill'
    });
  }
};

/**
 * Validation rules
 */
exports.validateBill = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isInt()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('payments')
    .optional()
    .isArray()
    .withMessage('Payments must be an array'),
  body('payments.*.amount')
    .isFloat({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  body('payments.*.paymentMethod')
    .isIn(['cash', 'online'])
    .withMessage('Payment method must be cash or online')
];
