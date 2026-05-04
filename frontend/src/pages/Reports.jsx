import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { reportsAPI } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { getTodayDate } from '../utils/date';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  generateDailyReportPDF,
  generateSalesReportPDF,
  generateInventoryReportPDF
} from '../utils/pdfGenerator';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: dailyData, loading: dailyLoading, execute: executeDaily } = useApi(
    () => reportsAPI.getDaily({ date: selectedDate }),
    false
  );

  const { data: salesData, loading: salesLoading, execute: executeSales } = useApi(
    () => reportsAPI.getSales({ startDate, endDate }),
    false
  );

  const { data: inventoryData, loading: inventoryLoading, execute: executeInventory } = useApi(
    () => reportsAPI.getInventory(),
    false
  );

  const { data: profitLossData, loading: profitLossLoading, execute: executeProfitLoss } = useApi(
    () => reportsAPI.getProfitLoss({ startDate, endDate }),
    false
  );

  const handleGenerateReport = () => {
    if (reportType === 'daily') {
      executeDaily();
    } else if (reportType === 'sales') {
      executeSales();
    } else if (reportType === 'inventory') {
      executeInventory();
    } else if (reportType === 'profit-loss') {
      executeProfitLoss();
    }
  };

  const dailyReport = dailyData?.data;
  const salesReport = salesData?.data;
  const inventoryReport = inventoryData?.data;
  const profitLossReport = profitLossData?.data;

  const currentLoading = {
    daily: dailyLoading,
    sales: salesLoading,
    inventory: inventoryLoading,
    'profit-loss': profitLossLoading
  }[reportType];

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    try {
      if (reportType === 'daily' && dailyReport) {
        generateDailyReportPDF(dailyReport);
      } else if (reportType === 'sales' && salesReport) {
        generateSalesReportPDF(salesReport);
      } else if (reportType === 'inventory' && inventoryReport) {
        generateInventoryReportPDF(inventoryReport);
      }
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setTimeout(() => setPdfLoading(false), 500);
    }
  };

  const canDownloadPDF = () => {
    if (reportType === 'daily') return !!dailyReport;
    if (reportType === 'sales') return !!salesReport;
    if (reportType === 'inventory') return !!inventoryReport;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">View sales, inventory, and business reports</p>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2">
        {[
          { value: 'daily', label: 'Daily Report' },
          { value: 'sales', label: 'Sales Report' },
          { value: 'inventory', label: 'Inventory Report' },
          { value: 'profit-loss', label: 'Profit & Loss' }
        ].map((type) => (
          <button
            key={type.value}
            onClick={() => setReportType(type.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              reportType === type.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          {reportType === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />
            </div>
          )}

          {(reportType === 'sales' || reportType === 'profit-loss') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={currentLoading}
            className="btn btn-primary"
          >
            {currentLoading ? 'Loading...' : 'Generate Report'}
          </button>

          {canDownloadPDF() && (
            <Button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              variant="success"
              className="flex items-center gap-2"
            >
              {pdfLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Daily Report */}
      {reportType === 'daily' && dailyReport && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(dailyReport.summary.totalSales)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Cash Sales</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(dailyReport.summary.cashSales)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Online Sales</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(dailyReport.summary.onlineSales)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Credit Sales</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {formatCurrency(dailyReport.summary.creditSales)}
              </p>
            </Card>
          </div>

          {/* Sales by Category */}
          <Card title="Sales by Category">
            <div className="space-y-2">
              {Object.entries(dailyReport.salesByCategory).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{category}</p>
                    <p className="text-sm text-gray-600">{data.quantity} items</p>
                  </div>
                  <p className="font-bold text-gray-900">{formatCurrency(data.amount)}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Bills List */}
          <Card title="Bills">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyReport.bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {bill.billNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {bill.isGuest ? 'Guest' : bill.customer?.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(Number(bill.total))}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`badge ${
                          bill.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {bill.paymentMethod || bill.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Sales Report */}
      {reportType === 'sales' && salesReport && (
        <div className="space-y-6">
          <Card title="Sales Over Time">
            <div className="space-y-2">
              {salesReport.salesByPeriod.map((period) => (
                <div key={period.date} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{period.date}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(period.totalSales)}
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Cash</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(period.cashSales)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Online</p>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(period.onlineSales)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Credit</p>
                      <p className="font-medium text-yellow-600">
                        {formatCurrency(period.creditSales)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bills</p>
                      <p className="font-medium text-gray-900">{period.billCount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Inventory Report */}
      {reportType === 'inventory' && inventoryReport && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {inventoryReport.summary.totalProducts}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(inventoryReport.summary.totalValue)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {inventoryReport.summary.lowStockCount}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {inventoryReport.summary.outOfStockCount}
              </p>
            </Card>
          </div>

          {/* Low Stock Items */}
          {inventoryReport.lowStockItems.length > 0 && (
            <Card title="Low Stock Items">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventoryReport.lowStockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
                        <td className="px-4 py-3 text-sm font-medium text-yellow-600">
                          {item.stock}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.lowStockThreshold}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Category Breakdown */}
          <Card title="Inventory by Category">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(inventoryReport.byCategory).map(([category, data]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{category}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium">{data.itemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Stock:</span>
                      <span className="font-medium">{data.totalStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium">{formatCurrency(data.totalValue)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Profit & Loss Report */}
      {reportType === 'profit-loss' && profitLossReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(profitLossReport.summary.totalRevenue)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Cost of Goods Sold</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {formatCurrency(profitLossReport.summary.totalCOGS)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Gross Profit</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {formatCurrency(profitLossReport.summary.grossProfit)}
              </p>
            </Card>
            <Card>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold mt-2 ${
                profitLossReport.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(profitLossReport.summary.netProfit)}
              </p>
            </Card>
          </div>

          {/* Gross Profit Analysis */}
          <Card title="Gross Profit Analysis">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800">Gross Profit Margin</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {profitLossReport.summary.totalRevenue > 0
                      ? ((profitLossReport.summary.grossProfit / profitLossReport.summary.totalRevenue) * 100).toFixed(1)
                      : '0'}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-800">Revenue: {formatCurrency(profitLossReport.summary.totalRevenue)}</p>
                  <p className="text-sm text-blue-800">COGS: {formatCurrency(profitLossReport.summary.totalCOGS)}</p>
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-3">Profitability by Category</h4>
            <div className="space-y-2">
              {Object.entries(profitLossReport.categoryProfitability).map(([category, data]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{category}</p>
                    <p className={`text-lg font-bold ${
                      data.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-medium text-gray-900">{formatCurrency(data.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">COGS</p>
                      <p className="font-medium text-gray-900">{formatCurrency(data.cogs)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Gross Profit</p>
                      <p className={`font-medium ${
                        data.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(data.grossProfit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-medium text-gray-900">{data.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Expense Breakdown */}
          <Card title="Expense Breakdown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">Operating Expenses</p>
                <p className="text-xl font-bold text-purple-900 mt-1">
                  {formatCurrency(profitLossReport.summary.operatingExpenses)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">Supply Expenses</p>
                <p className="text-xl font-bold text-yellow-900 mt-1">
                  {formatCurrency(profitLossReport.summary.supplyExpenses)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">Staff Expenses</p>
                <p className="text-xl font-bold text-blue-900 mt-1">
                  {formatCurrency(profitLossReport.summary.staffExpenses)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(profitLossReport.summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            {profitLossReport.detailedExpenses.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Detailed Expenses</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {profitLossReport.detailedExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              expense.category === 'OPERATING' ? 'bg-purple-100 text-purple-800' :
                              expense.category === 'SUPPLIES' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{expense.title}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatCurrency(expense.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>

          {/* Net Profit Summary */}
          <Card title="Net Profit Summary">
            <div className={`p-6 rounded-lg ${
              profitLossReport.summary.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${
                    profitLossReport.summary.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Net Profit for Period
                  </p>
                  <p className={`text-4xl font-bold mt-2 ${
                    profitLossReport.summary.netProfit >= 0 ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {formatCurrency(profitLossReport.summary.netProfit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${
                    profitLossReport.summary.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Profit Margin: {profitLossReport.summary.profitMargin.toFixed(1)}%
                  </p>
                  <p className={`text-sm mt-2 ${
                    profitLossReport.summary.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {profitLossReport.summary.billCount} bills in period
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Gross Profit:</span>
                <span className="font-bold">{formatCurrency(profitLossReport.summary.grossProfit)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span className="text-gray-600">Total Expenses:</span>
                <span className="font-bold">{formatCurrency(profitLossReport.summary.totalExpenses)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
