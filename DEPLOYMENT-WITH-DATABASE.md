# 🚀 Complete Deployment Guide - FreshGrad Tracker on Render with PostgreSQL

## ✅ What Has Been Fixed

Your app was using **JSON file storage** which resets every time Render restarts (after 15 min idle on free tier).

**Solution**: Added **PostgreSQL database** for persistent data storage.

---

## 📋 What Was Changed

### 1. **New Database Schema** (`server/src/schema.sql`)
- Created PostgreSQL tables for: users, candidates, courses, mentors, notifications, audit_log, corrections
- All your data will now persist permanently in the database

### 2. **New Server File** (`server-db.cjs`)
- Replaced JSON file operations with PostgreSQL queries
- Maintains all existing API endpoints
- Includes database connection pooling and error handling

### 3. **Updated Configuration**
- `package.json`: Added `pg` (PostgreSQL client), updated start command
- `render.yaml`: Added database configuration, linked to web service

---

## 🎯 Deployment Steps (Using Git Bash)

### **Step 1: Install Dependencies Locally (Optional - for testing)**

```bash
cd /c/Users/Firas/Desktop/Tracker-Render
npm install
```

This installs the `pg` package for PostgreSQL.

---

### **Step 2: Build the Frontend**

```bash
npm run build
```

This creates the `dist/` folder with your compiled frontend.

> **Note**: If you don't have a build script, skip this step. The backend will work in API-only mode.

---

### **Step 3: Commit Changes to Git**

Open **Git Bash** and run:

```bash
cd /c/Users/Firas/Desktop/Tracker-Render

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Add PostgreSQL database support for Render deployment"

# Check status
git status
```

---

### **Step 4: Push to GitHub**

```bash
# Add your GitHub repository (replace with your actual repo URL)
git remote add origin https://github.com/lazytitan21/freshgrad-tracker-v2.git

# If remote already exists, update it:
git remote set-url origin https://github.com/lazytitan21/freshgrad-tracker-v2.git

# Push to main branch
git push -u origin main

# If you get authentication errors, you may need to:
# 1. Use GitHub Personal Access Token instead of password
# 2. Or configure SSH keys
```

**GitHub Personal Access Token** (if needed):
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Select scopes: `repo` (all)
- Copy token and use it as password when pushing

---

### **Step 5: Deploy on Render.com**

#### **5.1: Sign Up / Login**
- Go to: https://render.com
- Sign up or login (use GitHub account for easier integration)

#### **5.2: Create PostgreSQL Database FIRST**

**IMPORTANT**: Create database before web service!

1. Click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `freshgrad-tracker-db-v2`
   - **Database**: `freshgrad_tracker_v2`
   - **User**: `freshgrad_user_v2` (or leave default)
   - **Region**: Choose closest (Oregon, Frankfurt, Singapore)
   - **Instance Type**: **Free**
3. Click **"Create Database"**
4. **Wait 2-3 minutes** for database to be ready
5. **IMPORTANT**: Keep the database page open - you'll need the connection info

#### **5.3: Create Web Service**

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** and authorize Render
3. Select your repository: `freshgrad-tracker-v2`
4. Click **"Connect"**

#### **5.4: Configure Web Service**

Render should auto-detect settings from `render.yaml`, but verify:

- **Name**: `freshgrad-tracker-v2`
- **Region**: Same as your database (e.g., Oregon)
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node server-db.cjs`
- **Instance Type**: **Free**

#### **5.5: Add Environment Variables**

Click **"Advanced"** and add:

1. **NODE_ENV**
   - Value: `production`

2. **DATABASE_URL** (CRITICAL)
   - Go back to your database page
   - Copy the **"Internal Database URL"** (faster) or **"External Database URL"**
   - It looks like: `postgresql://user:password@host:port/database`
   - Paste it as the value

#### **5.6: Deploy**

- Click **"Create Web Service"**
- Wait **3-5 minutes** for deployment
- Watch the logs for any errors

---

### **Step 6: Verify Deployment**

#### **6.1: Check Health**
Open: `https://your-app-name.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T...",
  "database": "connected",
  "dbTime": "..."
}
```

