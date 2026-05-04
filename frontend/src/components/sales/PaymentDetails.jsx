import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';

const PaymentDetails = ({
  isOpen,
  onClose,
  cart,
  total,
  discount,
  isGuest,
  selectedCustomer,
  onPaymentComplete
}) => {
  const [payments, setPayments] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalAfterDiscount = total - discount;
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalAfterDiscount - totalPaid;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setPaymentMethod('cash');
      setPaymentAmount('');
      setError(null);
    }
  }, [isOpen]);

  const addPayment = () => {
    setError(null);

    const amount = parseFloat(paymentAmount);

    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (amount > remaining) {
      setError(`Payment amount cannot exceed remaining balance of ${formatCurrency(remaining)}`);
      return;
    }

    const newPayment = {
      id: Date.now(),
      method: paymentMethod,
      amount: amount
    };

    setPayments([...payments, newPayment]);
    setPaymentAmount('');
  };

  const removePayment = (id) => {
    setPayments(payments.filter(p => p.id !== id));
    setError(null);
  };

  const setAsCredit = () => {
    if (payments.length > 0) {
      setError('Cannot set as credit when payments have been added. Remove payments first.');
      return;
    }

    handleConfirm([]);
  };

  const handleConfirm = async (paymentsToSubmit) => {
    setError(null);

    // Validation for guest customers
    if (isGuest) {
      const totalToPay = paymentsToSubmit.reduce((sum, p) => sum + p.amount, 0);
      if (totalToPay < totalAfterDiscount) {
        setError('Guest customers must pay the full amount');
        return;
      }
      if (paymentsToSubmit.length === 0 && totalAfterDiscount > 0) {
        setError('At least one payment is required for guest customers');
        return;
      }
    }

    // Validation for registered customers
    if (!isGuest) {
      const totalToPay = paymentsToSubmit.reduce((sum, p) => sum + p.amount, 0);
      if (totalToPay > totalAfterDiscount) {
        setError('Total payments cannot exceed the bill amount');
        return;
      }
    }

    setLoading(true);

    try {
      await onPaymentComplete(paymentsToSubmit);
      // Payment successful - close the modal
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  const confirmPayment = () => {
    const paymentsToSubmit = payments.map(p => ({
      paymentMethod: p.method,
      amount: p.amount
    }));
    handleConfirm(paymentsToSubmit);
  };

  const payRemaining = () => {
    setPaymentAmount(remaining.toString());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Details"
    >
      <div className="space-y-4">
        {/* Total Amount Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Amount</span>
              <span className="font-bold text-xl text-blue-600">{formatCurrency(totalAfterDiscount)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        {!isGuest && selectedCustomer && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
            {selectedCustomer.creditBalance > 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                Current Credit: {formatCurrency(Number(selectedCustomer.creditBalance))}
              </p>
            )}
          </div>
        )}

        {/* Add Payment Form */}
        {remaining > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Payment
            </label>
            <div className="flex gap-2">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="cash">💵 Cash</option>
                <option value="online">📱 Online</option>
              </select>
              <div className="flex-1 relative">
                <span className="absolute left-3 top-2 text-gray-500">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={addPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            {remaining > 0 && (
              <button
                onClick={payRemaining}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Pay Remaining: {formatCurrency(remaining)}
              </button>
            )}
          </div>
        )}

        {/* Payments List */}
        {payments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Payments</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {payment.method === 'cash' ? '💵' : '📱'}
                    </span>
                    <div>
                      <p className="font-medium capitalize">{payment.method}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removePayment(payment.id)}
                    className="text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Paid</span>
            <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining</span>
            <span className={`font-medium ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!isGuest && remaining === totalAfterDiscount && (
            <Button
              variant="warning"
              className="w-full"
              onClick={setAsCredit}
              disabled={loading || payments.length > 0}
            >
              Set as Credit
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={confirmPayment}
              loading={loading}
              disabled={remaining === totalAfterDiscount && isGuest}
            >
              Confirm Payment
            </Button>
          </div>
        </div>

        {/* Guest Notice */}
        {isGuest && (
          <p className="text-xs text-gray-500 text-center">
            Guest customers must pay the full amount
          </p>
        )}
      </div>
    </Modal>
  );
};

export default PaymentDetails;
