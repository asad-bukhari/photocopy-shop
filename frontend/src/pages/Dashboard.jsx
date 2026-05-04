import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { dashboardAPI } from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';

const Dashboard = () => {
  const { data, loading, error } = useApi(dashboardAPI.getStats);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const stats = data?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Today's overview</p>
        </div>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Profit Metrics Row */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profit Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(stats.todaySales)}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Cost of Goods Sold"
            value={formatCurrency(stats.costOfGoodsSold)}
            icon="📦"
            color="yellow"
          />
          <StatCard
            title="Gross Profit"
            value={formatCurrency(stats.grossProfit)}
            icon="📈"
            color="blue"
          />
          <StatCard
            title="Net Profit"
            value={formatCurrency(stats.netProfit)}
            icon="💎"
            color={stats.netProfit >= 0 ? "green" : "red"}
          />
        </div>
      </div>

      {/* Expense Breakdown Row */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Expenses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Operating Expenses"
            value={formatCurrency(stats.operatingExpenses)}
            icon="🏢"
            color="purple"
          />
          <StatCard
            title="Supply Expenses"
            value={formatCurrency(stats.supplyExpenses)}
            icon="📋"
            color="yellow"
          />
          <StatCard
            title="Staff Expenses"
            value={formatCurrency(stats.staffExpenses)}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Profit Margin"
            value={`${stats.profitMargin.toFixed(1)}%`}
            icon="📊"
            color={stats.profitMargin >= 0 ? "green" : "red"}
          />
        </div>
      </div>

      {/* Additional Stats Row */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Credit Sales"
            value={formatCurrency(stats.todayCredit)}
            icon="📝"
            color="yellow"
          />
          <StatCard
            title="Pending Credit"
            value={formatCurrency(stats.totalCreditBalance)}
            icon="⚠️"
            color="red"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockCount}
            icon="📦"
            color="purple"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/sales"
          className="card hover:shadow-lg transition-shadow flex items-center gap-4 cursor-pointer"
        >
          <div className="bg-green-100 p-3 rounded-full">
            <span className="text-2xl">💰</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">New Sale</h3>
            <p className="text-sm text-gray-600">Create a new bill</p>
          </div>
        </Link>

        <Link
          to="/customers"
          className="card hover:shadow-lg transition-shadow flex items-center gap-4 cursor-pointer"
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Customers</h3>
            <p className="text-sm text-gray-600">Manage customers</p>
          </div>
        </Link>

        <Link
          to="/reports"
          className="card hover:shadow-lg transition-shadow flex items-center gap-4 cursor-pointer"
        >
          <div className="bg-purple-100 p-3 rounded-full">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Reports</h3>
            <p className="text-sm text-gray-600">View reports</p>
          </div>
        </Link>
      </div>

      {/* Recent Bills */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bills</h3>
        {stats.recentBills && stats.recentBills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {bill.billNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {bill.isGuest ? 'Guest' : bill.customer?.name || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(Number(bill.total))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`badge ${bill.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {bill.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(bill.billDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No bills yet today</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
