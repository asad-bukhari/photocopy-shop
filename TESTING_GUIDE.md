# Photocopy Shop - Testing Guide

## ✅ Current Status

All services are running:
- **Database**: ✅ Running (Docker container)
- **Backend API**: ✅ Running on http://localhost:8069
- **Frontend**: ✅ Running on http://localhost:5173

## 🔧 Important - Refresh Your Browser!

If you're seeing errors, **hard refresh your browser**:
- **Windows/Linux**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

This will reload the page with the latest code fixes.

## 🧪 Complete Testing Workflow

### 1. Login (✅ Working)
1. Go to http://localhost:5173
2. Enter PIN: `1234`
3. Click "Login"
4. You should see the Dashboard

### 2. Dashboard (✅ Working)
- View today's statistics
- See recent bills
- Click navigation items to test other pages

### 3. Sales/POS (🔧 Just Fixed)
1. Click "Sales" in navigation
2. Select a category (e.g., "Stationery")
3. Click on products to add to cart
4. Adjust quantities with +/- buttons
5. Click "Customer" button to select customer
6. Click "Complete Sale" when ready
7. Choose payment method (Cash/Online/Credit)
8. Click "Complete Sale" to finalize

**Expected Result**: Bill created, stock updated, redirected to dashboard

### 4. Inventory (✅ Working)
1. Click "Inventory" in navigation
2. View all products with stock levels
3. Use search to find products
4. Filter by category
5. (Admin only) Click "Add Product" to create new products
6. See low stock items highlighted in yellow
7. See out of stock items highlighted in red

### 5. Customers (✅ Working)
1. Click "Customers" in navigation
2. View all customers
3. Search by name or phone
4. Click on a customer card to see details
5. Click "Record Payment" for customers with credit
6. Enter payment amount and method
7. Submit to record payment

### 6. Reports (✅ Working)
1. Click "Reports" in navigation
2. Select report type (Daily/Sales/Inventory)
3. For Daily Report: Select date and click "Generate Report"
4. For Sales Report: Select date range and click "Generate Report"
5. For Inventory Report: Click "Generate Report"

## 📊 Sample Data Available

### Products (22 items)
- **Stationery**: Pens, Pencils, Notebooks, Paper, Erasers
- **Printing**: B&W/Color prints (A4/A3)
- **Photocopying**: B&W/Color xerox (A4/A3)
- **Services**: Lamination, Binding, Scanning

### Customers (3 sample customers)
- John Doe (9876543210)
- Jane Smith (9123456789)
- Bob Johnson (9988776655)

## 🐛 Troubleshooting

### Still seeing errors after refresh?

1. **Clear browser cache**:
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

2. **Check backend is running**:
   ```bash
   curl http://localhost:8069/health
   ```
   Should return: `{"success":true,"message":"Server is running"...}`

3. **Check frontend console**:
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

4. **Restart servers**:
   ```bash
   # Stop current servers (Ctrl+C in each terminal)
   # Then restart:
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

## 📱 API Testing (Optional)

You can test the API directly:

```bash
# Login
curl -X POST http://localhost:8069/api/photocopy/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

# Get Products (replace TOKEN from login)
curl http://localhost:8069/api/photocopy/products \
  -H "Authorization: Bearer TOKEN"

# Get Dashboard Stats
curl http://localhost:8069/api/photocopy/dashboard \
  -H "Authorization: Bearer TOKEN"
```

## ✨ Features You Can Test

| Feature | Status | How to Test |
|---------|--------|-------------|
| Login | ✅ Working | Enter PIN 1234 |
| Dashboard | ✅ Working | View stats after login |
| Create Bill | ✅ Working | Sales → Add products → Complete Sale |
| Guest Checkout | ✅ Working | Sales → Select Guest Customer |
| Named Customer | ✅ Working | Sales → Search & Select Customer |
| Credit Sale | ✅ Working | Sales → Select Customer → Credit payment |
| Payment Recording | ✅ Working | Customers → Click customer → Record Payment |
| View Inventory | ✅ Working | Inventory → View all products |
| Low Stock Alert | ✅ Working | Inventory → Yellow highlighted items |
| Add Product | ✅ Working | Inventory → Add Product (admin only) |
| Daily Report | ✅ Working | Reports → Daily → Select date → Generate |
| Sales Report | ✅ Working | Reports → Sales → Date range → Generate |
| Inventory Report | ✅ Working | Reports → Inventory → Generate |

## 🎯 Quick Success Test

Try this simple workflow:

1. **Login** with PIN `1234`
2. **Go to Sales** → Click "Pen (Blue)" twice (adds 2 to cart)
3. **Click "Customer"** → Select "Guest Customer"
4. **Click "Complete Sale"** → Select "Cash" → Click "Complete Sale"
5. **View Dashboard** → See "Today's Sales" increased
6. **Go to Inventory** → See Pen stock decreased by 2

All features should work end-to-end! 🎉

## 📝 Notes

- The backend shows detailed Prisma query logs
- This is normal in development mode
- It helps debug database operations
- In production, these logs would be disabled

## 🆘 Still Having Issues?

If something isn't working:
1. Check the browser console (F12 → Console tab)
2. Check the Network tab for failed requests
3. Review backend terminal for errors
4. Try refreshing the page
5. Try in an incognito/private window

---

**Last Updated**: Just now (Button import fix applied)
**Status**: All systems operational ✅
