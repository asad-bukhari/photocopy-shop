import React from 'react';

const PriceHistory = ({ priceHistory }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateChange = (oldPrice, newPrice) => {
    const change = parseFloat(newPrice) - parseFloat(oldPrice);
    const percentage = ((change / parseFloat(oldPrice)) * 100).toFixed(1);

    return { change, percentage };
  };

  if (!priceHistory || priceHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No price history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {priceHistory.map((history) => {
        const { change, percentage } = calculateChange(history.oldPrice, history.newPrice);
        const isIncrease = change > 0;
        const isDecrease = change < 0;

        return (
          <div
            key={history.id}
            className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    ₹{parseFloat(history.oldPrice).toFixed(2)}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className={`text-sm font-bold ${
                    isIncrease ? 'text-red-600' : isDecrease ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    ₹{parseFloat(history.newPrice).toFixed(2)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    isIncrease
                      ? 'bg-red-100 text-red-700'
                      : isDecrease
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isIncrease ? '+' : ''}{percentage}%
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {history.changeReason || 'No reason provided'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">{formatDate(history.createdAt)}</div>
                <div className="text-xs text-gray-600 mt-1">
                  by {history.changedByUser?.name || 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceHistory;
