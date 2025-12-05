#!/bin/bash
# Automated deployment script for FreshGrad Tracker
# Run this in Git Bash: bash deploy-to-github.sh

echo "🚀 FreshGrad Tracker - Automated Git Deployment"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Found package.json"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""

# Check current status
echo "📊 Current Git Status:"
git status --short
echo ""

# Add all files
echo "📝 Adding all files to Git..."
git add .
echo "✅ Files staged"
echo ""

# Commit
echo "💾 Committing changes..."
COMMIT_MSG="Add PostgreSQL database support - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"
echo "✅ Committed: $COMMIT_MSG"
echo ""

# Check for remote
REMOTE=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE" ]; then
    echo "⚠️  No remote repository configured"
    echo ""
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/lazytitan21/freshgrad-tracker-v2.git"
    read -p "Repository URL: " REPO_URL
    
    if [ -z "$REPO_URL" ]; then
        echo "❌ No URL provided. Exiting..."
        exit 1
    fi
    
    git remote add origin "$REPO_URL"
    echo "✅ Remote added: $REPO_URL"
else
    echo "✅ Remote configured: $REMOTE"
fi

echo ""

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📌 Current branch: $BRANCH"
echo ""

# Push to GitHub
echo "🌐 Pushing to GitHub..."
echo ""

if git push -u origin "$BRANCH"; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "================================================"
    echo "✨ Next Steps:"
    echo "================================================"
    echo ""
    echo "1. Go to Render.com: https://render.com"
    echo "2. Create PostgreSQL Database first"
    echo "   - Name: freshgrad-tracker-db-v2"
    echo "   - Free tier"
    echo ""
    echo "3. Create Web Service"
    echo "   - Connect GitHub repository: freshgrad-tracker-v2"
    echo "   - Auto-detected from render.yaml"
    echo ""
    echo "4. Link DATABASE_URL environment variable"
    echo ""
    echo "📚 Full instructions: DEPLOYMENT-WITH-DATABASE.md"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo ""
    echo "1. Authentication Required:"
    echo "   - Generate Personal Access Token:"
    echo "     https://github.com/settings/tokens"
    echo "   - Use token as password when prompted"
    echo ""
    echo "2. Repository doesn't exist:"
    echo "   - Create repo on GitHub first"
    echo "   - Use exact URL shown on GitHub"
    echo ""
    echo "3. Remote URL incorrect:"
    echo "   - Run: git remote set-url origin YOUR_CORRECT_URL"
    echo ""
    echo "Try again with:"
    echo "git push -u origin $BRANCH"
    exit 1
fi
