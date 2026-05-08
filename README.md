# 🖨️ Photocopy Shop Management System

A comprehensive full-stack web application for managing photocopy shop operations with advanced features including **expense tracking**, **profit management**, **credit tracking**, and **PDF billing**.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-supported-brightgreen.svg)](https://www.docker.com/)
[![Vercel](https://img.shields.io/badge/deploy%20to-vercel-blue.svg)](https://vercel.com/)
[![Neon](https://img.shields.io/badge/database-neon-green.svg)](https://neon.tech/)
[![React](https://img.shields.io/badge/react-19-blue.svg)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/node-18-green.svg)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [User Guide](#-user-guide)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 💰 **Sales & Billing**
- **Point of Sale (POS)** - Quick sales interface with product search
- **Customer Billing** - Support for guest and registered customers
- **Payment Tracking** - Cash, online, and credit payments
- **PDF Generation** - Professional bills with company branding
- **Multiple Payment Methods** - Split payments across different methods

### 📦 **Inventory Management**
- **Product Catalog** - Organized by categories
- **Stock Tracking** - Real-time inventory levels
- **Low Stock Alerts** - Automatic notifications for low stock
- **Price History** - Track price changes over time
- **Service Items** - Support for both physical products and services

### 👥 **Customer Management**
- **Customer Profiles** - Name, contact, address information
- **Credit Tracking** - Track customer credit balances
- **Payment History** - Complete payment records
- **Credit Limits** - Set and manage credit limits
- **Balance Tracking** - Real-time credit balance updates

### 💸 **Expense Tracking** ⭐ NEW
- **Operating Expenses** - Rent, electricity, internet, utilities
- **Supply Expenses** - Paper, ink, toner, binding materials
- **Staff Expenses** - Salaries, wages, bonuses
- **Expense Categories** - Organized by type for easy filtering
- **Date Range Filtering** - View expenses by any time period
- **Receipt & Reference Tracking** - Keep records of all expenses

### 📊 **Profit Management** ⭐ NEW
- **Real-time Profit Calculation** - Automatic profit tracking on every sale
- **Cost of Goods Sold (COGS)** - Tracked at time of sale
- **Gross Profit** - Revenue minus COGS
- **Net Profit** - Gross profit minus all expenses
- **Profit Margins** - Percentage calculations
- **Daily Profit Dashboard** - Today's profitability at a glance
- **Profit & Loss Reports** - Comprehensive P&L statements

### 📈 **Reporting**
- **Daily Sales Reports** - Detailed daily breakdown
- **Sales Over Time** - Track sales trends by day/month
- **Inventory Reports** - Stock status and valuation
- **Profit & Loss Statements** - Complete financial analysis ⭐ NEW
- **Category-wise Analysis** - Sales and profit by product category
- **Expense Breakdown** - Operating, supply, and staff expenses

### 🔐 **Authentication & Security**
- **Username + PIN Login** - Secure two-factor authentication
- **Role-Based Access** - Admin and Cashier roles
- **JWT Tokens** - Secure API authentication
- **PIN Hashing** - Bcrypt encryption for credentials
- **Session Management** - Automatic token refresh

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI Framework |
| Vite | 8.0.7 | Build Tool |
| React Router | 7.14.0 | Routing |
| Tailwind CSS | 3.4.19 | Styling |
| Axios | 1.14.0 | HTTP Client |
| React Hook Form | 7.72.1 | Form Management |
| jsPDF | 4.2.1 | PDF Generation |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.2.1 | Web Framework |
| Prisma ORM | 6.19.3 | Database ORM |
| PostgreSQL | 15 | Database |
| JWT | 9.0.3 | Authentication |
| Bcryptjs | 3.0.3 | Password Hashing |
| Express Validator | 7.3.2 | Input Validation |
| Multer | 2.1.1 | File Uploads |

### **DevOps**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Vercel** - Serverless deployment platform ⭐ NEW
- **Neon** - Serverless PostgreSQL database ⭐ NEW
- **Nginx** (Optional) - Reverse proxy

---

## 🚀 Quick Start

### Choose Your Deployment Method

**🔥 For Production (Recommended):**
- **[Vercel + Neon](#-vercel--neon-deployment-recommended)** - Modern serverless hosting with excellent performance and free tiers

**🐳 For Local Development:**
- **[Docker Compose](#-docker-quick-start)** - All-in-one local setup with one command

---

## ☁️ Vercel + Neon Deployment (Recommended)

Deploy your Photocopy Shop to production in under 15 minutes with **free hosting** from Vercel and Neon.

### Why Vercel + Neon?

- **Vercel**: Perfect for React + Node.js apps with automatic deployments, CDN, and serverless functions
- **Neon**: Serverless PostgreSQL with auto-scaling and free tier
- **Free Tier**: Both platforms offer generous free tiers perfect for small shops
- **Performance**: Excellent response times and global CDN
- **Zero DevOps**: No server management, automatic scaling

### Quick Deploy

1. **Set up Neon Database** (5 minutes)
   ```bash
   # 1. Go to https://neon.tech and sign up (free)
   # 2. Create a new project
   # 3. Copy your connection string
   ```

2. **Deploy Backend to Vercel** (5 minutes)
   ```bash
   # 1. Go to https://vercel.com and sign up (free)
   # 2. Import your GitHub repository
   # 3. Configure:
   #    - Root Directory: ./api
   #    - Environment Variables:
   #      DATABASE_URL = (your Neon connection string)
   #      JWT_SECRET = (generate a random string)
   #      CORS_ORIGIN = https://your-frontend.vercel.app
   #      NODE_ENV = production
   # 4. Click Deploy
   ```

3. **Deploy Frontend to Vercel** (5 minutes)
   ```bash
   # 1. Create new project in Vercel (same repo)
   # 2. Configure:
   #    - Framework Preset: Vite
   #    - Root Directory: ./
   #    - Environment Variables:
   #      VITE_API_URL = https://your-backend.vercel.app/api/photocopy
   # 3. Click Deploy
   ```

**That's it! Your shop is live.** 🎉

### Detailed Guide

For step-by-step instructions with screenshots and troubleshooting, see **[DEPLOY_TO_VERCEL.md](DEPLOY_TO_VERCEL.md)**.

---

## 🐳 Docker Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git for version control

### One-Command Setup

```bash
# Clone the repository
git clone <repository-url>
cd photocopy-shop

# Start all services (database, backend, frontend)
docker compose up -d --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8069
# Database: localhost:5432
```

### Default Credentials

```
Username: admin
PIN: 1234
Role: Admin
```

---

## 💻 Development Setup

### Option 1: Docker (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild after changes
docker compose up -d --build
```

### Option 2: Local Development

#### **Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npm run seed

# Start development server
npm run dev
# Backend runs on http://localhost:8069
```

#### **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

#### **Database Setup**

```bash
cd backend

# Start PostgreSQL (Docker)
docker run -d \
  --name postgres \
  -e POSTGRES_USER=photocopy_user \
  -e POSTGRES_PASSWORD=photocopy_pass \
  -e POSTGRES_DB=photocopy_shop \
  -p 5432:5432 \
  postgres:15-alpine

# Or use Prisma Studio to manage database
npx prisma studio
```

---

## 🗄️ Database Schema

### Core Models

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  pin       String
  name      String
  role      String   // admin, cashier
  isActive  Boolean  @default(true)
  bills     Bill[]
  payments  Payment[]
  priceChanges PriceHistory[]
}

model Product {
  id          Int           @id
  name        String
  categoryId  Int
  price       Decimal
  cost        Decimal       // Required for profit calculation
  stock       Int
  isService   Boolean
  billItems   BillItem[]
  priceHistory PriceHistory[]
}

model Bill {
  id             Int       @id
  billNumber     String    @unique
  billDate       DateTime
  customerId     Int?
  subtotal       Decimal
  tax            Decimal
  discount       Decimal
  total          Decimal
  paymentStatus  String    // paid, credit, partial
  items          BillItem[]
  payments       Payment[]
}

model BillItem {
  id          Int      @id
  billId      Int
  productId   Int
  quantity    Decimal
  unitPrice   Decimal
  unitCost    Decimal?   // Cost at time of sale
  costTotal   Decimal?   // Total cost for line item
  subtotal    Decimal
}

model Expense {
  id              Int         @id
  category        ExpenseCategory  // OPERATING, SUPPLIES, STAFF
  title           String
  amount          Decimal
  expenseDate     DateTime
  paymentMethod   String?
  referenceNumber String?
}

model Customer {
  id             Int       @id
  name           String
  phone          String?   @unique
  creditBalance  Decimal
  unpaidBills    Int
  bills          Bill[]
  payments       Payment[]
}
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8069/api/photocopy
```

### Authentication
All endpoints (except login) require JWT token:
```
Authorization: Bearer <token>
```

### Endpoints

#### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with username + PIN |
| GET | `/auth/me` | Get current user info |

#### **Dashboard**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get profit metrics and stats |

#### **Products**
| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/products` | List all products | ❌ |
| POST | `/products` | Create product | ✅ |
| GET | `/products/:id` | Get product details | ❌ |
| PUT | `/products/:id` | Update product | ✅ |
| DELETE | `/products/:id` | Delete product | ✅ |
| GET | `/products/:id/price-history` | Price history | ❌ |
| PATCH | `/products/:id/stock` | Quick stock adjustment | ✅ |
| PUT | `/products/:id/stock` | Update stock | ✅ |

#### **Categories**
| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/categories` | List all categories | ❌ |
| POST | `/categories` | Create category | ✅ |
| PUT | `/categories/:id` | Update category | ✅ |
| DELETE | `/categories/:id` | Delete category | ✅ |

#### **Customers**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List all customers |
| POST | `/customers` | Create customer |
| GET | `/customers/:id` | Get customer details |
| PUT | `/customers/:id` | Update customer |
| POST | `/customers/:id/payments` | Record payment |

#### **Bills**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bills` | List all bills |
| POST | `/bills` | Create new bill |
| GET | `/bills/:id` | Get bill details |
| DELETE | `/bills/:id` | Delete bill (admin) |

#### **Expenses** ⭐ NEW
| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/expenses` | List all expenses | ❌ |
| POST | `/expenses` | Create expense | ✅ |
| GET | `/expenses/:id` | Get expense details | ❌ |
| PUT | `/expenses/:id` | Update expense | ✅ |
| DELETE | `/expenses/:id` | Delete expense | ✅ |

#### **Reports**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/daily` | Daily sales report |
| GET | `/reports/sales` | Sales over date range |
| GET | `/reports/inventory` | Inventory status report |
| GET | `/reports/profit-loss` | Profit & Loss statement ⭐ NEW |

#### **Settings**
| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/settings/shop` | Get shop settings | ❌ |
| PUT | `/settings/shop` | Update shop settings | ✅ |
| POST | `/settings/logo` | Upload shop logo | ✅ |
| POST | `/settings/change-pin` | Change user PIN | ✅ |

---

## 📖 User Guide

### Admin Workflow

1. **Login** with username and PIN
2. **Dashboard** - View today's profit metrics
3. **Create Sale** - Add products, select customer, generate bill
4. **Manage Expenses** - Track operating, supply, and staff costs
5. **View Reports** - Analyze profitability with P&L statements
6. **Manage Inventory** - Add products, update stock, change prices
7. **Manage Customers** - Create profiles, track credit, record payments

### Cashier Workflow

1. **Login** with assigned credentials
2. **Create Sales** - Process customer transactions
3. **View Inventory** - Check product availability
4. **Generate Bills** - Create PDF bills for customers
5. **View Reports** - Access limited reports

### Profit Analysis

**Dashboard Metrics:**
- **Today's Revenue** - Total sales for today
- **Cost of Goods Sold** - Product costs for today's sales
- **Gross Profit** - Revenue minus COGS
- **Net Profit** - Gross profit minus all expenses
- **Profit Margin** - Net profit as percentage of revenue

**P&L Statement:**
- Select date range
- View revenue breakdown by category
- Analyze COGS by product
- Review expense breakdown
- Understand profitability trends

---

## 📁 Project Structure

```
photocopy-shop/
├── frontend/                      # React.js Frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   │   ├── auth/             # Authentication components
│   │   │   │   └── LoginForm.jsx
│   │   │   ├── billing/          # Billing components
│   │   │   ├── common/           # Shared components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── inventory/        # Inventory management
│   │   │   ├── layout/           # Layout components
│   │   │   │   └── Navbar.jsx
│   │   │   └── sales/            # Sales components
│   │   ├── context/              # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ShopContext.jsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useApi.js
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Bills.jsx
│   │   │   ├── Expenses.jsx      # ⭐ NEW
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/             # API service layer
│   │   │   └── api.js
│   │   ├── utils/                # Utility functions
│   │   │   ├── currency.js
│   │   │   ├── date.js
│   │   │   └── pdfGenerator.js
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                       # Node.js Backend (for Docker/local)
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                # Configuration
│   │   │   ├── config.js
│   │   │   └── database.js
│   │   ├── controllers/           # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── billController.js
│   │   │   ├── categoryController.js
│   │   │   ├── customerController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── expenseController.js      # ⭐ NEW
│   │   │   ├── productController.js
│   │   │   ├── reportController.js
│   │   │   └── settingsController.js
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.js           # JWT authentication
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── routes/                # API routes
│   │   │   ├── auth.js
│   │   │   ├── bills.js
│   │   │   ├── categories.js
│   │   │   ├── customers.js
│   │   │   ├── dashboard.js
│   │   │   ├── expenses.js       # ⭐ NEW
│   │   │   ├── products.js
│   │   │   ├── reports.js
│   │   │   └── settings.js
│   │   └── server.js             # Express app setup
│   ├── uploads/                   # Uploaded files (logos)
│   ├── .env                       # Environment variables
│   └── package.json
│
├── api/                           # Backend for Vercel Deployment ⭐ NEW
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── config/                    # Configuration
│   ├── controllers/               # Route controllers
│   ├── middleware/                # Express middleware
│   ├── routes/                    # API routes
│   ├── server.js                  # Express app (Vercel-compatible)
│   ├── seed.js                    # Database seeder
│   ├── package.json               # Dependencies
│   └── .env.example               # Environment variables template
│
├── docker-compose.yml             # Docker orchestration
├── vercel.json                    # Vercel configuration ⭐ NEW
├── render.yaml                    # Render configuration
├── .gitignore
├── .env.example                   # Environment variables template
├── README.md                      # This file
├── DEPLOY_TO_VERCEL.md            # Vercel deployment guide ⭐ NEW
├── DEPLOY_TO_RENDER.md            # Render deployment guide
└── CLAUDE.md                      # AI assistant development guide
```

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
# Server
PORT=8069
NODE_ENV=development

# Database
DATABASE_URL="postgresql://photocopy_user:photocopy_pass@localhost:5432/photocopy_shop"

# JWT
JWT_SECRET=your-secret-key-here

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8069
```

### Docker Compose Configuration

```yaml
services:
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: photocopy_user
      POSTGRES_PASSWORD: photocopy_pass
      POSTGRES_DB: photocopy_shop

  backend:
    build: ./backend
    ports:
      - "8069:8069"
    depends_on:
      - database

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

---

## 🚢 Deployment

### Choose Your Deployment Method

**🔥 Production (Recommended):**
- **[Vercel + Neon](#️-vercel--neon-deployment)** - Free hosting with excellent performance
  - Step-by-step guide: **[DEPLOY_TO_VERCEL.md](DEPLOY_TO_VERCEL.md)**
  - Free tier available
  - Automatic deployments
  - Global CDN

**🐳 Local Development:**
- **[Docker Compose](#-docker-deployment)** - All-in-one local setup
  - Best for development
  - Full offline capability
  - Easy testing

**☁️ Alternative Production:**
- **[Render](#️-render-deployment)** - Alternative cloud platform
  - Step-by-step guide: **[DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md)**
  - Free tier available
  - Simple setup

---

## ☁️ Vercel + Neon Deployment

**Status**: ✅ Recommended for Production

**Cost**: Free tier available (perfect for small shops)

**Deployment Time**: ~15 minutes

**Guide**: See **[DEPLOY_TO_VERCEL.md](DEPLOY_TO_VERCEL.md)** for complete step-by-step instructions.

### Quick Summary

1. **Set up Neon Database** (5 min)
   - Go to https://neon.tech
   - Create free account
   - Create new project
   - Copy connection string

2. **Deploy Backend** (5 min)
   - Go to https://vercel.com
   - Import GitHub repo
   - Root dir: `./api`
   - Add env vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV`
   - Deploy

3. **Deploy Frontend** (5 min)
   - Create new Vercel project
   - Root dir: `./`
   - Framework: Vite
   - Add env var: `VITE_API_URL`
   - Deploy

**Benefits:**
- ✅ Free tier (both platforms)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Zero devops
- ✅ Git-based deployments

---

## 🐳 Docker Deployment

```bash
# Build and start
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Restart services
docker compose restart
```

### Production Considerations

1. **Environment Variables**: Use strong JWT_SECRET
2. **Database**: Use managed PostgreSQL service (Neon recommended)
3. **HTTPS**: Use reverse proxy (Nginx) with SSL
4. **Backups**: Regular database backups
5. **Monitoring**: Set up logging and monitoring

---

## 🌐 Render Deployment

**Status**: ✅ Alternative for Production

**Cost**: Free tier available

**Deployment Time**: ~20 minutes

**Guide**: See **[DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md)** for complete instructions.

### Quick Summary

Render provides free hosting for web services, databases, and static sites.

1. Fork this repository
2. Create Render account at https://render.com
3. Deploy using `render.yaml` configuration
4. Set environment variables
5. Your app is live!

**Benefits:**
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Simple setup with render.yaml
- ✅ Good performance

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart database
docker compose restart database
```

**2. Frontend Can't Connect to Backend**
```bash
# Check CORS_ORIGIN in backend/.env
# Verify backend is running
curl http://localhost:8069/health
```

**3. Login Fails**
```bash
# Reset admin PIN
docker exec photocopy_backend node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  await prisma.user.update({
    where: { id: 1 },
    data: { pin: await bcrypt.hash('1234', 10) }
  });
  console.log('PIN reset to 1234');
})();
"
```

**4. Prisma Errors**
```bash
# Regenerate Prisma Client
docker exec photocopy_backend npx prisma generate

# Push schema changes
docker exec photocopy_backend npx prisma db push
```

**5. Port Already in Use**
```bash
# Check what's using the port
lsof -i :5173
lsof -i :8069

# Kill the process
kill -9 <PID>
```

---

## 📝 License

ISC

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for photocopy shops**
