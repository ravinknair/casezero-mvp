#!/bin/bash

# Quick Start Guide for CaseZero Incident Resolution Platform
# This script helps you get the platform up and running quickly

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

echo "🚀 CaseZero Incident Resolution - Quick Start"
echo "=============================================="
echo ""

# Check Node.js version
echo "📋 Checking environment..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js 22+ required (you have $(node -v))"
    exit 1
fi
echo "✓ Node.js $(node -v) OK"

echo ""
echo "📦 Installing dependencies..."
make install

echo ""
echo "📝 Generating database schema..."
npm run db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Start development server:  npm run dev"
echo "2. Once running, seed sample data:"
echo "   curl -X POST http://localhost:3000/api/seed"
echo "3. Open dashboard:  http://localhost:3000/dashboard"
echo ""
echo "📖 Documentation: INCIDENT_RESOLUTION_SETUP.md"
echo ""
