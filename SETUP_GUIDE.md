# Photocopy Shop Management System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v15 or higher)
- **npm** or **yarn**
- **Git** (optional, for version control)

## Installation Steps

### 1. Clone/Download the Project

```bash
cd /path/to/your/projects
```

The project should be at: `/mnt/d/code/own/photocopy-shop`

### 2. Install PostgreSQL (if not already installed)

#### Windows:
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS:
```bash
brew install postgresql@15
brew services start postgresql@15
```

### 3. Create Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Or on Windows/Mac:
psql -U postgres
```

Then run:
```sql
CREATE USER photocopy_user WITH PASSWORD 'photocopy_pass';
CREATE DATABASE photocopy_shop OWNER photocopy_user;
GRANT ALL PRIVILEGES ON DATABASE photocopy_shop TO photocopy_user;
\q
```

### 4. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed (default values should work for local setup)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with default data
npm run seed
```

Expected output from seed:
```
🌱 Starting database seed...
✅ Created admin user: { pin: '1234', name: 'Admin User', role: 'admin' }

📦 Creating category: Stationery
  ✓ Pen (Blue) - ₹5
  ✓ Pen (Black) - ₹5
  ✓ Pencil - ₹3
  ✓ Notebook (200 pages) - ₹50
  ✓ A4 Paper Ream (500 sheets) - ₹250
  ✓ Eraser - ₹5

... (more products)

👤 Created customer: John Doe (9876543210)
👤 Created customer: Jane Smith (9123456789)
👤 Created customer: Bob Johnson (9988776655)

✨ Database seeding completed successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Default Login Credentials:
   PIN: 1234
   Role: Admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env if needed (default: VITE_API_URL=http://localhost:8069)
```

## Running the Application

### Option 1: Run Both Services (Recommended for Development)

Open **two** terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖨️  Photocopy Shop Management System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port 8069
🌍 Environment: development
📍 API Base: /api/photocopy
🔗 Health Check: http://localhost:8069/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Option 2: Run Backend Only (Production Build)

```bash
# Build frontend
cd frontend
npm run build

# Serve backend (it will serve the built frontend)
cd ../backend
npm start
```

## Access the Application

1. **Open your browser** and go to: **http://localhost:5173**

2. **Login with default PIN:**
   - PIN: `1234`
   - This is an admin account with full access

## Testing the Application

### 1. Test Login
- Go to http://localhost:5173
- Enter PIN: `1234`
- You should be redirected to the Dashboard

### 2. Test Dashboard
- View today's sales statistics
- Check recent bills
- Navigate using the navbar

### 3. Test Sales/POS
- Click on "Sales" in the navbar
- Select a category (e.g., "Stationery")
- Click on products to add them to cart
- Adjust quantities in the cart
- Select "Guest Customer" or search for a customer
- Click "Complete Sale"
- Fill in payment details and submit

### 4. Test Inventory
- Navigate to "Inventory"
- View all products with stock levels
- Filter by category or search
- As admin, click "Add Product" to create new products
- Check low stock indicators

### 5. Test Customers
- Navigate to "Customers"
- View all customers with credit balances
- Click on a customer to see details
- Record a payment for a customer with credit

### 6. Test Reports
- Navigate to "Reports"
- Generate daily sales report
- Generate sales report for date range
- View inventory status report

## API Testing (Optional)

You can test the API directly using curl or Postman:

### Health Check
```bash
curl http://localhost:8069/health
```

### Login
```bash
curl -X POST http://localhost:8069/api/photocopy/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'
```

### Get Products (requires token)
```bash
curl http://localhost:8069/api/photocopy/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### Issue: Port Already in Use

**Backend (8069):**
```bash
# Find process using port 8069
lsof -i :8069
# Kill the process
kill -9 PID
```

**Frontend (5173):**
```bash
# Find process using port 5173
lsof -i :5173
# Kill the process
kill -9 PID
```

### Issue: Database Connection Error

1. Check PostgreSQL is running:
```bash
sudo service postgresql status
# or
sudo systemctl status postgresql
```

2. Verify database exists:
```bash
psql -U postgres -c "\l" | grep photocopy
```

3. Check backend/.env DATABASE_URL matches your setup

### Issue: Prisma Migration Fails

```bash
cd backend
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or manually drop and recreate
dropdb photocopy_shop
createdb photocopy_shop -O photocopy_user
npx prisma migrate dev
npm run seed
```

### Issue: Frontend Can't Connect to Backend

1. Check backend is running: http://localhost:8069/health
2. Check frontend/.env has correct VITE_API_URL
3. Check CORS settings in backend/src/config/config.js

### Issue: Login Not Working

1. Verify database was seeded:
```bash
cd backend
npx prisma studio
# Open http://localhost:5555 and check User table
```

2. Reseed if needed:
```bash
npm run seed
```

## Development Tips

### Backend Development
- Server auto-restarts with `npm run dev` (nodemon)
- Prisma Studio for database GUI: `npm run prisma:studio`
- API base URL: http://localhost:8069/api/photocopy

### Frontend Development
- Vite dev server with HMR
- React DevTools extension recommended
- Browser console for debugging

### Database Management
```bash
cd backend

# View database in GUI
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format Prisma schema
npx prisma format
```

## Production Deployment

For production deployment, consider:

1. **Use Docker** (recommended):
   ```bash
   docker-compose up -d
   ```

2. **Environment Variables**:
   - Change JWT_SECRET in backend/.env
   - Set NODE_ENV=production
   - Use production database URL

3. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

4. **Security**:
   - Change default admin PIN
   - Enable HTTPS
   - Configure firewall rules
   - Regular database backups

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main README.md
3. Check browser console for frontend errors
4. Check terminal output for backend errors

## Features Checklist

After setup, you should have:
- ✅ PIN-based authentication (4-digit)
- ✅ Dashboard with today's statistics
- ✅ Point of Sale (POS) system
- ✅ Inventory management with low stock alerts
- ✅ Customer management with credit tracking
- ✅ Payment recording
- ✅ Sales reports (daily, date range, inventory)
- ✅ User roles (Admin, Cashier)
- ✅ Responsive design

Enjoy using your Photocopy Shop Management System! 🖨️
