const { prisma } = require('../config/database');

/**
 * Get dashboard statistics for today
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales (paid bills)
    const todaySalesResult = await prisma.bill.aggregate({
      where: {
        billDate: {
          gte: today,
          lt: tomorrow
        },
        paymentStatus: 'paid'
      },
      _sum: {
        total: true
      }
    });

    // Today's credit sales
    const todayCreditResult = await prisma.bill.aggregate({
      where: {
        billDate: {
          gte: today,
          lt: tomorrow
        },
        paymentStatus: 'credit'
      },
      _sum: {
        total: true
      }
    });

    // Total unpaid credit balance
    const totalCreditBalanceResult = await prisma.customer.aggregate({
      where: {
        isActive: true
      },
      _sum: {
        creditBalance: true
      }
    });

    // Low stock items count
    const lowStockCount = await prisma.product.count({
      where: {
        isActive: true,
        stock: {
          lte: prisma.product.fields.lowStockThreshold
        }
      }
    });

    // Today's bill count
    const todayBillCount = await prisma.bill.count({
      where: {
        billDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get today's bills with items for COGS calculation
    const todayBills = await prisma.bill.findMany({
      where: {
        billDate: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        items: true
      }
    });

    // Calculate revenue and COGS
    let todayRevenue = 0;
    let totalCOGS = 0;

    todayBills.forEach(bill => {
      if (bill.paymentStatus === 'paid') {
        todayRevenue += Number(bill.total);
      }
      bill.items.forEach(item => {
        totalCOGS += Number(item.costTotal || 0);
      });
    });

    // Get today's expenses by category
    const expenseBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        expenseDate: {
          gte: today,
          lt: tomorrow
        }
      },
      _sum: {
        amount: true
      }
    });

    // Calculate expenses by category
    let operatingExpenses = 0;
    let supplyExpenses = 0;
    let staffExpenses = 0;

    expenseBreakdown.forEach((expense) => {
      const amount = Number(expense._sum.amount) || 0;
      if (expense.category === 'OPERATING') {
        operatingExpenses += amount;
      } else if (expense.category === 'SUPPLIES') {
        supplyExpenses += amount;
      } else if (expense.category === 'STAFF') {
        staffExpenses += amount;
      }
    });

    const totalExpenses = operatingExpenses + supplyExpenses + staffExpenses;

    // Calculate profits
    const grossProfit = todayRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = todayRevenue > 0 ? (netProfit / todayRevenue) * 100 : 0;

    // Recent bills (last 5)
    const recentBills = await prisma.bill.findMany({
      take: 5,
      orderBy: {
        billDate: 'desc'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        todaySales: todayRevenue,
        todayCredit: Number(todayCreditResult._sum.total) || 0,
        totalCreditBalance: Number(totalCreditBalanceResult._sum.creditBalance) || 0,
        lowStockCount,
        todayBillCount,
        costOfGoodsSold: totalCOGS,
        operatingExpenses,
        supplyExpenses,
        staffExpenses,
        totalExpenses,
        grossProfit,
        netProfit,
        profitMargin: Math.round(profitMargin * 100) / 100,
        recentBills
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};
