import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import CustomerCreditModal from '../customers/CustomerCreditModal';
import { customersAPI } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const CustomerSelector = ({ selectedCustomer, onCustomerSelect, onGuestMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [allCustomers, setAllCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerError, setCustomerError] = useState(null);
  const [showAllCustomers, setShowAllCustomers] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [showCreditModal, setShowCreditModal] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadAllCustomers();
    }
  }, [isOpen]);

  const loadAllCustomers = async () => {
    try {
      setLoadingCustomers(true);
      setCustomerError(null);
      const response = await customersAPI.getAll({ isActive: true });
      setAllCustomers(response.data.data.customers);
    } catch (error) {
      setCustomerError(error.response?.data?.message || 'Failed to load customers');
      console.error('Error loading customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const searchCustomers = async (query) => {
    setSearch(query);
    setShowAllCustomers(false);
    if (query.length < 2) {
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      const response = await customersAPI.getAll({ search: query });
      setCustomers(response.data.data.customers);
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      setCreateError(null);
      setLoading(true);
      const response = await customersAPI.create(newCustomer);
      onCustomerSelect(response.data.data.customer);
      setIsOpen(false);
      setNewCustomer({ name: '', phone: '' });
      setShowNewCustomer(false);
    } catch (error) {
      setCreateError(error.response?.data?.message || 'Failed to create customer');
      console.error('Error creating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
          selectedCustomer
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        {selectedCustomer ? (
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
            {selectedCustomer.phone && (
              <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
            )}
            {selectedCustomer.creditBalance > 0 && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <p className="text-sm text-yellow-600">
                  Credit: {formatCurrency(Number(selectedCustomer.creditBalance))}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreditModal(selectedCustomer.id);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1"
                >
                  View credit history →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold text-gray-900">Guest Customer</p>
            </div>
            <span className="text-gray-400">→</span>
          </div>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Customer">
        <div className="space-y-4">
          <Input
            placeholder="Search customers by name or phone..."
            value={search}
            onChange={(e) => searchCustomers(e.target.value)}
          />

          {search.length < 2 && !showAllCustomers && (
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowAllCustomers(true)}
              >
                View All Customers ({allCustomers.length})
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  onGuestMode();
                  setIsOpen(false);
                }}
              >
                Continue as Guest
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowNewCustomer(true)}
              >
                + New Customer
              </Button>
            </div>
          )}

          {showNewCustomer ? (
            <div className="space-y-3">
              <Input
                label="Customer Name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowNewCustomer(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleCreateCustomer}
                  disabled={!newCustomer.name || loading}
                  loading={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{createError}</p>
                </div>
              )}
              <div className="max-h-64 overflow-y-auto">
                {loadingCustomers || loading ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-gray-600">Loading customers...</p>
                  </div>
                ) : customerError ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{customerError}</p>
                    <button
                      onClick={loadAllCustomers}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Try Again
                    </button>
                  </div>
                ) : showAllCustomers || customers.length > 0 ? (
                  <div className="space-y-2">
                    {(showAllCustomers ? allCustomers : customers).map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          onCustomerSelect(customer);
                          setIsOpen(false);
                        }}
                        className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        {customer.phone && (
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        )}
                        {customer.creditBalance > 0 && (
                          <p className="text-sm text-yellow-600">
                            Credit: {formatCurrency(Number(customer.creditBalance))}
                          </p>
                        )}
                      </button>
                    ))}
                    {showAllCustomers && allCustomers.length === 0 && (
                      <p className="text-center text-gray-600 py-4">No customers found</p>
                    )}
                  </div>
                ) : search.length >= 2 ? (
                  <p className="text-center text-gray-600 py-4">No customers found</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Customer Credit Modal */}
      {showCreditModal && (
        <CustomerCreditModal
          customerId={showCreditModal}
          onClose={() => setShowCreditModal(null)}
        />
      )}
    </>
  );
};

export default CustomerSelector;
