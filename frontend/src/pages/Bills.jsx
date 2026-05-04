import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { billsAPI } from '../services/api';
import Modal from '../components/common/Modal';
import BillPrint from '../components/sales/BillPrint';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';

const Bills = () => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');

  // Modal states
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [billToPrint, setBillToPrint] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch bills with filters
  const { data, loading, error, execute } = useApi(
    () => billsAPI.getAll({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined
    }),
    true // Auto-fetch
  );

  // Re-fetch when server-side filters change
  useEffect(() => {
    execute();
  }, [startDate, endDate, paymentStatus]);

  // Client-side filtering for customer name search
  const filteredBills = data?.data?.bills?.filter(bill => {
    const customerName = bill.isGuest ? 'Guest' : (bill.customer?.name || '');
    return customerName.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Handlers
  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowDetailsModal(true);
  };

  const handleDownloadPDF = async (billId) => {
    setLoadingPDF(true);
    try {
      const response = await billsAPI.getById(billId);
      const bill = response.data.data.bill;
      setBillToPrint(bill);
    } catch (error) {
      console.error('Error fetching bill:', error);
      showNotification('error', 'Failed to load bill: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPaymentStatus('all');
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
          <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
          <p className="text-gray-600 mt-1">View and manage all bills (customers and guests)</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Customer Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Customer Name
            </label>
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input w-full"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="input w-full"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <button
            onClick={handleClearFilters}
            className="btn btn-secondary btn-sm"
          >
            Clear Filters
          </button>
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Bills Table */}
      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading bills...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading bills: {error}</p>
          <button
            onClick={execute}
            className="mt-2 btn btn-primary btn-sm"
          >
            Retry
          </button>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.billNumber}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bill.isGuest ? (
                      <span className="text-gray-600">Guest</span>
                    ) : (
                      bill.customer?.name || 'N/A'
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDateTime(bill.billDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(Number(bill.total))}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      bill.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {bill.paymentStatus === 'paid' ? 'Paid' : 'Credit'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {bill.paymentMethod || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownloadPDF(bill.id)}
                        disabled={loadingPDF}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBill(null);
          }}
          title="Bill Details"
          size="lg"
        >
          <div className="space-y-4">
            {/* Bill Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Bill Number</p>
                  <p className="font-medium text-gray-900">{selectedBill.billNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date & Time</p>
                  <p className="font-medium text-gray-900">{formatDateTime(selectedBill.billDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-medium text-gray-900">
                    {selectedBill.isGuest ? 'Guest Customer' : selectedBill.customer?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedBill.paymentMethod || '-'}</p>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(selectedBill.total))}
                </span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="text-lg font-semibold mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedBill.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedBill.paymentStatus === 'paid' ? 'PAID' : 'CREDIT'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleDownloadPDF(selectedBill.id);
                }}
                disabled={loadingPDF}
                className="btn btn-primary"
              >
                {loadingPDF ? 'Loading...' : '📄 Download PDF'}
              </button>
            </div>

            {/* Note */}
            {selectedBill.isGuest && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800">
                This is a guest bill with no associated customer account.
              </div>
            )}

            <button
              onClick={() => {
                setShowDetailsModal(false);
                setSelectedBill(null);
              }}
              className="btn btn-secondary w-full"
            >
              Close
            </button>
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
    </div>
  );
};

export default Bills;
