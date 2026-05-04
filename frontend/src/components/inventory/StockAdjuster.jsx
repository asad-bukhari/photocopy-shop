import React, { useState, useEffect } from 'react';
import { stockAPI } from '../../services/api';

const StockAdjuster = ({ productId, currentStock, isService, onUpdate }) => {
  const [stock, setStock] = useState(currentStock);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previousStock, setPreviousStock] = useState(currentStock);

  // Update local state when currentStock prop changes
  useEffect(() => {
    setStock(currentStock);
    setPreviousStock(currentStock);
  }, [currentStock]);

  const handleQuickAdjust = async (adjustment) => {
    if (isService) return;

    const newStock = stock + adjustment;
    if (newStock < 0) return;

    setIsLoading(true);
    try {
      await stockAPI.quickAdjust(productId, adjustment, 'Quick adjustment');
      setStock(newStock);
      setPreviousStock(newStock);
      onUpdate(newStock);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      // Revert on error
      setStock(previousStock);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setStock(value);
    }
  };

  const handleStockSubmit = async () => {
    if (isService) return;

    setIsLoading(true);
    try {
      await stockAPI.update(productId, stock, 'Manual update');
      setPreviousStock(stock);
      onUpdate(stock);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      // Revert on error
      setStock(previousStock);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleStockSubmit();
    } else if (e.key === 'Escape') {
      setStock(previousStock);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (stock !== previousStock) {
      handleStockSubmit();
    } else {
      setIsEditing(false);
    }
  };

  const getStockColor = () => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockChangeColor = () => {
    if (stock > previousStock) return 'text-green-600';
    if (stock < previousStock) return 'text-red-600';
    return 'text-gray-900';
  };

  if (isService) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={handleStockChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="w-16 px-2 py-1 border rounded text-center"
            autoFocus
            disabled={isLoading}
          />
          {isLoading && (
            <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
        </>
      ) : (
        <>
          <button
            onClick={() => handleQuickAdjust(-1)}
            disabled={isLoading || stock === 0}
            className="w-6 h-6 flex items-center justify-center rounded bg-red-100 hover:bg-red-200 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Decrease stock"
          >
            -
          </button>
          <span
            onClick={() => setIsEditing(true)}
            className={`font-medium cursor-pointer ${getStockColor()} ${getStockChangeColor()} ${isLoading ? 'opacity-50' : ''}`}
            title="Click to edit"
          >
            {stock}
          </span>
          <button
            onClick={() => handleQuickAdjust(1)}
            disabled={isLoading}
            className="w-6 h-6 flex items-center justify-center rounded bg-green-100 hover:bg-green-200 text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Increase stock"
          >
            +
          </button>
        </>
      )}
    </div>
  );
};

export default StockAdjuster;
