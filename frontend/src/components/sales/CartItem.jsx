import React from 'react';
import { formatCurrency } from '../../utils/currency';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.productName}</h4>
        <p className="text-sm text-gray-600">{item.category}</p>
        <p className="text-sm text-blue-600 font-medium mt-1">
          {formatCurrency(Number(item.unitPrice))} × {item.quantity}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.id, -1)}
          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium"
        >
          -
        </button>
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium"
        >
          +
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="ml-2 w-8 h-8 rounded bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default CartItem;
