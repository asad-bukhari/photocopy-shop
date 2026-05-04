import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { settingsAPI } from '../services/api';
import FileUpload from '../components/common/FileUpload';

const Settings = () => {
  const { user } = useAuth();
  const { shop, updateShop, updateLogo, refetch } = useShop();

  // Shop info form state
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // PIN change form state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Logo upload state
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [changingPin, setChangingPin] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize form with shop data
  useEffect(() => {
    if (shop) {
      setShopName(shop.name || '');
      setPhone(shop.phone || '');
      setEmail(shop.email || '');
      setAddress(shop.address || '');
      if (shop.logoUrl) {
        setLogoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:8069'}${shop.logoUrl}`);
      }
    }
  }, [shop]);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have permission to access settings.</p>
        </div>
      </div>
    );
  }

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleShopInfoSubmit = async (e) => {
    e.preventDefault();

    if (!shopName.trim() || !phone.trim()) {
      showMessage('error', 'Shop name and phone number are required');
      return;
    }

    try {
      setLoading(true);
      const response = await settingsAPI.updateShopSettings({
        name: shopName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        address: address.trim() || null
      });

      updateShop(response.data.data);
      showMessage('success', 'Shop information updated successfully');
    } catch (error) {
      console.error('Error updating shop settings:', error);
      showMessage('error', error.response?.data?.message || 'Failed to update shop information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = (file) => {
    setSelectedLogo(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!selectedLogo) {
      showMessage('error', 'Please select a logo first');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', selectedLogo);

      const response = await settingsAPI.uploadLogo(formData);
      updateLogo(response.data.data.logoUrl);
      setSelectedLogo(null);
      showMessage('success', 'Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      showMessage('error', error.response?.data?.message || 'Failed to upload logo');
      // Reset preview on error
      if (shop.logoUrl) {
        setLogoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:8069'}${shop.logoUrl}`);
      } else {
        setLogoPreview(null);
      }
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoCancel = () => {
    setSelectedLogo(null);
    if (shop.logoUrl) {
      setLogoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:8069'}${shop.logoUrl}`);
    } else {
      setLogoPreview(null);
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();

    if (!currentPin || !newPin || !confirmPin) {
      showMessage('error', 'All PIN fields are required');
      return;
    }

    if (newPin !== confirmPin) {
      showMessage('error', 'New PIN and confirmation do not match');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      showMessage('error', 'PIN must be exactly 4 digits');
      return;
    }

    try {
      setChangingPin(true);
      await settingsAPI.changePin({
        currentPin,
        newPin
      });

      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      showMessage('success', 'PIN changed successfully');
    } catch (error) {
      console.error('Error changing PIN:', error);
      showMessage('error', error.response?.data?.message || 'Failed to change PIN');
    } finally {
      setChangingPin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your shop settings and preferences</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Shop Information Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Information</h2>
        <form onSubmit={handleShopInfoSubmit} className="space-y-4">
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter shop name"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+92 XXX XXXXXXX"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="info@photocopyshop.pk"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter shop address"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Logo Upload Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop Logo</h2>
        <div className="space-y-4">
          <FileUpload
            label="Logo Image"
            accept="image/*"
            onChange={handleLogoSelect}
            preview={logoPreview}
            helperText="Upload your shop logo (PNG, JPG, GIF, WEBP, max 2MB)"
          />

          {selectedLogo && (
            <div className="flex gap-3">
              <button
                onClick={handleLogoUpload}
                disabled={uploadingLogo}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </button>
              <button
                onClick={handleLogoCancel}
                disabled={uploadingLogo}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PIN Change Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Change PIN</h2>
        <form onSubmit={handlePinChange} className="space-y-4">
          <div>
            <label htmlFor="currentPin" className="block text-sm font-medium text-gray-700 mb-1">
              Current PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="currentPin"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter current PIN"
              maxLength={4}
              required
            />
          </div>

          <div>
            <label htmlFor="newPin" className="block text-sm font-medium text-gray-700 mb-1">
              New PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="newPin"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new 4-digit PIN"
              maxLength={4}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New PIN <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPin"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new PIN"
              maxLength={4}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPin}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {changingPin ? 'Changing...' : 'Change PIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
