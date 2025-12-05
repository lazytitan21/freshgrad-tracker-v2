# Troubleshooting Guide

Common issues and solutions for the FreshGrad Tracker application.

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Data Issues](#data-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)

## Quick Diagnostics

### Health Check

First, always check the health endpoint:

```bash
curl https://freshgrad-tracker-v2.onrender.com/health
```

**Healthy Response:**
```json
{
  "status": "ok",
  "version": "2.9.0",
  "database": "connected",
  "timestamp": "2024-12-06T10:30:00.000Z",
  "dbTime": "2024-12-06T10:30:00.000Z"
}
```

**Unhealthy Response:**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Connection refused"
}
```

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for red errors
4. Check **Network** tab for failed requests

### Check Server Logs

1. Go to Render Dashboard
2. Select your web service
3. Click **Logs**
4. Look for error messages (❌)

---

## Frontend Issues

### Page Not Loading / White Screen

**Symptoms:**
- Blank white page
- React error in console

**Solutions:**

1. **Clear browser cache**
   ```
   Ctrl + Shift + R (hard refresh)
   ```

2. **Check build completed**
   - Go to Render → Deploys
   - Verify build succeeded
   - Check for build errors

3. **Check console errors**
   - Look for JavaScript errors
   - Missing imports or syntax errors

### Styles Not Applying

**Symptoms:**
- Page looks unstyled
- Tailwind classes not working

**Solutions:**

1. **Rebuild frontend**
   ```bash
   npm run build
   git add dist -f
   git commit -m "Rebuild frontend"
   git push
   ```

2. **Check Tailwind config**
   - Verify `tailwind.config.js` content paths
   - Ensure PostCSS is configured

### Images Not Loading

**Symptoms:**
- Broken image icons
- 404 errors for images

**Solutions:**

1. **Check image paths**
   - Images should be in `/public` folder
   - Use paths like `/Heros/hero.JPG`

2. **Check file names**
   - Case-sensitive on Linux
   - `Hero.JPG` ≠ `hero.jpg`

3. **Verify files exist**
   ```bash
   ls public/Heros/
   ```

---

## Backend Issues

### 500 Internal Server Error

**Symptoms:**
- API returns 500 status
- "Internal Server Error" message

**Solutions:**

1. **Check server logs**
   - Look for stack trace
   - Identify the failing endpoint

2. **Common causes:**
   - Database connection failed
   - Invalid data types (empty string vs null)
   - Missing required fields

3. **Data type issues:**
   ```javascript
   // Bad: empty string to DECIMAL column
   hours: ''
   
   // Good: null for empty values
   hours: hours === '' ? null : Number(hours)
   ```

### 404 Not Found

**Symptoms:**
- API endpoint returns 404
- Resource not found

**Solutions:**

1. **Check endpoint URL**
   - Verify correct path
   - Check for typos

2. **Check if endpoint exists**
   - Search `server-db.cjs` for the route
   - Ensure route is defined

3. **API routes reference:**
   ```
   /api/users
   /api/candidates
   /api/courses
   /api/mentors
   /api/news
   ```

### CORS Errors

**Symptoms:**
- "Access-Control-Allow-Origin" error
- Cross-origin request blocked

**Solutions:**

1. **Check CORS config in server:**
   ```javascript
   app.use(cors({
     origin: true,
     credentials: true,
   }));
   ```

2. **Ensure middleware order:**
   - CORS should be before routes

---

## Database Issues

### Connection Failed

**Symptoms:**
- "Connection refused" error
- Database shows "disconnected" in health check

**Solutions:**

1. **Check DATABASE_URL**
   - Verify environment variable is set
   - Check format: `postgresql://user:pass@host:5432/db`

2. **Database status**
   - Go to Render Dashboard → Database
   - Check if database is running

3. **SSL issues (production):**
   ```javascript
   ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false
   ```

### Data Not Saving

**Symptoms:**
- Create/Update succeeds but data disappears
- Data only visible in current session

**Solutions:**

1. **Check API is being called**
   - Open Network tab in DevTools
   - Verify POST/PUT requests are made

2. **Check response status**
   - Should be 200 or 201
   - Look for error messages

3. **Verify database write:**
   ```bash
   # Connect to database
   psql $DATABASE_URL
   
   # Check data
   SELECT * FROM candidates ORDER BY created_at DESC LIMIT 5;
   ```

### Query Errors

**Symptoms:**
- SQL syntax error
- Column does not exist

**Solutions:**

1. **Check column names**
   - Verify column exists in table
   - Check for typos

2. **Run migration:**
   - Restart the server
   - Migrations run on startup

3. **Manual migration:**
   ```sql
   ALTER TABLE tablename ADD COLUMN IF NOT EXISTS newcolumn TYPE;
   ```

---

## Authentication Issues

### Login Failed

