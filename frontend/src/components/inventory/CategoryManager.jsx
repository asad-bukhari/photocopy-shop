import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { categoriesAPI } from '../../services/api';
import AddCategoryModal from './AddCategoryModal';
import { useAuth } from '../../context/AuthContext';

const CategoryManager = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [reassignCategoryId, setReassignCategoryId] = useState('');

  const { isAdmin } = useAuth();
  const { data, loading, error, execute } = useApi(() =>
    categoriesAPI.getAll({ includeProductCount: true })
  );

  const categories = data?.data?.categories || [];

  const handleCategoryAdded = () => {
    execute();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');
    const isActive = formData.get('isActive') === 'true';

    try {
      await categoriesAPI.update(editingCategory.id, { name, description, isActive });
      setEditingCategory(null);
      execute();
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDelete = (category) => {
    if (category.productCount > 0) {
      setDeletingCategory(category);
      setReassignCategoryId('');
    } else {
      confirmAndDelete(category);
    }
  };

  const confirmAndDelete = async (category, reassignTo = null) => {
    try {
      await categoriesAPI.delete(category.id, reassignTo);
      setDeletingCategory(null);
      execute();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    if (!reassignCategoryId) {
      alert('Please select a category to reassign products to');
      return;
    }

    await confirmAndDelete(deletingCategory, reassignCategoryId);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleCancelDelete = () => {
    setDeletingCategory(null);
    setReassignCategoryId('');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Category Management</h2>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Add Category
          </button>
        )}
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading categories: {error}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {isAdmin() && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    {editingCategory?.id === category.id ? (
                      <>
                        <td className="px-4 py-3" colSpan="5">
                          <form onSubmit={handleEditSubmit} className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                name="name"
                                type="text"
                                defaultValue={editingCategory.name}
                                className="input w-full"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                name="description"
                                defaultValue={editingCategory.description}
                                className="input w-full"
                                rows="2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                name="isActive"
                                defaultValue={editingCategory.isActive}
                                className="input w-full"
                              >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" className="btn btn-primary">Save</button>
                              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">Cancel</button>
                            </div>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {category.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {category.productCount}
                        </td>
                        <td className="px-4 py-3">
                          {category.isActive ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-secondary">Inactive</span>
                          )}
                        </td>
                        {isAdmin() && (
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No categories found</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Reassign Products
            </h3>
            <p className="text-gray-600 mb-4">
              This category has <strong>{deletingCategory.productCount}</strong> product(s).
              Please select a category to reassign them to before deleting "{deletingCategory.name}".
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reassign to category
              </label>
              <select
                value={reassignCategoryId}
                onChange={(e) => setReassignCategoryId(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Select a category...</option>
                {categories
                  .filter(c => c.id !== deletingCategory.id)
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelDelete}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn btn-danger flex-1"
              >
                Delete & Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAdmin() && (
        <AddCategoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleCategoryAdded}
        />
      )}
    </div>
  );
};

export default CategoryManager;
