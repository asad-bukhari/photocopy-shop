import React from 'react';
import { formatCurrency } from '../../utils/currency';

const BillSummary = ({ items, subtotal, tax, total, discount, onDiscountChange, onCheckout, loading }) => {
  if (items.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h3>
        <p className="text-gray-600 text-center py-8">No items in cart</p>
      </div>
    );
  }

  const discountAmount = discount; // discount is now absolute amount
  const totalAfterDiscount = subtotal - discountAmount + tax;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {/* Discount Section */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Discount</span>
          <div className="flex items-center gap-1 flex-1">
            <span className="text-gray-500">₹</span>
            <input
              type="number"
              min="0"
              max={subtotal}
              step="1"
              value={discount}
              onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1 border rounded text-center text-sm"
              placeholder="0"
            />
            <button
              onClick={() => onDiscountChange(0)}
              className="text-xs text-red-600 hover:text-red-800 px-1"
              title="Clear discount"
            >
              ✕
            </button>
          </div>
          {discount > 0 && (
            <span className="font-medium text-red-600">
              -{formatCurrency(discount)}
            </span>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>

        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-xl text-blue-600">{formatCurrency(totalAfterDiscount)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Original total</span>
              <span className="line-through">{formatCurrency(subtotal + tax)}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={loading || items.length === 0}
        className="w-full btn btn-success py-3 text-lg"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>

      <div className="mt-4 text-sm text-gray-600">
        <p>{items.length} item{items.length !== 1 ? 's' : ''} in cart</p>
      </div>
    </div>
  );
};

export default BillSummary;
