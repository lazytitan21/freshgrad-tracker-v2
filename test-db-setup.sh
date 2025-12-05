#!/bin/bash
# Quick test script for database connectivity

echo "🧪 Testing FreshGrad Tracker Database Setup..."

# Check if pg module is installed
if ! npm list pg &>/dev/null; then
    echo "⚠️  PostgreSQL client not found. Installing..."
    npm install pg
fi

# Check if schema.sql exists
if [ ! -f "server/src/schema.sql" ]; then
    echo "❌ schema.sql not found!"
    exit 1
fi

echo "✅ All files present"

# Check if DATABASE_URL is set (for local testing)
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set (expected for local testing)"
    echo "   For Render deployment, this will be set automatically"
else
    echo "✅ DATABASE_URL is configured"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Run: git add ."
echo "2. Run: git commit -m 'Add database support'"
echo "3. Run: git push origin main"
echo "4. Deploy on Render.com"
echo ""
echo "See DEPLOYMENT-WITH-DATABASE.md for detailed instructions"
