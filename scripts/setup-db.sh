#!/bin/bash

# CaseZero Database Setup Script

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

echo "🚀 CaseZero Database Setup"
echo "=========================="

# Generate Drizzle migrations
echo "📝 Generating database migrations..."
npm run db:generate

# Check if database needs initialization
echo "✓ Database migrations generated"
echo ""
echo "📌 Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Visit http://localhost:3000/api/seed with POST to populate sample data"
echo "3. Navigate to http://localhost:3000/dashboard to view cases"
echo ""
echo "For production deployment:"
echo "1. Create a D1 database: wrangler d1 create casezero"
echo "2. Update .hosting/hosting.json with the D1 binding name"
echo "3. Run migrations: wrangler d1 execute casezero --file drizzle/0000_*.sql"
echo "4. Deploy: wrangler deploy"
