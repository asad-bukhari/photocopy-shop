# 🤖 CLAUDE.md - AI Assistant Guide

**A comprehensive guide for Claude and other AI assistants working on the Photocopy Shop Management System.**

This document contains architectural insights, business logic, coding patterns, and important considerations for maintaining and extending this codebase.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Business Logic](#key-business-logic)
- [Database Design Principles](#database-design-principles)
- [Frontend Patterns](#frontend-patterns)
- [Backend Patterns](#backend-patterns)
- [Important Files & Their Roles](#important-files--their-roles)
- [Common Tasks](#common-tasks)
- [Testing Considerations](#testing-considerations)
- [Performance Optimizations](#performance-optimizations)
- [Security Considerations](#security-considerations)
- [Deployment Checklist](#deployment-checklist)

---

## 🏗️ Architecture Overview

### Technology Stack

```
Frontend (React 19)          Backend (Node.js/Express)
     ↓                               ↓
Vite Dev Server                 Prisma ORM
Tailwind CSS                  PostgreSQL 15
Axios (HTTP)                  JWT Auth
React Router                  File Upload (Multer)
```

### Key Architectural Decisions

1. **Monorepo Structure** - Frontend and backend in separate directories
2. **Docker Compose** - All services containerized for consistent deployment
3. **Prisma ORM** - Type-safe database access with schema-first approach
4. **JWT Authentication** - Stateless authentication with role-based access
5. **RESTful API** - Standard HTTP methods with proper status codes
6. **Component-Based Frontend** - Reusable React components with hooks
7. **Centralized API Layer** - Single Axios instance with interceptors

---

## 💡 Key Business Logic

### 1. Profit Calculation System ⭐ CRITICAL

**Cost Capture at Sale Time:**
```javascript
// File: backend/src/controllers/billController.js
const unitCost = Number(product.cost) || 0;
const costTotal = unitCost * quantity;

billItems.push({
  unitCost,      // Stored at time of sale
  costTotal,     // Total cost for line item
  subtotal       // Selling price * quantity
});
```

**Why This Matters:**
- Product costs can change over time
- We capture the cost AT THE TIME OF SALE
- This ensures accurate profit calculations for historical bills
- Never query current product cost for old bills

**Dashboard Profit Metrics:**
```javascript
// Calculate COGS from today's bills
let totalCOGS = 0;
todayBills.forEach(bill => {
  bill.items.forEach(item => {
    totalCOGS += Number(item.costTotal || 0);
  });
});

// Gross Profit = Revenue - COGS
const grossProfit = todayRevenue - totalCOGS;

// Net Profit = Gross Profit - All Expenses
const netProfit = grossProfit - totalExpenses;
```

### 2. Expense Categories

**Three Categories:**
- **OPERATING**: Rent, electricity, internet, utilities
- **SUPPLIES**: Paper, ink, toner, binding materials
- **STAFF**: Salaries, wages, bonuses

**Important:** Only admin users can create/edit/delete expenses. All users can view them.

### 3. Customer Credit System

**Credit Balance Tracking:**
```javascript
// When creating a credit bill
customer.creditBalance += bill.total;
customer.unpaidBills += 1;

// When recording payment
customer.creditBalance -= payment.amount;
customer.unpaidBills -= payment.count;
```

**Key Rules:**
- Credit balance can be positive (owed) or zero
- Never negative (customer overpaid)
- Payment history is preserved

### 4. Stock Management

**Stock Updates:**
- Only decreases for NON-SERVICE items
- `product.isService === true` items don't affect stock
- Stock can go negative (overselling allowed)
- Low stock threshold triggers alerts

---

## 🗄️ Database Design Principles

### Schema Best Practices

1. **Decimal Type for Money:**
```prisma
price   Decimal @db.Decimal(10, 2)  // Always use Decimal
amount  Decimal @db.Decimal(10, 2)  // Never use Float for money
```

2. **Soft Deletes:**
```prisma
isActive  Boolean  @default(true)  // Don't actually delete records
```

3. **Audit Trails:**
```prisma
createdAt  DateTime  @default(now())
updatedAt  DateTime  @updatedAt
```

4. **Indexing:**
```prisma
@@index([expenseDate])   // For date-range queries
@@index([category])       // For filtering
```

### Important Schema Details

**User Model:**
- `username` is unique (case-insensitive lookup)
- `pin` is bcrypt hashed (10 rounds)
- `role` can be "admin" or "cashier"

**Product Model:**
- `cost` field is **REQUIRED** (not nullable)
- Used for profit calculations
- Update `cost` when supplier prices change

**BillItem Model:**
- `unitCost` and `costTotal` capture cost AT SALE TIME
- Critical for historical profit accuracy

---

## 🎨 Frontend Patterns

### Component Structure

```
components/
├── auth/           # Authentication related
├── billing/        # Bill generation & PDF
├── common/         # Reusable (Button, Input, Card)
├── dashboard/      # Dashboard-specific
├── inventory/      # Product management
├── layout/         # Navigation, headers
└── sales/          # POS interface
```

### Custom Hooks

**useApi Hook** - Standardized API calls:
```javascript
const { data, loading, error, execute } = useApi(() =>
  productsAPI.getAll(params)
);
```

### State Management

**React Context for:**
- `AuthContext` - User authentication and authorization
- `ShopContext` - Shop settings (name, logo, phone)

**No Redux/Context for:**
- Component-specific state (useState)
- Form state (useRef or controlled inputs)

### API Service Pattern

**Centralized Axios Instance:**
```javascript
// src/services/api.js
const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`
});

// Request interceptor - adds token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handles 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## ⚙️ Backend Patterns

### Controller Structure

**Standard Controller Pattern:**
```javascript
exports.actionName = async (req, res) => {
  try {
    // 1. Validation
    // 2. Database operation
    // 3. Response
  } catch (error) {
    console.error('ActionName error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to action'
    });
  }
};
```

### Middleware Usage

**Authentication Middleware:**
```javascript
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Admin Check:**
```javascript
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
```

### Error Handling

**Global Error Handler:**
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});
```

### Validation

**Using express-validator:**
```javascript
const { body } = require('express-validator');

exports.validateExpense = [
  body('category').isIn(['OPERATING', 'SUPPLIES', 'STAFF']),
  body('title').trim().notEmpty(),
  body('amount').isFloat({ min: 0.01 })
];
```

---

## 📁 Important Files & Their Roles

### Backend

| File | Purpose | Notes |
|------|---------|-------|
| `src/server.js` | Express app setup | Routes, middleware, error handler |
| `src/config/database.js` | Prisma client | Singleton instance |
| `src/controllers/dashboardController.js` | ⭐ Profit calculations | COGS, gross/net profit logic |
| `src/controllers/billController.js` | ⭐ Cost capture | Stores unitCost at sale time |
| `src/controllers/expenseController.js` | Expense CRUD | Admin-only operations |
| `src/controllers/reportController.js` | P&L statements | Comprehensive financial reports |
| `src/middleware/auth.js` | JWT auth | Token verification |
| `prisma/schema.prisma` | Database schema | ⭐ Source of truth for DB |

### Frontend

| File | Purpose | Notes |
|------|---------|-------|
| `src/App.jsx` | Route definitions | Protected routes with auth |
| `src/context/AuthContext.jsx` | Authentication state | Login/logout, role checks |
| `src/context/ShopContext.jsx` | Shop settings | Global shop data |
| `src/services/api.js` | API client | ⭐ All API calls |
| `src/pages/Expenses.jsx` | ⭐ Expense management | Full CRUD interface |
| `src/pages/Dashboard.jsx` | ⭐ Profit metrics | Revenue, COGS, profit display |
| `src/pages/Reports.jsx` | ⭐ P&L statements | Financial reports |
| `src/components/auth/LoginForm.jsx` | ⭐ Login page | Username + PIN, professional design |
| `src/utils/currency.js` | Currency formatting | Consistent money display |
| `src/utils/pdfGenerator.js` | PDF generation | Bill PDFs |

---

## 🔧 Common Tasks

### Adding a New API Endpoint

1. **Create controller function:**
```javascript
// backend/src/controllers/yourController.js
exports.yourAction = async (req, res) => {
  // Your logic here
};
```

2. **Create route:**
```javascript
// backend/src/routes/yourRoutes.js
router.get('/', authenticate, yourController.yourAction);
```

3. **Register in server.js:**
```javascript
app.use(`${apiBase}/your-route`, yourRoutes);
```

4. **Add to API service:**
```javascript
// frontend/src/services/api.js
export const yourAPI = {
  getAll: () => api.get('/your-route')
};
```

### Modifying Database Schema

1. **Edit `prisma/schema.prisma`**
2. **Generate Prisma Client:**
```bash
docker exec photocopy_backend npx prisma generate
```
3. **Push to database:**
```bash
docker exec photocopy_backend npx prisma db push
```

4. **Restart backend:**
```bash
docker compose restart backend
```

### Adding a New Page

1. **Create page component:**
```javascript
// frontend/src/pages/YourPage.jsx
export default function YourPage() {
  return <div>Your content</div>;
}
```

2. **Add route in App.jsx:**
```javascript
<Route path="/your-page" element={<YourPage />} />
```

3. **Add navigation link:**
```javascript
// frontend/src/components/layout/Navbar.jsx
{ path: '/your-page', label: 'Your Page', icon: '📄' }
```

### Changing Cost Calculations

**⚠️ CRITICAL:** Any changes to profit calculations MUST consider:
1. Historical cost data in `BillItem.unitCost`
2. Current cost in `Product.cost`
3. COGS should use BillItem data, not Product data

---

## 🧪 Testing Considerations

### Unit Tests

**What to Test:**
- Controller logic (profit calculations)
- Validation rules
- Utility functions (currency formatting)
- Auth middleware

### Integration Tests

**Test Coverage:**
- API endpoints with authentication
- Database operations (CRUD)
- Expense creation and profit calculation
- Bill generation with cost capture

### E2E Tests

**Critical Workflows:**
1. Login → Create Sale → Verify Cost Captured
2. Add Expense → Verify Dashboard Updated
3. Generate P&L Report → Verify Calculations
4. Credit Sale → Payment → Verify Balance Updated

---

## ⚡ Performance Optimizations

### Database Indexes

**Already Implemented:**
```prisma
@@index([expenseDate])    // For dashboard queries
@@index([category])        // For expense filtering
```

**Add indexes for:**
- Bills by date and customer
- Products by category
- Customers by name

### Frontend Optimizations

**Implemented:**
- React.memo for expensive components
- Lazy loading for modals
- Pagination for large lists

**Consider:**
- Virtual scrolling for large tables
- Image optimization for uploads
- Bundle size reduction

### Backend Optimizations

**Implemented:**
- Prisma connection pooling
- Efficient database queries
- Response compression

**Consider:**
- Redis caching for dashboard stats
- Background jobs for reports
- Database query optimization

---

## 🔒 Security Considerations

### Authentication

**Current Implementation:**
- JWT tokens with 8-hour expiration
- Bcrypt PIN hashing (10 rounds)
- Case-insensitive username lookup

**Best Practices:**
- ✅ Password hashing (bcrypt)
- ✅ JWT tokens
- ✅ HTTPS in production
- ✅ Role-based access control
- ⚠️ Consider: Token refresh mechanism
- ⚠️ Consider: Rate limiting
- ⚠️ Consider: Account lockout after failed attempts

### Input Validation

**Using express-validator:**
- All inputs validated
- SQL injection prevention (Prisma)
- XSS prevention (React)

### CORS Configuration

**Current:**
```javascript
origin: config.nodeEnv === 'development' ? true : config.corsOrigin
```

**Production:**
- Set specific origin
- Remove credentials if not needed

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Update `JWT_SECRET` in production
- [ ] Set `NODE_ENV=production`
- [ ] Verify database connection string
- [ ] Configure CORS for production domain
- [ ] Remove development dependencies
- [ ] Run database migrations
- [ ] Test all authentication flows
- [ ] Verify profit calculations
- [ ] Test expense tracking
- [ ] Generate P&L reports

### Docker Deployment

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production containers
docker compose -f docker-compose.prod.yml up -d

# Verify all services
docker compose ps

# Check logs
docker compose logs -f
```

### Environment Variables

**Required in Production:**
```env
# Backend
PORT=8069
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<strong-random-string>
CORS_ORIGIN=https://your-domain.com

# Frontend
VITE_API_URL=https://api.your-domain.com
```

### Database Backups

**Automated Backups:**
```bash
# Daily backup
pg_dump -U photocopy_user photocopy_shop > backup_$(date +%Y%m%d).sql
```

---

## 🐛 Common Issues & Solutions

### Issue: Profit Calculations Wrong

**Diagnosis:**
```bash
# Check BillItem.costTotal is set
docker exec photocopy_backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.billItem.findFirst().then(bi => console.log(bi));
"
```

**Solution:**
- Ensure Product.cost is set
- Verify billController.js captures cost
- Recalculate for historical bills if needed

### Issue: Login Fails

**Diagnosis:**
```bash
# Check user has username
docker exec photocopy_backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst().then(u => console.log(u));
"
```

**Solution:**
```bash
# Reset admin credentials
# See README.md Troubleshooting section
```

### Issue: Frontend Can't Connect to Backend

**Diagnosis:**
```bash
# Check backend is running
curl http://localhost:8069/health

# Check CORS configuration
docker compose logs backend | grep -i cors
```

**Solution:**
- Update backend/.env CORS_ORIGIN
- Restart backend container
- Rebuild if needed

### Issue: Expenses Not Showing

**Diagnosis:**
```bash
# Check Expense table exists
docker exec photocopy_backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.expense.count().then(c => console.log('Expenses:', c));
"
```

**Solution:**
```bash
# Run migrations
docker exec photocopy_backend npx prisma db push

# Regenerate Prisma Client
docker exec photocopy_backend npx prisma generate
```

---

## 📊 Business Rules Reference

### Profit Calculation Formulas

**Per Sale:**
```
Gross Profit = Sale Amount - (Quantity × Product Cost)
```

**Dashboard (Daily):**
```
Revenue = Σ(bill.total) for today's paid bills
COGS = Σ(billItem.costTotal) for today's bills
Gross Profit = Revenue - COGS
Total Expenses = Σ(expense.amount) for today
Net Profit = Gross Profit - Total Expenses
Profit Margin = (Net Profit / Revenue) × 100
```

**P&L Report (Period):**
```
Total Revenue = Σ(bill.total) for period
Gross Profit = Total Revenue - Σ(billItem.costTotal)
Net Profit = Gross Profit - Σ(expense.amount)
Profit Margin = (Net Profit / Total Revenue) × 100
```

### User Roles & Permissions

| Action | Admin | Cashier |
|--------|-------|---------|
| View Dashboard | ✅ | ✅ |
| Create Sales | ✅ | ✅ |
| Manage Expenses | ✅ | ❌ |
| Create Products | ✅ | ❌ |
| Edit Products | ✅ | ❌ |
| Delete Products | ✅ | ❌ |
| Manage Customers | ✅ | ✅ |
| View P&L Reports | ✅ | ✅ |
| Manage Settings | ✅ | ❌ |
| Manage Users | ✅ | ❌ |

---

## 🎯 Extension Guidelines

### Adding New Expense Categories

1. **Update schema.prisma:**
```prisma
enum ExpenseCategory {
  OPERATING
  SUPPLIES
  STAFF
  YOUR_NEW_CATEGORY
}
```

2. **Update validation in expenseController.js**

3. **Add to frontend category dropdown**

### Adding New Report Types

1. **Create controller function:**
```javascript
exports.getYourReport = async (req, res) => {
  // Report logic
};
```

2. **Add route:**
```javascript
router.get('/your-report', authenticate, reportController.getYourReport);
```

3. **Add API service:**
```javascript
getYourReport: (params) => api.get('/reports/your-report', { params })
```

4. **Create UI in Reports page**

---

## 📚 Additional Resources

### Official Documentation
- [Prisma](https://www.prisma.io/docs)
- [React](https://react.dev)
- [Express](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Docker](https://docs.docker.com)

### Project-Specific Docs
- `README.md` - User-facing documentation
- `PROJECT_STRUCTURE.md` - Detailed file breakdown
- `IMPLEMENTATION_SUMMARY.md` - Feature history
- `CREDIT_TRACKING_*.md` - Credit system details
- `PDF_*.md` - PDF generation details

---

## 💬 Tips for AI Assistants

### When Modifying Code

1. **ALWAYS** consider profit calculation implications
2. **NEVER** change Product.cost without understanding impact
3. **ALWAYS** test with both admin and cashier roles
4. **NEVER** remove cost tracking from bills
5. **ALWAYS** maintain backward compatibility

### Before Making Changes

1. Read existing implementations
2. Follow established patterns
3. Consider database migrations
4. Test in Docker environment
5. Update documentation

### Code Style

- Use async/await over promises
- Handle errors gracefully
- Add console.error for debugging
- Follow existing naming conventions
- Comment complex business logic

---

## 🔄 Version History

**Current Version:** 2.0.0

**Major Features Added:**
- Expense tracking system
- Profit management & P&L reports
- Username + PIN authentication
- Professional login page redesign
- Cost capture at sale time

---

**Last Updated:** May 4, 2026

**Maintained By:** Development Team

---

*This document is maintained for AI assistants working on this codebase. For user-facing documentation, see README.md*
