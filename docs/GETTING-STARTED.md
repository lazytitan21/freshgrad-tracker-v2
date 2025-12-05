# Getting Started Guide

Complete guide for setting up FreshGrad Tracker from scratch on a new device with new accounts.

## Overview

This guide covers:
1. Prerequisites & account setup
2. Getting the code
3. Local development setup
4. GitHub repository setup
5. Render.com deployment
6. Post-deployment configuration

**Estimated Time:** 30-45 minutes

---

## Step 1: Prerequisites

### Required Software

Install these on your computer:

| Software | Download | Purpose |
|----------|----------|---------|
| **Node.js 18+** | https://nodejs.org | JavaScript runtime |
| **Git** | https://git-scm.com | Version control |
| **VS Code** | https://code.visualstudio.com | Code editor (recommended) |

### Verify Installation

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
node --version
# Should show: v18.x.x or higher

npm --version
# Should show: 9.x.x or higher

git --version
# Should show: git version 2.x.x
```

### Required Accounts

Create accounts on these platforms (all free):

| Platform | URL | Purpose |
|----------|-----|---------|
| **GitHub** | https://github.com | Code hosting |
| **Render** | https://render.com | App hosting & database |

---

## Step 2: Get the Code

### Option A: Fork the Repository (Recommended)

This creates your own copy of the project:

1. Go to: https://github.com/lazytitan21/freshgrad-tracker-v2
2. Click **Fork** (top right)
3. Select your GitHub account
4. Wait for fork to complete

Then clone YOUR fork:

```bash
# Replace YOUR_USERNAME with your GitHub username
git clone https://github.com/YOUR_USERNAME/freshgrad-tracker-v2.git
cd freshgrad-tracker-v2
```

### Option B: Download and Create New Repository

1. Download the code:
   ```bash
   git clone https://github.com/lazytitan21/freshgrad-tracker-v2.git
   cd freshgrad-tracker-v2
   ```

2. Remove original git history:
   ```bash
   # Windows (PowerShell)
   Remove-Item -Recurse -Force .git
   
   # Mac/Linux
   rm -rf .git
   ```

3. Create new repository on GitHub:
   - Go to https://github.com/new
   - Name: `freshgrad-tracker` (or your choice)
   - Keep it **Public** (required for Render free tier)
   - Click **Create repository**

4. Connect your code to the new repository:
   ```bash
   git init
   git add -A
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## Step 3: Local Development Setup

### Install Dependencies

```bash
cd freshgrad-tracker-v2
npm install
```

### Environment Configuration

1. Create environment file:
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

2. Edit `.env` file:
   ```env
   # Leave empty for now - will add database URL after Render setup
   DATABASE_URL=
   NODE_ENV=development
   ```

### Test Local Build

```bash
# Build the frontend
npm run build

# Start the server (will fail without database, but confirms code works)
npm run server
```

If you see "Database connection failed" - that's expected. We'll fix it after setting up Render.

---

## Step 4: GitHub Repository Settings

### Recommended Settings

1. Go to your repository on GitHub
2. Click **Settings** tab

#### Branch Protection (Optional but Recommended)

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Check: "Require pull request reviews before merging" (optional)
4. Click **Create**

#### Repository Visibility

- **Public**: Required for Render free tier
- **Private**: Requires Render paid plan

---

## Step 5: Render.com Setup

### 5.1 Create Render Account

1. Go to https://render.com
2. Click **Get Started for Free**
3. Sign up with **GitHub** (recommended for easy repo connection)
4. Authorize Render to access your GitHub

### 5.2 Create PostgreSQL Database

1. From Render Dashboard, click **New +** → **PostgreSQL**

2. Configure database:
   | Setting | Value |
   |---------|-------|
   | Name | `freshgrad-tracker-db` |
   | Database | `freshgrad_tracker` |
   | User | `freshgrad_user` |
   | Region | Oregon (US West) or closest to you |
   | PostgreSQL Version | 15 (or latest) |
   | Plan | **Free** |

3. Click **Create Database**

4. Wait for database to be ready (1-2 minutes)

5. **Copy the Connection String:**
   - Go to your database in Render
   - Find **External Database URL** (under Connections)
   - Copy this URL (starts with `postgresql://...`)
   - **Save this - you'll need it!**

### 5.3 Create Web Service

1. From Render Dashboard, click **New +** → **Web Service**

2. Connect your repository:
   - Click **Connect a repository**
   - Select your GitHub account
   - Find and select `freshgrad-tracker-v2` (or your repo name)
   - Click **Connect**

3. Configure web service:
   | Setting | Value |
   |---------|-------|
   | Name | `freshgrad-tracker` |
   | Region | Same as database (Oregon) |
   | Branch | `main` |
   | Root Directory | (leave empty) |
   | Runtime | **Node** |
   | Build Command | `npm install && npm run build` |
   | Start Command | `node server-db.cjs` |
   | Plan | **Free** |

