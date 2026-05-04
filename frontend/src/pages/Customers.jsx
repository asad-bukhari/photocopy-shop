import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { customersAPI, billsAPI } from '../services/api';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import BillPrint from '../components/sales/BillPrint';
import CustomerCreditModal from '../components/customers/CustomerCreditModal';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';

const Customers = () => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [billToPrint, setBillToPrint] = useState(null);

  const { data, loading: customersLoading, error, execute } = useApi(
    () => customersAPI.getAll({ isActive: true })
  );

  const customers = data?.data?.customers || [];

  const filteredCustomers = customers.filter(customer => {
    const searchLower = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.phone && customer.phone.includes(searchLower))
    );
  });

  const totalCreditBalance = customers.reduce((sum, c) => sum + Number(c.creditBalance), 0);

  const hasCriticalCredit = (customer) => {
    // This is a simple check - we'll know more details when credit modal is opened
    // For now, we can use credit balance and unpaid bills as indicators
    return customer.creditBalance > 0 && customer.unpaidBills > 0;
  };

  const handleOpenCreditModal = (customerId) => {
    console.log('🔍 Opening credit modal for customer ID:', customerId);
    setShowCreditModal(customerId);
  };

  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingDetails(true);
    setCustomerDetails(null); // Reset previous details
    try {
      const response = await customersAPI.getById(customer.id);
      const data = response.data.data.customer;
      console.log('Customer details loaded:', data.name, 'Bills:', data.bills?.length || 0);
      setCustomerDetails(data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      showNotification('error', 'Failed to load customer details: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownloadBillPDF = async (billId) => {
    try {
      console.log('Fetching bill ID:', billId);
      const response = await billsAPI.getById(billId);
      const bill = response.data.data.bill;
      console.log('Bill fetched:', bill.billNumber);
      setBillToPrint(bill);
    } catch (error) {
      console.error('Error fetching bill:', error);
      showNotification('error', 'Failed to load bill: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showNotification('error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await customersAPI.recordPayment(selectedCustomer.id, {
        amount: parseFloat(paymentAmount),
        paymentMethod,
        notes: `Payment recorded`
      });

      showNotification('success', `Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded!`);
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentMethod('cash');
      execute(); // Refresh customers list
    } catch (error) {
      console.error('Error recording payment:', error);
      showNotification('error', error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers & Credit</h1>
          <p className="text-gray-600 mt-1">Manage customers and credit balances</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Customers</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{customers.length}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Credit Balance</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">{formatCurrency(totalCreditBalance)}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Customers with Credit</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {customers.filter(c => c.creditBalance > 0).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Search customers by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Customers List */}
      {customersLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading customers: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleCustomerClick(customer)}
              className="card cursor-pointer hover:shadow-lg transition-shadow relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  {customer.phone && (
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  )}
                </div>
                {customer.creditBalance > 0 && (
                  <span className="badge badge-warning">Credit</span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Credit Balance:</span>
                  <span className={`font-medium ${
                    customer.creditBalance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(Number(customer.creditBalance))}
                  </span>
                </div>
                {customer.unpaidBills > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unpaid Bills:</span>
                    <span className="font-medium text-gray-900">{customer.unpaidBills}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">Click to view bills</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {customer.creditBalance > 0 && (
                <div className="mt-3 space-y-2">
                  {/* Aging warning indicator */}
                  {hasCriticalCredit(customer) && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Has outstanding credit
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🔍 Opening credit modal for customer:', customer.name, '(ID:', customer.id, ')');
                        setShowCreditModal(customer.id);
                      }}
                      className="btn btn-secondary btn-sm text-xs"
                    >
                      View Credit History
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomer(customer);
                        setShowPaymentModal(true);
                      }}
                      className="btn btn-primary btn-sm text-xs"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">No customers found</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPaymentAmount('');
          setPaymentMethod('cash');
        }}
        title="Record Payment"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-600 mt-2">
                Outstanding Credit: <span className="font-semibold text-red-600">
                  {formatCurrency(Number(selectedCustomer.creditBalance))}
                </span>
              </p>
            </div>

            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              min="0"
              max={Number(selectedCustomer.creditBalance)}
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

            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                  setPaymentMethod('cash');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                className="flex-1"
                onClick={handleRecordPayment}
                loading={loading}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
              >
                Record Payment
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Customer Detail Modal */}
      {selectedCustomer && !showPaymentModal && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => {
            setSelectedCustomer(null);
            setCustomerDetails(null);
          }}
          title={selectedCustomer.name}
          size="xl"
        >
          <div className="space-y-4">
            {/* Customer Info - Compact */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.email || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Credit Balance</p>
                  <p className={`font-medium ${
                    selectedCustomer.creditBalance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(Number(selectedCustomer.creditBalance))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Unpaid Bills</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.unpaidBills}</p>
                </div>
              </div>

              {selectedCustomer.creditBalance > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={() => {
                      setShowCreditModal(selectedCustomer.id);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    View Credit History
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Record Payment
                  </button>
                </div>
              )}
            </div>

            {/* Bills List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Bills</h3>

              {loadingDetails ? (
                <div className="text-center py-8">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-gray-600">Loading bills...</p>
                </div>
              ) : customerDetails?.bills && customerDetails.bills.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customerDetails.bills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{bill.billNumber}</p>
                        <p className="text-sm text-gray-600">{formatDateTime(bill.billDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(Number(bill.total))}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          bill.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {bill.paymentStatus}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadBillPDF(bill.id)}
                        className="ml-3 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : customerDetails && customerDetails.bills?.length === 0 ? (
                <div className="text-center py-8 text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">No bills found for this customer</p>
                  <p className="text-sm text-gray-500 mt-1">This customer hasn't made any purchases yet</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p>Click on a customer to view their bills</p>
                </div>
              )}
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerDetails(null);
              }}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Bill Print Modal */}
      {billToPrint && (
        <Modal
          isOpen={!!billToPrint}
          onClose={() => setBillToPrint(null)}
          title="Bill Preview"
          size="xl"
        >
          <BillPrint bill={billToPrint} onClose={() => setBillToPrint(null)} />
        </Modal>
      )}

      {/* Customer Credit Modal */}
      {showCreditModal && (
        <CustomerCreditModal
          customerId={showCreditModal}
          onClose={() => {
            setShowCreditModal(null);
            execute(); // Refresh customers list
          }}
        />
      )}
    </div>
  );
};

export default Customers;
