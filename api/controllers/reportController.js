const { prisma } = require('../config/database');

/**
 * Get daily sales report
 */
exports.getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date ? new Date(date) : new Date();

    // Set start and end of day
    const startDate = new Date(reportDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(reportDate);
    endDate.setHours(23, 59, 59, 999);

    // Get bills for the day
    const bills = await prisma.bill.findMany({
      where: {
        billDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        billDate: 'asc'
      }
    });

    // Calculate summaries
    const summary = {
      totalSales: 0,
      cashSales: 0,
      onlineSales: 0,
      creditSales: 0,
      billCount: bills.length,
      guestBills: 0,
      customerBills: 0
    };

    const salesByCategory = {};
    const salesByPayment = {
      cash: 0,
      online: 0,
      credit: 0
    };

    bills.forEach(bill => {
      const total = Number(bill.total);
      summary.totalSales += total;

      // By payment method
      if (bill.paymentStatus === 'credit') {
        summary.creditSales += total;
        salesByPayment.credit += total;
      } else if (bill.paymentMethod === 'cash') {
        summary.cashSales += total;
        salesByPayment.cash += total;
      } else if (bill.paymentMethod === 'online') {
        summary.onlineSales += total;
        salesByPayment.online += total;
      }

      // By customer type
      if (bill.isGuest) {
        summary.guestBills++;
      } else {
        summary.customerBills++;
      }

      // By category
      bill.items.forEach(item => {
        if (!salesByCategory[item.category]) {
          salesByCategory[item.category] = {
            quantity: 0,
            amount: 0
          };
        }
        salesByCategory[item.category].quantity += Number(item.quantity);
        salesByCategory[item.category].amount += Number(item.subtotal);
      });
    });

    res.json({
      success: true,
      data: {
        date: startDate.toISOString().split('T')[0],
        summary,
        salesByCategory,
        salesByPayment,
        bills
      }
    });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily report'
    });
  }
};

/**
 * Get sales report for date range
 */
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bills = await prisma.bill.findMany({
      where: {
        billDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        billDate: 'asc'
      }
    });

    // Group sales by period
    const salesByPeriod = {};

    bills.forEach(bill => {
      const date = new Date(bill.billDate);
      let key;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = date.toISOString().slice(0, 7);
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!salesByPeriod[key]) {
        salesByPeriod[key] = {
          date: key,
          totalSales: 0,
          cashSales: 0,
          onlineSales: 0,
          creditSales: 0,
          billCount: 0
        };
      }

      const total = Number(bill.total);
      salesByPeriod[key].totalSales += total;
      salesByPeriod[key].billCount++;

      if (bill.paymentStatus === 'credit') {
        salesByPeriod[key].creditSales += total;
      } else if (bill.paymentMethod === 'cash') {
        salesByPeriod[key].cashSales += total;
      } else if (bill.paymentMethod === 'online') {
        salesByPeriod[key].onlineSales += total;
      }
    });

    res.json({
      success: true,
      data: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        salesByPeriod: Object.values(salesByPeriod)
      }
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report'
    });
  }
};

/**
 * Get inventory status report
 */
exports.getInventoryReport = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        category: 'asc'
      }
    });

    // Calculate inventory value
    const totalValue = products.reduce((sum, product) => {
      const cost = Number(product.cost) || 0;
      return sum + (cost * product.stock);
    }, 0);

    // Low stock items
    const lowStockItems = products.filter(
      p => p.stock <= p.lowStockThreshold
    );

    // Out of stock items
    const outOfStockItems = products.filter(p => p.stock === 0);

    // Group by category
    const byCategory = {};
    products.forEach(product => {
      if (!byCategory[product.category]) {
        byCategory[product.category] = {
          itemCount: 0,
          totalStock: 0,
          totalValue: 0
        };
      }
      byCategory[product.category].itemCount++;
      byCategory[product.category].totalStock += product.stock;
      byCategory[product.category].totalValue += Number(product.cost || 0) * product.stock;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts: products.length,
          totalValue,
          lowStockCount: lowStockItems.length,
          outOfStockCount: outOfStockItems.length
        },
        lowStockItems,
        outOfStockItems,
        byCategory
      }
    });
  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report'
    });
  }
};

/**
 * Get Profit & Loss statement for date range
 */
exports.getProfitLossStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get bills for the period with items
    const bills = await prisma.bill.findMany({
      where: {
        billDate: {
          gte: start,
          lte: end
        }
      },
      include: {
        items: true
      },
      orderBy: {
        billDate: 'asc'
      }
    });

    // Calculate revenue and COGS
    let totalRevenue = 0;
    let totalCOGS = 0;
    const salesByCategory = {};

    bills.forEach(bill => {
      totalRevenue += Number(bill.total);

      bill.items.forEach(item => {
        totalCOGS += Number(item.costTotal || 0);

        // Track sales by category
        if (!salesByCategory[item.category]) {
          salesByCategory[item.category] = {
            revenue: 0,
            cogs: 0,
            quantity: 0
          };
        }
        salesByCategory[item.category].revenue += Number(item.subtotal);
        salesByCategory[item.category].cogs += Number(item.costTotal || 0);
        salesByCategory[item.category].quantity += Number(item.quantity);
      });
    });

    // Get expenses by category for the period
    const expenseBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: {
        expenseDate: {
          gte: start,
          lte: end
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
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Get detailed expenses list
    const detailedExpenses = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        expenseDate: 'desc'
      }
    });

    // Calculate category profit margins
    const categoryProfitability = {};
    Object.keys(salesByCategory).forEach(category => {
      const catRevenue = salesByCategory[category].revenue;
      const catCOGS = salesByCategory[category].cogs;
      const catGrossProfit = catRevenue - catCOGS;
      const catMargin = catRevenue > 0 ? (catGrossProfit / catRevenue) * 100 : 0;

      categoryProfitability[category] = {
        revenue: catRevenue,
        cogs: catCOGS,
        grossProfit: catGrossProfit,
        profitMargin: Math.round(catMargin * 100) / 100,
        quantity: salesByCategory[category].quantity
      };
    });

    res.json({
      success: true,
      data: {
        period: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0]
        },
        summary: {
          totalRevenue,
          totalCOGS,
          grossProfit,
          operatingExpenses,
          supplyExpenses,
          staffExpenses,
          totalExpenses,
          netProfit,
          profitMargin: Math.round(profitMargin * 100) / 100,
          billCount: bills.length
        },
        categoryProfitability,
        detailedExpenses
      }
    });
  } catch (error) {
    console.error('Profit/Loss report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate profit/loss statement'
    });
  }
};
