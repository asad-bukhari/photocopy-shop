# Photocopy Shop Management System - Project Structure

## Directory Layout

```
photocopy-shop/
├── backend/                           # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── config.js             # Application configuration
│   │   │   └── database.js           # Prisma client setup
│   │   ├── controllers/              # Request handlers
│   │   │   ├── authController.js     # Authentication logic
│   │   │   ├── billController.js     # Bill creation & management
│   │   │   ├── customerController.js # Customer operations
│   │   │   ├── dashboardController.js # Dashboard statistics
│   │   │   ├── productController.js  # Product CRUD
│   │   │   └── reportController.js   # Report generation
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.js              # JWT authentication
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── validation.js        # Request validation
│   │   ├── routes/                   # API route definitions
│   │   │   ├── auth.js              # /auth endpoints
│   │   │   ├── bills.js             # /bills endpoints
│   │   │   ├── customers.js         # /customers endpoints
│   │   │   ├── dashboard.js         # /dashboard endpoints
│   │   │   ├── products.js          # /products endpoints
│   │   │   └── reports.js           # /reports endpoints
│   │   ├── server.js                # Express app entry point
│   │   └── seed.js                  # Database seeding script
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── Dockerfile
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Environment template
│   └── package.json
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── LoginForm.jsx    # Login page component
│   │   │   ├── common/              # Reusable components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Notification.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── StatCard.jsx     # Dashboard stat card
│   │   │   ├── inventory/
│   │   │   │   └── AddItemModal.jsx # Add product modal
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   │   └── ProtectedRoute.jsx # Auth wrapper
│   │   │   ├── sales/
│   │   │   │   ├── BillSummary.jsx  # Cart summary
│   │   │   │   ├── CartItem.jsx     # Cart item component
│   │   │   │   ├── CustomerSelector.jsx # Customer selection
│   │   │   │   └── ProductGrid.jsx  # Product grid display
│   │   │   └── customers/           # Customer-specific components
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication state
│   │   ├── hooks/
│   │   │   └── useApi.js            # API hook + localStorage hook
│   │   ├── pages/                   # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance + API methods
│   │   ├── utils/
│   │   │   ├── currency.js          # Currency formatting
│   │   │   └── date.js              # Date formatting
│   │   ├── App.jsx                  # Root component with routing
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles + Tailwind
│   ├── Dockerfile
│   ├── .env                         # Environment variables (VITE_API_URL)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS config
│   └── postcss.config.js
│
├── docker-compose.yml               # Docker orchestration
├── README.md                        # Project overview
├── SETUP_GUIDE.md                   # Setup instructions
└── .env.example                     # Root environment template
```

## Key Files Reference

### Backend Core Files

| File | Purpose |
|------|---------|
| `src/server.js` | Express server setup, middleware, route mounting |
| `prisma/schema.prisma` | Database schema (User, Product, Customer, Bill, BillItem, Payment) |
| `src/config/database.js` | Prisma client initialization |
| `src/controllers/authController.js` | PIN login, JWT generation |
| `src/controllers/billController.js` | Bill creation with transaction handling |
| `src/routes/` | API endpoint definitions grouped by resource |

### Frontend Core Files

| File | Purpose |
|------|---------|
| `src/main.jsx` | React entry point, BrowserRouter setup |
| `src/App.jsx` | Route definitions (login, dashboard, sales, etc.) |
| `src/context/AuthContext.jsx` | Authentication state, login/logout methods |
| `src/services/api.js` | Axios instance with auth interceptor |
| `src/pages/` | Main page components |
| `tailwind.config.js` | Tailwind CSS customization |

## Database Schema

### Tables
- **User** - System users (admin/cashier) with hashed PINs
- **Product** - Products/services with pricing and stock
- **Customer** - Customer info with credit balance tracking
- **Bill** - Sales transactions (guest or named customer)
- **BillItem** - Line items for each bill
- **Payment** - Customer payments against credit balance

### Key Relationships
- Customer → Bills (one-to-many)
- Customer → Payments (one-to-many)
- Bill → BillItems (one-to-many)
- Product → BillItems (one-to-many)

## API Endpoints

### Base URL: `/api/photocopy`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with PIN | No |
| GET | `/auth/me` | Get current user | Yes |
| GET | `/dashboard` | Today's stats | Yes |
| GET | `/products` | List products | Yes |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |
| GET | `/customers` | List customers | Yes |
| POST | `/customers` | Create customer | Yes |
| GET | `/customers/:id` | Get customer | Yes |
| POST | `/customers/:id/payments` | Record payment | Yes |
| GET | `/bills` | List bills | Yes |
| POST | `/bills` | Create bill | Yes |
| GET | `/bills/:id` | Get bill | Yes |
| DELETE | `/bills/:id` | Delete bill | Admin |
| GET | `/reports/daily` | Daily report | Yes |
| GET | `/reports/sales` | Sales by date | Yes |
| GET | `/reports/inventory` | Inventory status | Yes |

## Component Hierarchy

```
App
├── Login
└── ProtectedRoute
    └── Layout
        ├── Navbar
        └── Pages
            ├── Dashboard
            │   └── StatCard
            ├── Sales
            │   ├── ProductGrid
            │   ├── CartItem
            │   ├── CustomerSelector
            │   └── BillSummary
            ├── Inventory
            │   └── AddItemModal
            ├── Customers
            │   └── PaymentModal
            └── Reports
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Auth**: JWT + bcrypt
- **Validation**: express-validator

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **HTTP**: Axios
- **Forms**: React Hook Form

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://photocopy_user:photocopy_pass@localhost:5432/photocopy_shop
PORT=8069
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8069
```

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev              # Start with auto-reload
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:migrate   # Run migrations
npm run seed             # Seed database
```

### Frontend Development
```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Database Changes
1. Modify `backend/prisma/schema.prisma`
2. Run: `npx prisma migrate dev --name description`
3. Update backend controllers if needed

### Adding New Features
1. Backend: Add controller → Add route → Test API
2. Frontend: Add API method → Create component → Add route

## Common Patterns

### API Call Pattern
```javascript
// In services/api.js
export const myAPI = {
  getAll: () => api.get('/resource'),
  create: (data) => api.post('/resource', data)
};

// In component
const { data, loading, error } = useApi(myAPI.getAll);
```

### Protected Component Pattern
```javascript
const { isAdmin } = useAuth();

if (!isAdmin()) {
  return <AccessDenied />;
}
```

### Form Handling Pattern
```javascript
const [formData, setFormData] = useState({ field: '' });

const handleSubmit = async () => {
  await apiCall(formData);
  // Handle success/error
};
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `LoginForm.jsx`)
- **Utilities**: camelCase (e.g., `currency.js`)
- **Hooks**: camelCase with `use` prefix (e.g., `useApi.js`)
- **Pages**: PascalCase (e.g., `Dashboard.jsx`)
- **Routes**: lowercase (e.g., `/api/photocopy/products`)

## Git Workflow (Recommended)

```bash
# Feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and merge
git push origin feature/your-feature
```

## Performance Tips

1. **Backend**: Use database indexes on frequently queried fields
2. **Frontend**: Use React.memo for expensive components
3. **API**: Implement pagination for large datasets
4. **Database**: Regular backups and vacuuming

## Security Considerations

1. Never commit `.env` files
2. Change JWT_SECRET in production
3. Use HTTPS in production
4. Regular security updates
5. Input validation on all endpoints
6. Rate limiting on auth endpoints
