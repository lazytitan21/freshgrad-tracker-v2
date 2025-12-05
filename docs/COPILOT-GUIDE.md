# VS Code + Copilot Deployment Guide

A quick guide for deploying FreshGrad Tracker using VS Code with GitHub Copilot agent mode.

## Prerequisites

1. **VS Code** installed with:
   - GitHub Copilot extension
   - GitHub Copilot Chat extension

2. **Accounts created:**
   - GitHub account (with Copilot access)
   - Render.com account

3. **Node.js 18+** installed

---

## Quick Deploy with Copilot

### Step 1: Open Project in VS Code

```
File → Open Folder → Select freshgrad-tracker-v2
```

### Step 2: Open Copilot Chat

Press `Ctrl+Shift+I` (Windows) or `Cmd+Shift+I` (Mac) to open Copilot Chat in agent mode.

### Step 3: Use These Prompts

Copy and paste these prompts to Copilot:

---

#### 🔹 Initial Setup

```
Help me set up this project locally. Install dependencies and verify everything is working.
```

---

#### 🔹 Create GitHub Repository

```
Help me create a new GitHub repository for this project and push the code. Guide me through the process.
```

---

#### 🔹 Set Up Render Database

```
I need to create a PostgreSQL database on Render.com. What are the exact steps and settings I should use for this FreshGrad Tracker app?
```

**Copilot will guide you to:**
1. Go to Render Dashboard
2. Create PostgreSQL with these settings:
   - Name: `freshgrad-tracker-db`
   - Plan: Free
   - Region: Oregon

---

#### 🔹 Set Up Render Web Service

```
Now help me create a Render web service for this app. What build command, start command, and environment variables do I need?
```

**Key settings Copilot will confirm:**
- Build Command: `npm install && npm run build`
- Start Command: `node server-db.cjs`
- Environment Variables:
  - `DATABASE_URL` = (your database connection string)
  - `NODE_ENV` = `production`

---

#### 🔹 Verify Deployment

```
My app is deployed. Help me verify it's working correctly and check the health endpoint.
```

---

#### 🔹 Create Admin User

```
Help me create an admin user for my deployed app. I need to run SQL on the Render database.
```

---

#### 🔹 Troubleshoot Issues

```
My deployment failed. Can you check the logs and help me fix the issue?
```

Or:

```
The app is showing an error. Help me troubleshoot by checking the health endpoint and looking at the code.
```

---

## One-Shot Deploy Prompt

For experienced users, use this comprehensive prompt:

```
I want to deploy this FreshGrad Tracker app to Render.com. Please help me:

1. Verify the code is ready for deployment
2. Guide me to create a PostgreSQL database on Render
3. Guide me to create a web service on Render with correct settings
4. Set up the environment variables (DATABASE_URL, NODE_ENV)
5. Verify the deployment is working

The app uses:
- Frontend: React + Vite (build command: npm run build)
- Backend: Express (start command: node server-db.cjs)
- Database: PostgreSQL

Let's go step by step.
```

---

## Useful Copilot Commands

### Check Project Health

```
Check if there are any errors in the codebase and verify the project structure is correct for deployment.
```

### Debug API Issues

```
The API endpoint /api/candidates is returning an error. Help me debug it by looking at server-db.cjs.
```

### Add New Feature

```
Help me add a new feature to track student attendance. Create the database migration, API endpoint, and frontend component.
```

### Update Documentation

```
Update the CHANGELOG.md with the recent changes we made.
```

### Git Operations

```
Help me commit all changes and push to GitHub to trigger a new deployment.
```

---

## Render Settings Reference

When Copilot asks, use these exact values:

### Database Settings
| Setting | Value |
|---------|-------|
| Name | `freshgrad-tracker-db` |
| Database | `freshgrad_tracker` |
| User | `freshgrad_user` |
| Region | Oregon (US West) |
| Plan | Free |

### Web Service Settings
| Setting | Value |
|---------|-------|
| Name | `freshgrad-tracker` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `node server-db.cjs` |
| Plan | Free |

### Environment Variables
| Key | Value |
|-----|-------|
| `DATABASE_URL` | (copy from Render database) |
| `NODE_ENV` | `production` |

---

## Tips for Working with Copilot

### Be Specific
❌ "Deploy my app"  
✅ "Help me deploy this app to Render.com with a PostgreSQL database"

### Provide Context
❌ "Fix the error"  
✅ "Fix the 500 error on POST /api/candidates - here's the error message: [paste error]"

### Ask for Verification
✅ "After making changes, verify there are no TypeScript or linting errors"

### Request Step-by-Step
✅ "Guide me step by step, waiting for my confirmation at each step"

### Share Terminal Output
When something fails, copy the terminal output and paste it to Copilot:
```
This command failed with this output: [paste output]
```

---

## Common Workflows

### Daily Development
```
1. Make code changes
2. Ask Copilot: "Check for errors and commit these changes with a descriptive message"
3. Push triggers auto-deploy
```

### Fixing Bugs
```
1. Describe the bug to Copilot
2. Ask: "Help me find and fix this bug"
3. Ask: "Test the fix and deploy"
```

### Adding Features
```
1. Describe the feature
2. Ask: "Break this into smaller tasks"
3. Work through each task with Copilot
4. Ask: "Commit and deploy these changes"
```

---

## Quick Reference Card

| Task | Copilot Prompt |
|------|----------------|
| Install deps | "Install project dependencies" |
| Run locally | "Start the development server" |
| Build | "Build the project for production" |
| Check errors | "Check for any code errors" |
| Commit | "Commit changes with message about [feature]" |
| Push/Deploy | "Push to GitHub to deploy" |
| Check logs | "What should I look for in Render logs?" |
| Debug | "Help me debug [describe issue]" |

---

## Troubleshooting with Copilot

### "Deployment Failed"
```
My Render deployment failed. Here's the build log:
[paste log]
Help me understand and fix the issue.
```

### "Database Not Connecting"
```
The app can't connect to the database. Help me verify:
1. DATABASE_URL is set correctly
2. Database is running
3. SSL is configured properly
```

### "API Returns 500"
```
The endpoint /api/[endpoint] returns 500. Help me:
1. Check the server logs
2. Find the error in server-db.cjs
3. Fix the issue
```

### "Frontend Not Loading"
```
The frontend shows a blank page. Help me check:
1. Build completed successfully
2. Static files are being served
3. No JavaScript errors
```

---

**Remember:** Copilot works best when you provide context and are specific about what you need. Don't hesitate to paste error messages, logs, and code snippets!

---

**Last Updated:** December 2024
