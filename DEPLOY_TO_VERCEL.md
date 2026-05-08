# Deploy Photocopy Shop to Vercel + Neon

This guide will walk you through deploying the Photocopy Shop Management System to production using **Vercel** (for hosting) and **Neon** (for PostgreSQL database).

## Why Vercel + Neon?

- **Vercel**: Excellent for React + Node.js applications with automatic deployments, CDN, and serverless functions
- **Neon**: Serverless PostgreSQL with auto-scaling, free tier, and excellent performance
- **Perfect Stack**: React 19 frontend + Express.js backend + PostgreSQL database

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Neon Account** - Sign up at [neon.tech](https://neon.tech) (free tier available)

---

## Step 1: Set Up Neon Database

### 1.1 Create Neon Project

1. Go to [neon.tech](https://neon.tech) and sign in
2. Click **"Create a project"**
3. Configure your project:
   - **Project Name**: `photocopy-shop-db` (or any name you prefer)
   - **Region**: Choose the closest region to your users
   - **PostgreSQL Version**: Leave as default (16)
4. Click **"Create project"**

### 1.2 Get Connection String

1. After creation, you'll see your project dashboard
2. Copy the **Connection string** (looks like):
   ```
   postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/photocopy-shop?sslmode=require
   ```
3. Save this string - you'll need it for Vercel

### 1.3 Run Database Migrations

You need to set up the database schema. You have two options:

**Option A: Using Prisma Migrate (Recommended)**

1. Install dependencies:
   ```bash
   cd api
   npm install
   ```

2. Set your DATABASE_URL temporarily:
   ```bash
   export DATABASE_URL="your-neon-connection-string"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

**Option B: Using Prisma Studio (GUI)**

1. Run Prisma Studio:
   ```bash
   cd api
   export DATABASE_URL="your-neon-connection-string"
   npx prisma studio
   ```

2. The browser will open showing your database
3. Prisma will automatically create the schema on first connection

### 1.4 Seed Initial Data (Optional)

To create the default admin user:

```bash
cd api
node seed.js
```

Default admin credentials:
- **Username**: `admin`
- **PIN**: `1234`

---

## Step 2: Deploy Backend to Vercel

### 2.1 Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository: `your-username/photocopy-shop`
4. Configure the project:

   **Framework Preset**: Other
   - **Root Directory**: `./api`
   - **Build Command**: (leave empty for API-only)

   **Environment Variables** (click "Add New" for each):
   ```
   DATABASE_URL = (paste your Neon connection string)
   JWT_SECRET = (generate a secure random string)
   CORS_ORIGIN = (will be your frontend URL later, use * for now)
   NODE_ENV = production
   ```

5. Click **"Deploy"**

### 2.2 Generate JWT Secret

To generate a secure JWT_SECRET, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your JWT_SECRET.

### 2.3 Get Your Backend URL

After deployment completes:
1. Vercel will show your deployment URL (e.g., `https://photocopy-api.vercel.app`)
2. Copy this URL - you'll need it for the frontend

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Import Frontend Project

1. In Vercel dashboard, click **"Add New Project"**
2. Import the **same** GitHub repository
3. Configure:

   **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`

   **Environment Variables**:
   ```
   VITE_API_URL = https://your-backend-url.vercel.app/api/photocopy
   ```

   Replace `your-backend-url` with your actual backend URL from Step 2.3

4. Click **"Deploy"**

### 3.2 Get Your Frontend URL

After deployment:
1. Copy your frontend URL (e.g., `https://photocopy-shop.vercel.app`)

### 3.3 Update Backend CORS

1. Go back to your **Backend** project in Vercel
2. Go to **Settings → Environment Variables**
3. Update `CORS_ORIGIN` to your frontend URL:
   ```
   CORS_ORIGIN = https://photocopy-shop.vercel.app
   ```
4. Redeploy the backend (changes will auto-deploy)

---

## Step 4: Verify Deployment

### 4.1 Test Backend

1. Visit your backend URL + `/health`
   - Example: `https://your-backend.vercel.app/health`
   - Should return: `{"success":true,"message":"Server is running"...}`

2. Test login endpoint:
   ```bash
   curl -X POST https://your-backend.vercel.app/api/photocopy/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","pin":"1234"}'
   ```
   - Should return a JWT token

### 4.2 Test Frontend

1. Visit your frontend URL
2. You should see the login page
3. Login with:
   - **Username**: `admin`
   - **PIN**: `1234`
4. You should see the dashboard

---

## Step 5: Post-Deployment Configuration

### 5.1 Update Admin Credentials (Important!)

After first login, change your admin PIN:

1. Go to **Settings** in the app
2. Change the admin PIN to something secure
3. Remove the seed.js file or disable it

### 5.2 Configure Shop Settings

1. Go to **Settings**
2. Update shop name, address, phone, email
3. Upload shop logo if needed

### 5.3 Add Initial Data

1. **Categories**: Add product categories (Paper, Binding, Lamination, etc.)
2. **Products**: Add products with prices and costs
3. **Customers**: Add regular customers if any
4. **Users**: Create cashier accounts

---

## Environment Variables Reference

### Backend Environment Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for JWT tokens | `abc123...` |
| `CORS_ORIGIN` | Frontend URL (for CORS) | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment | `production` |

### Frontend Environment Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-api.vercel.app/api/photocopy` |

---

## Troubleshooting

### Issue 1: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
1. Verify DATABASE_URL is correct in Vercel
2. Check Neon database is active (not paused)
3. Ensure connection string includes `?sslmode=require`

### Issue 2: CORS Error

**Error**: `Access-Control-Allow-Origin` error

**Solution**:
1. Verify CORS_ORIGIN matches your frontend URL exactly
2. Redeploy backend after updating
3. Check backend logs in Vercel dashboard

### Issue 3: Build Failed

**Error**: Deployment failed during build

**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify Prisma schema is valid: `npx prisma validate`

### Issue 4: 404 on API Routes

**Error**: API endpoints return 404

**Solution**:
1. Ensure vercel.json has correct routes configuration
2. Check that `/api` folder structure is correct
3. Verify server.js exports the app: `module.exports = app`

### Issue 5: Login Not Working

**Error**: Login fails with incorrect credentials

**Solution**:
1. Run seed.js to create admin user: `node api/seed.js`
2. Check database has User table and admin record
3. Verify JWT_SECRET is set in Vercel

---

## Maintenance

### Updating Database Schema

When you modify `schema.prisma`:

1. Create migration:
   ```bash
   cd api
   npx prisma migrate dev --name your_migration_name
   ```

2. Deploy migration to production:
   ```bash
   npx prisma migrate deploy
   ```

3. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

4. Commit changes and push to GitHub (Vercel will auto-deploy)

### Viewing Database Data

Use Prisma Studio to view/edit data:

```bash
cd api
export DATABASE_URL="your-neon-connection-string"
npx prisma studio
```

### Monitoring

- **Vercel Dashboard**: View deployment logs, analytics, and errors
- **Neon Dashboard**: Monitor database usage, connections, and performance
- **App Dashboard**: Built-in profit tracking shows business health

---

## Local Development (Still Works!)

You can still use Docker for local development:

```bash
# Start everything with Docker Compose
docker-compose up --build

# Or run individually:
# Backend (local database)
cd backend
npm install
npx prisma migrate dev
npm start

# Frontend
cd frontend
npm install
npm run dev
```

---

## Cost Breakdown

### Free Tier (Current Setup)

- **Vercel**: Free hobby plan
  - 100GB bandwidth/month
  - Serverless functions
  - Automatic deployments from Git

- **Neon**: Free tier
  - 0.5GB storage
  - ~300 hours of compute time/month
  - Auto-suspend when inactive

### When to Upgrade

Consider upgrading when:
- Monthly bandwidth exceeds 100GB
- Database storage exceeds 0.5GB
- You need more than 300 compute hours/month
- You need faster cold starts

Estimated cost for small shop: **$0-20/month**

---

## Security Best Practices

1. **Change Default PIN**: Change admin PIN immediately after first login
2. **Use Strong JWT_SECRET**: Generate a secure random string (32+ characters)
3. **Enable HTTPS**: Vercel provides this automatically
4. **Limit CORS**: Set CORS_ORIGIN to your exact frontend URL
5. **Regular Backups**: Neon provides automated backups
6. **Monitor Usage**: Check Vercel and Neon dashboards regularly

---

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review Vercel deployment logs
3. Check Neon database logs
4. Verify environment variables are set correctly
5. Ensure GitHub repository has the latest code

---

## Next Steps

After successful deployment:

1. **Test All Features**: Create test bills, add expenses, verify profit calculations
2. **Train Users**: Show staff how to use the system
3. **Set Up Backups**: Configure automated backups in Neon
4. **Monitor Performance**: Check Vercel analytics and Neon metrics
5. **Customize**: Add your shop's branding, products, and prices

Congratulations! Your Photocopy Shop Management System is now live on Vercel + Neon! 🎉
