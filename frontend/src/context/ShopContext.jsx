import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

// Create context
const ShopContext = createContext(undefined);

// Default shop configuration
const DEFAULT_SHOP = {
  name: 'Photocopy Shop',
  phone: '+92 XXX XXXXXXX',
  email: 'info@photocopyshop.pk',
  logoUrl: null,
  address: null
};

/**
 * Shop Provider Component
 */
export const ShopProvider = ({ children }) => {
  const [shop, setShop] = useState(DEFAULT_SHOP);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shop settings on mount
  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.getShopSettings();
      setShop(response.data.data || DEFAULT_SHOP);
    } catch (err) {
      console.error('Failed to fetch shop settings:', err);
      setError(err.message);
      // Use default values on error
      setShop(DEFAULT_SHOP);
    } finally {
      setLoading(false);
    }
  };

  const updateShop = (updatedShop) => {
    setShop(updatedShop);
  };

  const updateLogo = (logoUrl) => {
    setShop(prev => ({ ...prev, logoUrl }));
  };

  const value = {
    shop,
    loading,
    error,
    updateShop,
    updateLogo,
    refetch: fetchShopSettings
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

/**
 * Custom hook to use shop context
 */
export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export default ShopContext;
