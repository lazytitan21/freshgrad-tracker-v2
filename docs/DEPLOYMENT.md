# Deployment Guide

This guide covers deploying the FreshGrad Tracker to Render.com.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Render.com Setup](#rendercom-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Deployment Process](#deployment-process)
- [Post-Deployment Checks](#post-deployment-checks)
- [Updating the App](#updating-the-app)
- [Rollback Procedure](#rollback-procedure)

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - Code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Code Ready** - All changes committed and pushed

## Render.com Setup

### Step 1: Connect GitHub

1. Log in to Render Dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub account
4. Select the `freshgrad-tracker-v2` repository

### Step 2: Configure Service

Render will auto-detect `render.yaml` and configure:

| Setting | Value |
|---------|-------|
| Name | freshgrad-tracker-v2 |
| Region | Oregon (US West) |
| Branch | main |
| Build Command | `npm install && npm run build` |
| Start Command | `node server-db.cjs` |
| Plan | Free |

### Step 3: Create Database

Render will also create the PostgreSQL database:

| Setting | Value |
|---------|-------|
| Name | freshgrad-tracker-db-v2 |
| Database | freshgrad_tracker_v2 |
| User | freshgrad_user_v2 |
| Plan | Free |

## Environment Variables

These are automatically set by `render.yaml`:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | production | Environment mode |
| `DATABASE_URL` | (auto) | PostgreSQL connection string |

### Manual Environment Variables (if needed)

If setting up manually without `render.yaml`:

1. Go to your web service → **Environment**
2. Add variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<from database settings>
   ```

## Database Setup

### Connection String

The `DATABASE_URL` format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Example:
```
postgresql://freshgrad_user_v2:abc123@oregon-postgres.render.com:5432/freshgrad_tracker_v2
```

### Database Initialization

The app automatically:
1. Creates tables if they don't exist
2. Runs migrations for new columns
3. Handles schema updates gracefully

### Manual Database Access

To connect directly to the database:

1. Go to Render Dashboard → Database
2. Copy **External Database URL**
3. Use `psql` or a GUI client:
   ```bash
   psql "postgresql://user:pass@host:5432/db?sslmode=require"
   ```

## Deployment Process

### Automatic Deployment

Every push to `main` triggers auto-deploy:

1. Push code to GitHub
2. Render detects changes
3. Builds frontend: `npm install && npm run build`
4. Starts server: `node server-db.cjs`
5. Health check: `/health` endpoint

### Manual Deployment

To trigger a manual deploy:

1. Go to Render Dashboard
2. Select your web service
3. Click **Manual Deploy** → **Deploy latest commit**

### Deploy from Different Branch

1. Go to Settings → Build & Deploy
2. Change **Branch** to desired branch
3. Save and deploy

## Post-Deployment Checks

### 1. Health Check

Visit: `https://freshgrad-tracker-v2.onrender.com/health`

Expected response:
```json
{
  "status": "ok",
  "version": "2.9.0",
  "database": "connected",
  "timestamp": "2024-12-06T..."
}
```

### 2. Frontend Loading

Visit the main URL and verify:
- [ ] Landing page loads
- [ ] Hero images display
- [ ] Login form works

### 3. Database Connection

Test API endpoint:
```bash
curl https://freshgrad-tracker-v2.onrender.com/api/users
```

### 4. Authentication

Test login:
1. Go to Sign In
2. Use test credentials
3. Verify dashboard loads

## Updating the App

### Standard Update Process

```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Commit changes
git add -A
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin main

# 5. Monitor deployment in Render Dashboard
```

### Version Update

When making significant changes, update the version:

1. Edit `server-db.cjs`:
   ```javascript
   const APP_VERSION = '2.10.0';
   ```

2. Commit and push

3. Verify at `/health` endpoint

## Rollback Procedure

### Quick Rollback

1. Go to Render Dashboard → Deploys
2. Find the last working deploy
3. Click **Redeploy**

### Git Rollback

```bash
# Find the commit to rollback to
git log --oneline

# Revert to previous commit
git revert HEAD
git push origin main

# Or hard reset (use carefully)
git reset --hard <commit-hash>
git push --force origin main
```

### Database Rollback

⚠️ **Caution**: Database changes may not be automatically reversible.

For data issues:
1. Access database via External URL
2. Manually fix data or restore from backup

## Monitoring

### Render Dashboard

- **Logs**: Real-time server logs
- **Metrics**: CPU, Memory, Bandwidth
- **Events**: Deploy history

### Health Monitoring

The `/health` endpoint returns:
- Server status
- Database connection status
- App version
- Timestamp

### Log Analysis

View logs in Render Dashboard or use:
```bash
# Recent logs
render logs --service freshgrad-tracker-v2
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check `npm install` errors in logs |
| Database connection failed | Verify DATABASE_URL is set |
| 404 errors | Check if frontend build completed |
| 500 errors | Check server logs for details |

### Build Failures

1. Check logs for error message
2. Common fixes:
   - Missing dependencies → Add to `package.json`
   - Build script error → Test locally first

### Database Issues

1. Check DATABASE_URL environment variable
2. Verify database is running in Render
3. Check connection string format

## Free Tier Limitations

### Web Service
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- 750 hours/month

### Database
- 1 GB storage
- 256 MB RAM
- 90-day retention (free tier databases expire)

### Recommendations

1. **Keep database active**: Periodic health checks
2. **Monitor storage**: Don't exceed 1 GB
3. **Backup data**: Export important data regularly

---

## Quick Reference

| Action | Command/URL |
|--------|-------------|
| Live App | https://freshgrad-tracker-v2.onrender.com |
| Health Check | https://freshgrad-tracker-v2.onrender.com/health |
| Render Dashboard | https://dashboard.render.com |
| Deploy | Push to `main` branch |
| Logs | Render Dashboard → Logs |

---

**Last Updated:** December 2024
