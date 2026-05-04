import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { productsAPI, categoriesAPI } from '../../services/api';

const EditProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const [categories, setCategories] = useState([]);
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    isService: false,
    price: '',
    cost: '',
    stock: '0',
    lowStockThreshold: '10',
    isActive: true,
    changeReason: ''
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        categoryId: product.categoryId || '',
        isService: product.isService || false,
        price: product.price || '',
        cost: product.cost || '',
        stock: product.stock || '0',
        lowStockThreshold: product.lowStockThreshold || '10',
        isActive: product.isActive !== undefined ? product.isActive : true,
        changeReason: ''
      });
    }
  }, [product]);

  // Fetch price history when modal opens
  useEffect(() => {
    if (isOpen && product) {
      fetchPriceHistory();
    }
  }, [isOpen, product]);

  const fetchPriceHistory = async () => {
    try {
      const response = await productsAPI.getPriceHistory(product.id);
      setPriceHistory(response.data.data.priceHistory);
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If price changed, require change reason
    if (formData.price !== product.price && !formData.changeReason.trim()) {
      alert('Please provide a reason for the price change');
      return;
    }

    try {
      const response = await productsAPI.update(product.id, {
        ...formData,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        categoryId: parseInt(formData.categoryId)
      });

      onSuccess(response.data.data.product);
      handleClose();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await productsAPI.delete(product.id);
      onSuccess(null);
      handleClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete product. Please try again.';
      alert(errorMessage);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      categoryId: '',
      isService: false,
      price: '',
      cost: '',
      stock: '0',
      lowStockThreshold: '10',
      isActive: true,
      changeReason: ''
    });
    setShowPriceHistory(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const priceChanged = formData.price !== product?.price;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Product Name"
          value={formData.name}
          onChange={handleChange('name')}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.categoryId}
            onChange={handleChange('categoryId')}
            className="input w-full"
            required
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isService"
            checked={formData.isService}
            onChange={handleChange('isService')}
            className="rounded"
          />
          <label htmlFor="isService" className="text-sm font-medium text-gray-700">
            This is a service (no inventory tracking)
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Selling Price (₹)"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange('price')}
            required
          />
          <Input
            label="Cost Price (₹)"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={handleChange('cost')}
          />
        </div>

        {priceChanged && (
          <div>
            <Input
              label="Reason for price change *"
              value={formData.changeReason}
              onChange={handleChange('changeReason')}
              placeholder="e.g., Supplier price increase, seasonal adjustment"
              required={priceChanged}
            />
            <p className="text-xs text-gray-500 mt-1">
              Old price: ₹{product?.price} → New price: ₹{formData.price}
            </p>
          </div>
        )}

        {!formData.isService && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange('stock')}
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={handleChange('lowStockThreshold')}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange('isActive')}
            className="rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Active (visible in inventory)
          </label>
        </div>

        {/* Price History Toggle */}
        {priceHistory.length > 0 && (
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowPriceHistory(!showPriceHistory)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showPriceHistory ? 'Hide' : 'Show'} Price History ({priceHistory.length} changes)
            </button>

            {showPriceHistory && (
              <div className="mt-3 max-h-48 overflow-y-auto space-y-2">
                {priceHistory.map((history) => (
                  <div key={history.id} className="text-sm bg-gray-50 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        ₹{history.oldPrice} → ₹{history.newPrice}
                      </span>
                      <span className="text-gray-500">
                        {formatDate(history.createdAt)}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {history.changeReason} by {history.changedByUser.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="px-4"
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;
