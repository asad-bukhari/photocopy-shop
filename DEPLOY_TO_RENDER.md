# 🚀 Deploy to Render - Complete Guide

This guide will walk you through deploying the Photocopy Shop Management System to Render.com with free PostgreSQL database.

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account with code pushed to https://github.com/asad-bukhari/photocopy-shop
- [ ] Render account (sign up at https://dashboard.render.com/register)
- [ ] 15-20 minutes of time

---

## 🎯 Deployment Architecture

```
Your Browser
    ↓
Frontend (Render Web Service) - https://your-app.onrender.com
    ↓ (API calls)
Backend (Render Web Service) - https://your-api.onrender.com
    ↓
Database (Render PostgreSQL) - Internal connection
```

---

## 📝 Step-by-Step Guide

### Step 1: Create Render Account

1. **Go to:** https://dashboard.render.com/register
2. **Sign up** using:
   - GitHub account (recommended) - Click "Sign up with GitHub"
   - Or use email/password
3. **Verify email** if prompted
4. **You're now in the Render Dashboard**

---

### Step 2: Create PostgreSQL Database

1. **In Render Dashboard, click:** "New +" button
2. **Select:** "PostgreSQL"
3. **Database Configuration:**
   ```
   Name: photocopy-shop-db
   Database: photocopy_shop
   User: photocopy_user (auto-generated)
   Region: Oregon (us-west) or Singapore (ap-southeast)
   PostgreSQL Version: 15
   Plan: Free (90 days)
   ```
4. **Click:** "Create Database"
5. **Wait:** 2-3 minutes for database to be ready
6. **IMPORTANT:** Copy these credentials (you'll need them later):
   - **Internal Database URL** (starts with `postgresql://`)
   - **External Database URL**
   - **Database User**
   - **Password**

**Save these credentials somewhere safe!**

---

### Step 3: Prepare Environment Variables

Create a file with your environment variables. You'll need these for both services:

**For Backend:**
```env
PORT=8069
NODE_ENV=production
DATABASE_URL=<from Step 2 - Internal Database URL>
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

**For Frontend:**
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

**Generate a secure JWT_SECRET:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use an online generator:
# https://generate-secret.vercel.app/32
```

---

### Step 4: Deploy Backend

1. **In Render Dashboard, click:** "New +" → "Web Service"

2. **Connect GitHub:**
   - Click "Connect GitHub"
   - Authorize Render to access your repositories
   - Find and select: `asad-bukhari/photocopy-shop`
   - Click "Connect"

3. **Configure Web Service:**
   ```
   Name: photocopy-shop-backend
   Environment: Docker
   Root Directory: backend
   Dockerfile Path: ./Dockerfile
   Region: Same as database (Oregon or Singapore)
   Branch: main
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"

   Add these:
   ```
   Name: PORT
   Value: 8069

   Name: NODE_ENV
   Value: production

   Name: DATABASE_URL
   Value: <your Internal Database URL from Step 2>

   Name: JWT_SECRET
   Value: <your generated JWT secret>

   Name: CORS_ORIGIN
   Value: https://photocopy-shop-frontend.onrender.com
   ```

5. **Click:** "Create Web Service"

6. **Wait:** 5-10 minutes for deployment
   - Watch the build logs
   - When it says "Live" - backend is deployed!

7. **Copy your backend URL:**
   - It will look like: `https://photocopy-shop-backend.onrender.com`

---

### Step 5: Deploy Frontend

1. **In Render Dashboard, click:** "New +" → "Web Service" again

2. **Use same repository:** `asad-bukhari/photocopy-shop`

3. **Configure Frontend Web Service:**
   ```
   Name: photocopy-shop-frontend
   Environment: Docker
   Root Directory: frontend
   Dockerfile Path: ./Dockerfile
   Region: Same as backend
   Branch: main
   ```

4. **Add Environment Variable:**
   ```
   Name: VITE_API_URL
   Value: https://photocopy-shop-backend.onrender.com
   ```

5. **Click:** "Create Web Service"

6. **Wait:** 5-10 minutes for frontend deployment

---

### Step 6: Verify Deployment

1. **Open your frontend URL:**
   - `https://photocopy-shop-frontend.onrender.com`

2. **You should see:** Login page

3. **Login with:**
   ```
   Username: admin
   PIN: 1234
   ```

4. **If login works:** 🎉 Deployment successful!

---

### Step 7: Post-Deployment Setup

#### **7.1 Run Database Migrations**

Since we're using Docker with `npx prisma generate` in the Dockerfile, Prisma will automatically create tables. But we need to verify:

1. **Go to Backend Service** in Render Dashboard
2. **Click:** "Jobs" → "New Job"
3. **Configure:**
   ```
   Name: db-push
   Environment: Docker
   Command: npx prisma db push
   Working Directory: /app
   ```
4. **Add environment variables** (same as backend)
5. **Run:** This job to sync the database schema

#### **7.2 Update Admin User Username**

1. **Go to Backend Service** → "Shell"
2. **Run this command:**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const hashedPIN = await bcrypt.hash('1234', 10);
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: { pin: hashedPIN },
      create: {
        username: 'admin',
        pin: hashedPIN,
        name: 'Admin User',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✅ Admin user ready');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
```

3. **Click:** "Run Shell"

---

## 🔧 Configuration Files (Already Created)

### render.yaml (Optional - For Automatic Deployment)

If you want automatic deployments when you push to GitHub:

**File:** `render.yaml` (in project root)

```yaml
services:
  # Backend Service
  - type: web
    name: photocopy-shop-backend
    env: docker
    dockerContext: ./backend
    dockerfilePath: ./backend/Dockerfile
    plan: free
    region: oregon
    envVars:
      - key: PORT
        value: 8069
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: photocopy-shop-db
          property: connectionString
      - key: JWT_SECRET
        generate: true
      - key: CORS_ORIGIN
        value: https://photocopy-shop-frontend.onrender.com

  # Frontend Service
  - type: web
    name: photocopy-shop-frontend
    env: docker
    dockerContext: ./frontend
    dockerfilePath: ./frontend/Dockerfile
    plan: free
    region: oregon
    envVars:
      - key: VITE_API_URL
        value: https://photocopy-shop-backend.onrender.com

  # PostgreSQL Database
  - type: pserv
    name: photocopy-shop-db
    databaseName: photocopy_shop
    user: photocopy_user
    plan: free
    region: oregon
    maxConnections: 10
```

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ✅ Free for 90 days
- ✅ After 90 days: $7/month
- ⚠️ **Apps spin down** after 15 minutes of inactivity
- ⚠️ **Cold starts** take 30-60 seconds on first request
- ✅ **Spins up** automatically when traffic arrives

**For a photocopy shop:**
- **Perfect for:** Testing, small shops, backup system
- **Not ideal for:** High-traffic shops (upgrade needed)

### SSL/HTTPS

- ✅ **Automatic SSL certificates** included
- ✅ **HTTPS enforced** by default
- ✅ **No configuration needed**

### Database Backups

Render automatically backs up PostgreSQL databases daily.

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health

```bash
curl https://photocopy-shop-backend.onrender.com/health
```

Expected response:
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

### 2. Test Login

```bash
curl -X POST https://photocopy-shop-backend.onrender.com/api/photocopy/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","pin":"1234"}'
```

### 3. Test Frontend

Open your browser and navigate to:
`https://photocopy-shop-frontend.onrender.com`

---

## 📊 Cost Breakdown

### After Free Trial (90 Days)

| Service | Cost |
|---------|------|
| PostgreSQL Database | $7/month |
| Backend Web Service | $0/month (free tier) |
| Frontend Web Service | $0/month (free tier) |
| **Total** | **$7/month** |

### When to Upgrade

**Upgrade to paid tier when:**
- You need faster cold starts
- You have consistent daily traffic
- You need more database connections
- You want better performance

---

## 🔄 Updating Your Application

### Automatic Updates (if using render.yaml)

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render will automatically deploy! ✅

### Manual Updates

1. Push changes to GitHub
2. Go to Render Dashboard
3. Click "Manual Deploy" on the service
4. Select branch and commit
5. Click "Deploy"

---

## 🐛 Troubleshooting

### Issue: "Database Connection Failed"

**Solution:**
1. Check DATABASE_URL in backend env vars
2. Verify database is "Suspended" or "Available"
3. Re-deploy backend with correct DATABASE_URL

### Issue: "CORS Error"

**Solution:**
Update CORS_ORIGIN in backend environment:
```
CORS_ORIGIN=https://photocopy-shop-frontend.onrender.com
```

### Issue: "Login Failed"

**Solution:**
1. Check backend logs in Render Dashboard
2. Verify JWT_SECRET is set
3. Run the admin user setup command (Step 7.2)

### Issue: "App is Sleeping"

**Solution:**
- This is normal for free tier
- Just wait 30-60 seconds for it to wake up
- Upgrade to paid plan to keep it always on

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** - Create sales, add expenses, generate reports
2. **Set up monitoring** - Enable Render logs
3. **Configure domain** (optional) - Use custom domain
4. **Set up backups** - Render does this automatically
5. **Monitor costs** - Check usage after 90 days

---

## 📞 Support

If you encounter issues:
1. Check Render logs in the Dashboard
2. Check this guide's troubleshooting section
3. Review Render documentation: https://render.com/docs

---

## 🚀 Ready to Deploy?

Follow the steps above and you'll have your application online in **15-20 minutes**!

**URL Preview:**
- Backend: `https://photocopy-shop-backend.onrender.com`
- Frontend: `https://photocopy-shop-frontend.onrender.com`

**Let me know if you want to proceed with the deployment!**
