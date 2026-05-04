import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { productsAPI, categoriesAPI } from '../services/api';
import AddItemModal from '../components/inventory/AddItemModal';
import EditProductModal from '../components/inventory/EditProductModal';
import CategoryManager from '../components/inventory/CategoryManager';
import StockAdjuster from '../components/inventory/StockAdjuster';
import { formatCurrency } from '../utils/currency';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const { isAdmin } = useAuth();

  const { data, loading, error, execute } = useApi(() => productsAPI.getAll({ isActive: true }));

  const products = data?.data?.products || [];

  // Fetch categories for filter
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product.category?.id?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = filteredProducts.filter(p => !p.isService && p.stock <= p.lowStockThreshold);

  const handleProductAdded = () => {
    execute();
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await productsAPI.delete(product.id);
      execute();
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      alert(errorMessage);
    }
  };

  const handleStockUpdate = () => {
    execute();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage products and stock levels</p>
        </div>
        {isAdmin() && activeTab === 'products' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Categories
        </button>
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{filteredProducts.length}</p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{lowStockProducts.length}</p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {filteredProducts.filter(p => !p.isService && p.stock === 0).length}
              </p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-gray-600">Services</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {filteredProducts.filter(p => p.isService).length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input w-full"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input md:w-48"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products List */}
          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-600">Loading inventory...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error loading inventory: {error}</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      {isAdmin() && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              {product.isService && (
                                <span className="badge badge-info text-xs">Service</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {product.category?.name || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(Number(product.price))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isAdmin() ? (
                            <StockAdjuster
                              productId={product.id}
                              currentStock={product.stock}
                              isService={product.isService}
                              onUpdate={handleStockUpdate}
                            />
                          ) : (
                            product.isService ? (
                              <span className="text-gray-400">—</span>
                            ) : (
                              <span className={`text-sm font-medium ${
                                product.stock === 0
                                  ? 'text-red-600'
                                  : product.stock <= product.lowStockThreshold
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}>
                                {product.stock}
                              </span>
                            )
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {product.isService ? (
                            <span className="badge badge-info">Service</span>
                          ) : product.stock === 0 ? (
                            <span className="badge badge-danger">Out of Stock</span>
                          ) : product.stock <= product.lowStockThreshold ? (
                            <span className="badge badge-warning">Low Stock</span>
                          ) : (
                            <span className="badge badge-success">In Stock</span>
                          )}
                        </td>
                        {isAdmin() && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <CategoryManager />
      )}

      {/* Add Product Modal */}
      {isAdmin() && (
        <AddItemModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleProductAdded}
        />
      )}

      {/* Edit Product Modal */}
      {isAdmin() && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleProductAdded}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default Inventory;
