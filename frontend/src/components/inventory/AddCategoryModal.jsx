import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { categoriesAPI } from '../../services/api';

const AddCategoryModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await categoriesAPI.create({
        name: formData.name.trim(),
        description: formData.description.trim() || null
      });

      onSuccess(response.data.data.category);
      handleClose();
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to create category. Please try again.');
      }
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: ''
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Category Name"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="e.g., Stationery, Printing, Services"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Optional description of this category"
            className="input w-full"
            rows="3"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Add Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCategoryModal;