4. Add Environment Variables:
   Click **Add Environment Variable** for each:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (paste your database connection string) |
   | `NODE_ENV` | `production` |

5. Click **Create Web Service**

### 5.4 Wait for Deployment

1. Render will now:
   - Clone your repository
   - Run `npm install && npm run build`
   - Start `node server-db.cjs`

2. Watch the **Logs** tab for progress

3. Look for:
   ```
   ✅ Database connected
   ✅ Database schema initialized
   🚀 Server running on port 10000
   ```

4. Deployment takes 3-5 minutes on first deploy

### 5.5 Verify Deployment

1. Click the URL at the top of your web service (e.g., `https://freshgrad-tracker-xxxx.onrender.com`)

2. Check health endpoint:
   ```
   https://your-app-name.onrender.com/health
   ```
   
   Should return:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "version": "2.9.0"
   }
   ```

3. Visit your app URL - you should see the landing page!

---

## Step 6: Post-Deployment Setup

### 6.1 Create Admin Account

1. Go to your app URL
2. Click **Sign up**
3. Fill in:
   - Email: your email
   - Password: choose a strong password
   - Name: your name
   - Role: (any - you'll change this)
4. Click **Register**

### 6.2 Make Yourself Admin (First Time Only)

Since there's no admin yet, you need to update the database directly:

1. Go to Render Dashboard → Your Database
2. Click **PSQL** button (or use External URL with a PostgreSQL client)
3. Run this SQL:
   ```sql
   UPDATE users 
   SET role = 'Admin', status = 'active' 
   WHERE email = 'your-email@example.com';
   ```
4. Now login to your app - you're the admin!

### 6.3 Configure Your App

As admin, you can now:
- Approve other user registrations
- Create courses
- Add mentors
- Post news/updates
- Manage candidates

---

## Step 7: Ongoing Development

### Making Changes

1. Edit code locally
2. Test locally:
   ```bash
   npm run dev
   ```
3. Commit and push:
   ```bash
   git add -A
   git commit -m "Description of changes"
   git push origin main
   ```
4. Render auto-deploys from main branch

### Update Local Environment

To test with the real database locally:

1. Copy the DATABASE_URL from Render
2. Add to your local `.env`:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NODE_ENV=development
   ```
3. Run:
   ```bash
   npm run server   # Terminal 1: Backend
   npm run dev      # Terminal 2: Frontend
   ```

---

## Quick Reference

### Important URLs

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/YOUR_USERNAME/freshgrad-tracker-v2 |
| Render Dashboard | https://dashboard.render.com |
| Live App | https://your-app-name.onrender.com |
| Health Check | https://your-app-name.onrender.com/health |

### Common Commands

```bash
# Local development
npm run dev          # Start frontend dev server
npm run server       # Start backend server
npm run build        # Build for production

# Git commands
git add -A                    # Stage all changes
git commit -m "message"       # Commit changes
git push origin main          # Deploy to Render

# Check status
git status           # See changed files
git log --oneline    # See recent commits
```

### Render Dashboard Navigation

| Section | Purpose |
|---------|---------|
| **Dashboard** | Overview of all services |
| **Web Service** | Your app - logs, settings, deploys |
| **PostgreSQL** | Database - connections, metrics |
| **Environment** | Environment variables |
| **Logs** | Real-time server logs |
| **Events** | Deploy history |

---

## Troubleshooting First Deploy

### Build Fails

**Check:** Render Logs → Build output

Common issues:
- Missing dependencies → Check `package.json`
- Node version → Ensure `engines.node` is set
- Build script error → Test `npm run build` locally

### Database Connection Fails

**Check:** Environment Variables

1. Verify `DATABASE_URL` is set correctly
2. URL should start with `postgresql://`
3. Database should be in same region as web service

### App Loads But Shows Errors

**Check:** Browser Console (F12)

1. API errors → Check server logs
2. 404 errors → Build may have failed
3. CORS errors → Check server CORS config

### Free Tier Limitations

| Limitation | Details |
|------------|---------|
| Spin down | App sleeps after 15 min inactive |
| Cold start | First request takes ~30 seconds |
| Database | 90-day expiration, 1GB storage |
| Hours | 750 hours/month |

---

## Security Checklist

Before going live:

- [ ] Change default passwords
- [ ] Use strong admin password
- [ ] Keep repository public only if needed
- [ ] Don't commit `.env` file
- [ ] Review user permissions
- [ ] Enable 2FA on GitHub and Render

---

## Getting Help

1. **Check documentation:** `/docs` folder
2. **Check logs:** Render Dashboard → Logs
3. **Test locally:** Reproduce issues locally first
4. **Health check:** Visit `/health` endpoint

---

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub account created
- [ ] Repository forked/created
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Web service created
- [ ] Environment variables set
- [ ] App deployed successfully
- [ ] Admin account created
- [ ] First login successful

**Congratulations!** 🎉 Your FreshGrad Tracker is now live!

---

**Last Updated:** December 2024
