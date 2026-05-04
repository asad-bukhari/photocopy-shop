import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { productsAPI, billsAPI } from '../services/api';
import ProductGrid from '../components/sales/ProductGrid';
import CartItem from '../components/sales/CartItem';
import BillSummary from '../components/sales/BillSummary';
import CustomerSelector from '../components/sales/CustomerSelector';
import BillPrint from '../components/sales/BillPrint';
import PaymentDetails from '../components/sales/PaymentDetails';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { formatCurrency } from '../utils/currency';

const CATEGORIES = ['All', 'Stationery', 'Printing', 'Photocopying', 'Services'];

const Sales = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [completedBill, setCompletedBill] = useState(null);

  const { data: productsData } = useApi(() => productsAPI.getAll({ isActive: true }));

  const products = productsData?.data?.products || [];

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category?.name === selectedCategory);

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = 0; // Can be configured
  const total = subtotal + tax;

  const addToCart = (product, quantity = 1) => {
    // Check if enough stock available
    if (!product.isService && quantity > product.stock) {
      showNotification('error', `Only ${product.stock} items available in stock`);
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      // Check if total quantity exceeds stock
      const newQuantity = existingItem.quantity + quantity;
      if (!product.isService && newQuantity > product.stock) {
        showNotification('error', `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} available in cart.`);
        return;
      }
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart([...cart, {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        category: product.category?.name || 'Uncategorized',
        unitPrice: Number(product.price),
        quantity
      }]);
    }
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setIsGuest(false);
  };

  const handleGuestMode = () => {
    setSelectedCustomer(null);
    setIsGuest(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification('error', 'Cart is empty');
      return;
    }

    if (!isGuest && !selectedCustomer) {
      showNotification('error', 'Please select a customer');
      return;
    }

    setShowPaymentDetails(true);
  };

  const handlePaymentComplete = async (payments) => {
    try {
      setLoading(true);

      const billData = {
        isGuest,
        customerId: selectedCustomer?.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        tax,
        discount,
        payments
      };

      const response = await billsAPI.create(billData);

      // Store the completed bill for printing
      setCompletedBill(response.data.data.bill);

      showNotification('success', 'Bill created successfully!');

      // Reset
      setCart([]);
      setSelectedCustomer(null);
      setIsGuest(true);
      setDiscount(0);
      setShowPaymentDetails(false);

    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales / Point of Sale</h1>
        <p className="text-gray-600 mt-1">Create new bills and manage sales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onCustomerSelect={handleCustomerSelect}
            onGuestMode={handleGuestMode}
          />

          {/* Cart Items */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cart ({cart.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No items in cart</p>
              ) : (
                cart.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))
              )}
            </div>
          </div>

          {/* Bill Summary */}
          <BillSummary
            items={cart}
            subtotal={subtotal}
            tax={tax}
            total={total}
            discount={discount}
            onDiscountChange={setDiscount}
            onCheckout={handleCheckout}
            loading={loading}
          />
        </div>
      </div>

      {/* Payment Details Modal */}
      <PaymentDetails
        isOpen={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
        cart={cart}
        total={total}
        discount={discount}
        isGuest={isGuest}
        selectedCustomer={selectedCustomer}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Bill Print Modal */}
      <Modal
        isOpen={!!completedBill}
        onClose={() => setCompletedBill(null)}
        title="Bill Generated Successfully!"
      >
        {completedBill && (
          <BillPrint
            bill={completedBill}
            onClose={() => setCompletedBill(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Sales;
