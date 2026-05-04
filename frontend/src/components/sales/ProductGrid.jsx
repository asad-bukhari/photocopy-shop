import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';

const ProductGrid = ({ products, onAddToCart }) => {
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, value) => {
    const qty = parseInt(value) || 1;
    if (qty >= 1) {
      setQuantities(prev => ({ ...prev, [productId]: qty }));
    }
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    onAddToCart(product, quantity);
    // Reset quantity for this product after adding
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => {
        const quantity = quantities[product.id] || 1;
        const maxStock = product.isService ? 999 : product.stock;

        return (
          <div
            key={product.id}
            className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              product.stock <= 0 && !product.isService
                ? 'border-red-300 bg-red-50 opacity-60'
                : 'border-gray-200 bg-white hover:border-blue-400'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{product.name}</h3>
              {product.stock <= 0 && !product.isService && (
                <span className="badge badge-danger text-xs">Out of Stock</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-2">{product.category?.name || 'Uncategorized'}</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(Number(product.price))}</p>
            {!product.isService && (
              <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
            )}

            {/* Quantity Input and Add Button */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(product.id, Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxStock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  className="w-16 px-2 py-1 text-center border rounded"
                  disabled={product.stock <= 0 && !product.isService}
                />
                <button
                  onClick={() => handleQuantityChange(product.id, quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold"
                  disabled={quantity >= maxStock}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock <= 0 && !product.isService}
                className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors ${
                  product.stock <= 0 && !product.isService
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Add ({quantity})
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
