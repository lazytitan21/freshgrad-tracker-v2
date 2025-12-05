# 🎯 Quick Start - Copy & Paste Commands

## For Git Bash Users (Recommended)

Open **Git Bash** in your project folder and run these commands:

### 1️⃣ Install Dependencies
```bash
cd /c/Users/Firas/Desktop/Tracker-Render
npm install
```

### 2️⃣ Automated Git Push (Easiest!)
```bash
bash deploy-to-github.sh
```

**OR Manual Git Commands:**

```bash
# Initialize git (if first time)
git init

# Stage all files
git add .

# Commit
git commit -m "Add PostgreSQL database support"

# Add your GitHub repository
git remote add origin https://github.com/lazytitan21/freshgrad-tracker.git

# Push to GitHub
git push -u origin main
```

**If push asks for password**: Use GitHub Personal Access Token
- Get token: https://github.com/settings/tokens
- Generate → Select `repo` → Copy token
- Use token as password

---

## 3️⃣ Render.com Setup

### Create Database (Do This First!)
1. Go to: https://render.com/dashboard
2. New + → PostgreSQL
3. Name: `freshgrad-tracker-db`
4. Free tier → Create
5. Wait 2-3 min until "Available"

### Create Web Service
1. New + → Web Service
2. Connect GitHub → Select `freshgrad-tracker`
3. Auto-configured from render.yaml
4. **IMPORTANT**: Add environment variable:
   - `DATABASE_URL` = Copy from database "Internal Database URL"
5. Create Web Service → Wait 3-5 min

---

## 4️⃣ Test Your App

Open: `https://your-app-name.onrender.com/health`

Login: `firas.kiftaro@moe.gov.ae` / `1234`

---

## 🆘 Quick Fixes

**Can't push to GitHub?**
```bash
# Check remote
git remote -v

# Fix remote URL
git remote set-url origin https://github.com/lazytitan21/freshgrad-tracker.git

# Try push again
git push -u origin main
```

**Database not connecting?**
- Check DATABASE_URL in Render environment variables
- Make sure database status is "Available"
- Use "Internal Database URL" not "External"

**Build fails?**
- Verify start command: `node server-db.cjs`
- Check package.json has `"pg": "^8.11.3"`

---

## 📚 Full Documentation

- **DEPLOYMENT-CHECKLIST.md** - Step-by-step guide
- **DEPLOYMENT-WITH-DATABASE.md** - Detailed instructions
- **LOCAL-TESTING.md** - Test locally before deploying

---

## ⚡ Super Quick Summary

```bash
# In Git Bash:
cd /c/Users/Firas/Desktop/Tracker-Render
npm install
bash deploy-to-github.sh

# Then on Render.com:
# 1. Create PostgreSQL database
# 2. Create Web Service from GitHub
# 3. Link DATABASE_URL
# 4. Deploy!
```

**That's it!** 🚀
