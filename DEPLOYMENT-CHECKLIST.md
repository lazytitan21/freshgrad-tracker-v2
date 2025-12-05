# ✅ Complete Deployment Checklist

## 📋 Pre-Deployment Checklist

- [x] PostgreSQL schema created (`server/src/schema.sql`)
- [x] Database-enabled server created (`server-db.cjs`)
- [x] Package.json updated with `pg` dependency
- [x] Render.yaml configured with database
- [x] Documentation created

## 🎯 Your Action Items

### Step 1: Install Dependencies (2 minutes)

Open Git Bash in your project folder:

```bash
cd /c/Users/Firas/Desktop/Tracker-Render
npm install
```

**Expected output**: Should install `pg@8.11.3` and other dependencies

---

### Step 2: Push to GitHub (5 minutes)

**Option A: Use the automated script**

```bash
bash deploy-to-github.sh
```

**Option B: Manual commands**

```bash
cd /c/Users/Firas/Desktop/Tracker-Render

# Initialize git (if needed)
git init

# Stage all changes
git add .

# Commit
git commit -m "Add PostgreSQL database support for persistent storage"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/lazytitan21/freshgrad-tracker-v2.git

# Push to GitHub
git push -u origin main
```

**Troubleshooting Authentication:**

If prompted for password, use **Personal Access Token**:
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy token and paste as password

---

### Step 3: Create PostgreSQL Database on Render (3 minutes)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `freshgrad-tracker-db-v2`
   - **Database**: `freshgrad_tracker_v2`
   - **Region**: Oregon (or closest to you)
   - **Plan**: **Free**
4. Click **"Create Database"**
5. **Wait 2-3 minutes** until status shows "Available"
6. **Keep this tab open** - you'll need the connection info

---

### Step 4: Deploy Web Service on Render (5 minutes)

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** (authorize if first time)
3. Find and select `freshgrad-tracker-v2` repository
4. Click **"Connect"**

**Configuration** (should auto-fill from render.yaml):
- **Name**: `freshgrad-tracker-v2` (or your choice)
- **Region**: Same as database (Oregon)
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node server-db.cjs`
- **Plan**: **Free**

**Environment Variables** (scroll down or click "Advanced"):

Add these variables:

1. **NODE_ENV**
   - Value: `production`

2. **DATABASE_URL** (CRITICAL!)
   - Go to your database tab
   - Copy **"Internal Database URL"** (looks like: `postgresql://...`)
   - Paste as value

Alternative: If render.yaml works, it should auto-link DATABASE_URL

5. Click **"Create Web Service"**
6. **Wait 3-5 minutes** for deployment

---

### Step 5: Verify Deployment (2 minutes)

#### 5.1 Check Logs
In Render dashboard → Your web service → **"Logs"** tab

Look for:
```
✅ Database connected at: ...
✅ Database schema initialized
✅ Server running on port 10000
```

#### 5.2 Test Health Endpoint
Open: `https://your-app-name.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  ...
}
```

#### 5.3 Login to App
Open: `https://your-app-name.onrender.com`

Login with:
- Email: `firas.kiftaro@moe.gov.ae`
- Password: `1234`

#### 5.4 Test Data Persistence
1. Add a test candidate or course
2. Note down the details
3. Wait 20 minutes (app will go idle)
4. Revisit the app (will take ~30 sec to wake up)
5. **Verify your test data is still there** ✅

---

## 🎉 Success Indicators

You'll know everything works when:

- ✅ Health check shows `"database": "connected"`
- ✅ You can login with admin credentials
- ✅ You can add candidates/courses/mentors
- ✅ Data persists after app restarts
- ✅ No errors in Render logs

---

## 🐛 Troubleshooting Guide

### Problem: "Failed to connect to database"

**Solution**:
1. Check DATABASE_URL is set in Render environment variables
2. Verify database status is "Available" (not "Creating")
3. Make sure database and web service are in the same region
4. Try using "Internal Database URL" instead of "External"

### Problem: "Build failed" on Render

**Check**:
1. package.json has `"pg": "^8.11.3"` in dependencies
2. Start command is `node server-db.cjs` (not `server.cjs`)
3. Node version >= 18.0.0

### Problem: Can't push to GitHub

**Solutions**:
- Generate Personal Access Token (see Step 2)
- Make sure repository exists on GitHub
- Check remote URL: `git remote -v`
- Update URL: `git remote set-url origin YOUR_URL`

### Problem: Data still resets

**Check**:
1. Verify you're using `server-db.cjs` (check Render start command)
2. Check DATABASE_URL environment variable is set
3. Look in logs for "Database connected"
4. Try manually running schema: In database, use psql to run schema.sql

### Problem: App shows "Frontend not deployed"

**Solution**:
You need to build the frontend first:
```bash
npm run build
```

Then commit and push the `dist/` folder.

---

## 📊 Expected Resource Usage

**Free Tier Limits**:
- Database: 256 MB storage (enough for ~100,000 records)
- Web Service: 512 MB RAM, spins down after 15 min idle
- Cold start: ~30 seconds when app wakes up

**Monitoring**:
- Check database size: Render Dashboard → Database → Info tab
- Check web service metrics: Render Dashboard → Web Service → Metrics tab

---

## 🔄 Making Changes After Deployment

### Update Code
```bash
# Make your changes in code
# Then commit and push
git add .
git commit -m "Your changes description"
git push origin main
```

Render will **auto-deploy** if you enabled it (recommended).

### Update Database Schema

**Option 1: Through psql**
```bash
# Connect to database
psql "your-database-url"

# Run SQL commands
ALTER TABLE candidates ADD COLUMN new_field VARCHAR(100);

# Exit
\q
```

**Option 2: Recreate Database** (loses data!)
- Render Dashboard → Database → Delete
- Create new database
- Re-link to web service

---

## 📞 Getting Help

If stuck:

1. **Check Render Logs**: Most errors are visible here
2. **Database Status**: Make sure it's "Available"
3. **Environment Variables**: Double-check DATABASE_URL is correct
4. **Local Testing**: Try running `node server-db.cjs` locally (see LOCAL-TESTING.md)

Common Log Messages:
- ✅ "Database connected" = Good!
- ✅ "Server running" = Good!
- ❌ "Connection refused" = DATABASE_URL wrong or database not ready
- ❌ "Port already in use" = Only happens locally, not on Render

---

## 🚀 You're Ready!

Follow these steps in order, and you'll have a fully functional app with persistent data on Render!

**Estimated Total Time**: ~20 minutes

Good luck! 🎊
