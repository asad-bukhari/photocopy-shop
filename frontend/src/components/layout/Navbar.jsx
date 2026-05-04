import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { shop } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log('Navbar - User:', user);
  console.log('Navbar - User role:', user?.role);
  console.log('Navbar - isAdmin():', isAdmin());
  console.log('Navbar - user?.role === "admin":', user?.role === 'admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Simplified check - directly check user role
  const isUserAdmin = user?.role === 'admin';
  console.log('Navbar - isUserAdmin:', isUserAdmin);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/bills', label: 'Bills', icon: '📋' },
    { path: '/expenses', label: 'Expenses', icon: '💸' },
    { path: '/reports', label: 'Reports', icon: '📈' }
  ];

  // Add Settings if admin
  if (isUserAdmin) {
    navItems.push({ path: '/settings', label: 'Settings', icon: '⚙️' });
  }

  console.log('Navbar - navItems:', navItems);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {shop.logoUrl ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8069'}${shop.logoUrl}`}
                alt="Shop Logo"
                className="h-8 w-8 object-contain"
              />
            ) : (
              <span className="text-2xl">🖨️</span>
            )}
            <span className="text-xl font-bold text-gray-900">{shop.name}</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-2 flex gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
