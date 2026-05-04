# Photocopy Shop - Setup Instructions

## Quick Start

### Backend Server
The backend is already running on port 8069.

**Admin Login:**
- PIN: **1234**
- URL: http://localhost:5173/login

### Frontend Development Server
The frontend is already running on port 5173.
- URL: http://localhost:5173

## If You're Seeing Errors

If the inventory page shows errors or can't fetch products:

1. **Clear your browser localStorage:**
   - Open browser DevTools (F12)
   - Go to Application tab → Local Storage
   - Right-click → Clear
   - Refresh the page

2. **Login again:**
   - Go to http://localhost:5173/login
   - Enter PIN: **1234**
   - You should now be able to access the inventory

## Features Implemented

✅ **Inventory Management**
- Add/Edit/Delete products
- Quick stock adjustment (+/- buttons)
- Category management
- Price history tracking
- Product search and filtering

✅ **Categories**
- Create/Edit/Delete categories
- Reassign products when deleting categories
- View product count per category

✅ **Stock Management**
- Quick adjust buttons in inventory table
- Click-to-edit stock values
- Visual indicators for changes

✅ **Price History**
- Track all price changes
- See who changed the price and why
- Timeline view with percentage changes

## Database Status

✅ 57 products migrated
✅ 4 categories created (Stationery, Printing, Photocopying, Services)
✅ All products linked to categories

## Testing the Features

1. **Login** with PIN: 1234
2. **Go to Inventory** page
3. **Try:**
   - Click +/- buttons to adjust stock
   - Click "Edit" on a product
   - Change a price and add a reason
   - Switch to "Categories" tab to manage categories
   - Add a new product with the "+ Add Product" button

## API Endpoints (Testing)

Health Check:
```bash
curl http://localhost:8069/health
```

Login (get token):
```bash
curl -X POST http://localhost:8069/api/photocopy/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'
```

Get Products:
```bash
curl http://localhost:8069/api/photocopy/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