#### **6.2: Login to Your App**
Open: `https://your-app-name.onrender.com`

Login with:
- **Email**: `firas.kiftaro@moe.gov.ae`
- **Password**: `1234`

#### **6.3: Test Data Persistence**

1. Add a candidate or course
2. Wait 20 minutes (app will sleep)
3. Visit the app again (30 sec cold start)
4. **Your data should still be there!** ✅

---

## 🔧 Alternative: Manual Render Setup (Without render.yaml)

If `render.yaml` doesn't work, manually configure:

### **Create Database:**
- New → PostgreSQL
- Name: `freshgrad-tracker-db-v2`
- Free tier
- Note the internal connection string

### **Create Web Service:**
- New → Web Service
- Connect GitHub repo
- Environment: **Node**
- Build Command: `npm install`
- Start Command: `node server-db.cjs`
- Add Environment Variable:
  - `DATABASE_URL` = your database connection string
  - `NODE_ENV` = `production`

---

## 📊 Database Management

### **View Database (Render Dashboard)**
- Go to your database in Render dashboard
- Click **"Connect"** → Use the provided `psql` command in your terminal

### **Run SQL Queries**
```bash
# In Git Bash, connect to database
psql "your-database-url-here"

# Check tables
\dt

# View users
SELECT * FROM users;

# View candidates
SELECT * FROM candidates;

# Exit
\q
```

### **Reset Database (if needed)**
In Render dashboard, go to database → **"Info"** tab → scroll down → **"Delete"**

Then recreate and re-link to your web service.

---

## 🐛 Troubleshooting

### **Error: "Failed to connect to database"**
- Check `DATABASE_URL` environment variable is set correctly
- Make sure database is in the same region as web service
- Wait for database to finish initializing (2-3 min)

### **Error: "Port already in use" (local testing)**
- Kill the process: `taskkill /F /IM node.exe` (Windows)
- Or change PORT: `PORT=3001 node server-db.cjs`

### **Data still resets after deployment**
- Verify `DATABASE_URL` is set in Render environment variables
- Check logs: does it say "Database connected"?
- Make sure you're using `server-db.cjs`, not `server.cjs`

### **Can't push to GitHub**
- Generate Personal Access Token: https://github.com/settings/tokens
- Use token as password when pushing
- Or setup SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### **Build fails on Render**
- Check logs for specific error
- Make sure `package.json` has correct `start` script
- Verify `node` version: should be >= 18.0.0

---

## 🎉 Success Checklist

- ✅ Database created on Render
- ✅ Web service deployed and running
- ✅ `/health` endpoint returns `"database": "connected"`
- ✅ Can login with default admin credentials
- ✅ Can add candidates/courses/mentors
- ✅ Data persists after app restarts (wait 20 min idle + revisit)

---

## 📞 Need Help?

If you encounter issues:

1. Check Render logs: Dashboard → Your Service → **"Logs"** tab
2. Check database status: Dashboard → Your Database → **"Info"** tab
3. Verify environment variables: Dashboard → Your Service → **"Environment"** tab

---

## 🚀 Next Steps (Optional Improvements)

1. **Backup Database**: Render free tier has limited storage (256 MB)
   - Export: `pg_dump` your database weekly
   
2. **File Uploads**: For hero images/documents
   - Use Cloudinary (free tier: 25 GB)
   - Or Render disk storage (not persistent on free tier)

3. **Authentication**: Add JWT tokens instead of plain passwords
   - Install `jsonwebtoken` and `bcrypt`

4. **Auto-deploy**: Enable auto-deploy on Render
   - Every `git push` → automatic redeployment

---

## 📝 Quick Reference

| Item | Value |
|------|-------|
| **App URL** | `https://freshgrad-tracker-v2.onrender.com` |
| **GitHub Repo** | `https://github.com/lazytitan21/freshgrad-tracker-v2` |
| **Database** | PostgreSQL (Free - 256 MB) |
| **Web Service** | Node.js (Free - spins down after 15 min) |
| **Default Admin** | `firas.kiftaro@moe.gov.ae` / `1234` |

---

**You're all set!** 🎊 Your app now has persistent storage and won't lose data on restart.
