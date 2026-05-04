import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { customersAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';

const CustomerCreditModal = ({ customerId, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customersAPI.getById(customerId);
      const customerData = response.data.data.customer;
      console.log('📊 Customer Credit Data:', {
        name: customerData.name,
        creditBalance: customerData.creditBalance,
        agingSummary: customerData.agingSummary,
        transactionCount: customerData.creditTransactions?.length || 0
      });
      if (customerData.creditTransactions) {
        console.log('📝 Sample transactions:', customerData.creditTransactions.slice(0, 2));
      }
      setCustomer(customerData);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err.response?.data?.message || 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showNotification('error', 'Please enter a valid amount');
      return;
    }

    try {
      setRecordingPayment(true);
      await customersAPI.recordPayment(customerId, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        notes: `Payment recorded via credit modal`
      });

      showNotification('success', `Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded successfully!`);
      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentMethod('cash');
      fetchCustomerDetails(); // Refresh data
    } catch (err) {
      console.error('Error recording payment:', err);
      showNotification('error', err.response?.data?.message || 'Failed to record payment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const getAgeBadge = (age) => {
    if (age === null) return null;

    if (age <= 30) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">{age} days (Current)</span>;
    } else if (age <= 60) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">{age} days (Overdue)</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">{age} days (Critical)</span>;
    }
  };

  const getAgingCardColor = (type) => {
    switch (type) {
      case 'current':
        return 'bg-green-50 border-green-200';
      case 'overdue':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAgingTextColor = (type) => {
    switch (type) {
      case 'current':
        return 'text-green-700';
      case 'overdue':
        return 'text-yellow-700';
      case 'critical':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Customer Credit History" size="xl">
        <div className="text-center py-12">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading credit history...</p>
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Customer Credit History" size="xl">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800 font-medium">Error loading credit history</p>
            <p className="text-red-600 text-sm mt-2">{error}</p>
            <button
              onClick={fetchCustomerDetails}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (!customer) {
    return null;
  }

  const { agingSummary, creditTransactions } = customer;

  return (
    <Modal isOpen={true} onClose={onClose} title="Customer Credit History" size="xl">
      <div className="space-y-6">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Customer Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              {customer.phone && (
                <p className="text-gray-600 mt-1">{customer.phone}</p>
              )}
              {customer.email && (
                <p className="text-sm text-gray-500">{customer.email}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Outstanding Credit</p>
              <p className={`text-3xl font-bold mt-1 ${
                Number(customer.creditBalance) > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(Number(customer.creditBalance))}
              </p>
              {customer.unpaidBills > 0 && (
                <p className="text-sm text-gray-600 mt-1">{customer.unpaidBills} unpaid bill(s)</p>
              )}
            </div>
          </div>

          {Number(customer.creditBalance) > 0 && (
            <button
              onClick={() => {
                setShowPaymentForm(true);
                setPaymentAmount(String(Math.ceil(Number(customer.creditBalance))));
              }}
              className="mt-4 w-full btn btn-primary"
            >
              Record Payment
            </button>
          )}
        </div>

        {/* Aging Summary Cards */}
        {agingSummary && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Credit Aging Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current (0-30 days) */}
              <div className={`p-4 rounded-lg border-2 ${getAgingCardColor('current')}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">0-30 Days</span>
                  <span className="text-2xl">🟢</span>
                </div>
                <p className={`text-2xl font-bold ${getAgingTextColor('current')}`}>
                  {formatCurrency(agingSummary.current.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{agingSummary.current.count} bill(s)</p>
              </div>

              {/* Overdue (31-60 days) */}
              <div className={`p-4 rounded-lg border-2 ${getAgingCardColor('overdue')}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">31-60 Days</span>
                  <span className="text-2xl">🟡</span>
                </div>
                <p className={`text-2xl font-bold ${getAgingTextColor('overdue')}`}>
                  {formatCurrency(agingSummary.overdue.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{agingSummary.overdue.count} bill(s)</p>
              </div>

              {/* Critical (60+ days) */}
              <div className={`p-4 rounded-lg border-2 ${getAgingCardColor('critical')}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">60+ Days</span>
                  <span className="text-2xl">🔴</span>
                </div>
                <p className={`text-2xl font-bold ${getAgingTextColor('critical')}`}>
                  {formatCurrency(agingSummary.critical.amount)}
                </p>
                <p className="text-sm text-gray-600 mt-1">{agingSummary.critical.count} bill(s)</p>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Payment Form */}
        {showPaymentForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Record Payment</h4>
            <div className="space-y-4">
              <Input
                label="Payment Amount (₹)"
                type="number"
                step="0.01"
                min="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['cash', 'online', 'bank_transfer'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-lg border-2 text-center font-medium text-sm capitalize transition-all ${
                        paymentMethod === method
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowPaymentForm(false);
                    setPaymentAmount('');
                    setPaymentMethod('cash');
                  }}
                  disabled={recordingPayment}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={handleRecordPayment}
                  loading={recordingPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                >
                  Record Payment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction History</h3>

          {!creditTransactions || creditTransactions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No credit transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(transaction.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {transaction.type === 'CREDIT_GIVEN' ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Credit Given
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Payment Received
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.billNumber || (
                          transaction.allocatedTo.length > 0
                            ? `Applied to: ${transaction.allocatedTo.join(', ')}`
                            : '—'
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getAgeBadge(transaction.age)}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-right text-sm font-medium ${
                        transaction.amount > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.runningBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerCreditModal;
