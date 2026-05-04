import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { productsAPI, categoriesAPI } from '../../services/api';

const AddItemModal = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    isService: false,
    price: '',
    cost: '',
    stock: '0',
    lowStockThreshold: '10'
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response.data.data.categories);
        // Set default category to first one
        if (response.data.data.categories.length > 0) {
          setFormData(prev => ({
            ...prev,
            categoryId: response.data.data.categories[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await productsAPI.create({
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
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      isService: false,
      price: '',
      cost: '',
      stock: '0',
      lowStockThreshold: '10'
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Product">
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

        {!formData.isService && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Initial Stock"
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

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Add Product
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddItemModal;