**Symptoms:**
- "Invalid credentials" error
- Can't log in with correct password

**Solutions:**

1. **Check email case**
   - Emails are case-insensitive
   - But stored as entered

2. **Check user status**
   ```sql
   SELECT email, status, role FROM users WHERE email = 'user@example.com';
   ```

3. **User must be "active"**
   - New users start as "pending"
   - Admin must approve

### Session Lost

**Symptoms:**
- Logged out unexpectedly
- Session doesn't persist

**Solutions:**

1. **Check localStorage**
   - Open DevTools → Application → Local Storage
   - Look for `fg.user` key

2. **Browser settings**
   - Ensure localStorage is enabled
   - Check for privacy extensions blocking storage

### Role Not Working

**Symptoms:**
- Can't access pages
- Features missing

**Solutions:**

1. **Check user role**
   ```sql
   SELECT email, role FROM users WHERE email = 'user@example.com';
   ```

2. **Valid roles:**
   - Admin
   - ECAE Manager
   - ECAE Trainer
   - Auditor
   - Student

---

## Data Issues

### Applicant Not Becoming Candidate

**Symptoms:**
- Accept applicant but no candidate created
- GPA error in console

**Solutions:**

1. **Check GPA value**
   - Must be a number or null
   - Empty string causes error

2. **Server handles this:**
   ```javascript
   const gpaValue = gpa === '' || gpa === null ? null : Number(gpa);
   ```

3. **Check server logs for errors**

### Course Hours Not Saving

**Symptoms:**
- Course saves but hours is null
- 500 error on course creation

**Solutions:**

1. **Check hours value**
   - Must be integer or null
   - Empty string causes error

2. **Ensure proper handling:**
   ```javascript
   hours: hours === '' ? null : Number(hours)
   ```

### Data Visible in One Browser Only

**Symptoms:**
- Data shows in Chrome but not Firefox
- Different data in incognito mode

**Solutions:**

1. **Check if data is in database**
   ```sql
   SELECT * FROM tablename ORDER BY created_at DESC LIMIT 10;
   ```

2. **If in database:**
   - Clear browser cache
   - Hard refresh (Ctrl + Shift + R)

3. **If not in database:**
   - API call may have failed
   - Check Network tab for errors

---

## Performance Issues

### Slow Initial Load

**Symptoms:**
- App takes 30+ seconds to load initially
- Subsequent loads are fast

**Cause:** Render free tier spins down after 15 minutes of inactivity.

**Solutions:**

1. **Expected behavior on free tier**
   - First request after sleep takes ~30s
   - Consider upgrading for always-on

2. **Keep alive (not recommended for free tier):**
   - Use external monitoring to ping `/health`
   - Uses up free hours

### Slow API Responses

**Symptoms:**
- API calls take several seconds
- Database queries timeout

**Solutions:**

1. **Check database performance:**
   ```sql
   -- Check table sizes
   SELECT relname, n_live_tup 
   FROM pg_stat_user_tables 
   ORDER BY n_live_tup DESC;
   ```

2. **Add indexes if needed:**
   ```sql
   CREATE INDEX idx_candidates_email ON candidates(email);
   ```

---

## Deployment Issues

### Build Failed

**Symptoms:**
- Deploy fails at build step
- Error in Render logs

**Common Causes & Solutions:**

1. **Missing dependency**
   ```bash
   npm install missing-package
   ```

2. **Node version mismatch**
   - Check `package.json` engines
   - Render uses Node 18+ by default

3. **Build script error**
   - Test locally: `npm run build`
   - Check for TypeScript/ESLint errors

### Deploy Succeeded But App Broken

**Symptoms:**
- Deploy shows success
- App doesn't work

**Solutions:**

1. **Check start command**
   - Should be `node server-db.cjs`

2. **Check health endpoint**
   - Visit `/health`
   - Look for errors

3. **Check environment variables**
   - DATABASE_URL must be set
   - NODE_ENV should be production

### Database Not Connecting After Deploy

**Symptoms:**
- Works locally but not on Render
- Database shows disconnected

**Solutions:**

1. **Verify DATABASE_URL**
   - Go to Render → Environment
   - Check variable is set

2. **Check database status**
   - Go to Render → Database
   - Ensure it's running

3. **SSL configuration:**
   - Production requires SSL
   - Check server config

---

## Debug Endpoints

The app includes debug endpoints (use carefully in production):

```bash
# Check database schema
curl https://your-app.onrender.com/api/debug/schema

# Health with database time
curl https://your-app.onrender.com/health
```

---

## Getting Help

If issues persist:

1. **Check Render Status:** https://status.render.com
2. **Review recent changes:** `git log --oneline -10`
3. **Test locally first:** Always test changes locally before deploying
4. **Check this guide:** Search for your error message

---

**Last Updated:** December 2024
