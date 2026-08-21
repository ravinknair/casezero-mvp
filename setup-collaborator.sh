#!/bin/bash

# CaseZero MVP - Collaborator Quick Setup
# This script helps new team members get started quickly

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$PROJECT_DIR"

echo "🚀 CaseZero MVP - Team Setup"
echo "================================"
echo ""

# Check Node version
echo "📌 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node 22.13.0 or higher."
    echo "   Visit: https://nodejs.org/ or use: brew install node"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "⚠️  Node version $(node -v) detected. Requires >=22.13.0"
    echo "   Use nvm: nvm install 22.13.0 && nvm use 22.13.0"
    exit 1
fi
echo "✓ Node $(node -v) detected"

# Check npm
echo "📌 Checking npm..."
npm -v > /dev/null || { echo "❌ npm not found"; exit 1; }
echo "✓ npm $(npm -v) available"

# Check git
echo "📌 Checking git..."
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi
echo "✓ Git $(git --version | cut -d' ' -f3) available"

echo ""
echo "📦 Installing dependencies..."
make install || { echo "❌ Installation failed"; exit 1; }
echo "✓ Dependencies installed"

APP_ENV_FILE="$PROJECT_DIR/casezero-mvp/.dev.vars"
if [ ! -f "$APP_ENV_FILE" ]; then
    echo ""
    echo "🔐 Creating local development settings at casezero-mvp/.dev.vars"
    cat > "$APP_ENV_FILE" <<'EOF'
CASEZERO_SESSION_SECRET=local-development-session-secret
EOF
    echo "✓ Local .dev.vars created. This file is ignored by git."
else
    echo "✓ Existing casezero-mvp/.dev.vars found"
fi

echo ""
echo "🧰 Checking Wrangler CLI..."
if [ -x "$PROJECT_DIR/casezero-mvp/node_modules/.bin/wrangler" ]; then
    "$PROJECT_DIR/casezero-mvp/node_modules/.bin/wrangler" --version || true
else
    echo "⚠️  Wrangler was not found in app dependencies. Run: make install"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open browser: http://localhost:3000"
echo "3. Visit ServiceNow setup: http://localhost:3000/admin/integrations/servicenow"
echo "4. Run tests: npm run test"
echo "5. Run full check: npm run check"
echo "6. ServiceNow test: configure a workspace connector token from the Admin page"
echo ""
echo "📚 For more info, see COLLABORATOR_RUNBOOK.md and COLLABORATORS.md"
echo ""
