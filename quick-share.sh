#!/bin/bash

# CaseZero MVP - Quick Sharing Setup
# Run this to quickly set up ngrok sharing

echo "🚀 CaseZero MVP - Quick Share Setup"
echo "===================================="
echo ""

# Check if dev server is running
echo "📌 Checking if dev server is running on port 3000..."
if ! nc -z localhost 3000 2>/dev/null; then
    echo "❌ Dev server is not running!"
    echo ""
    echo "Start it with: npm run dev"
    echo "Then run this script again."
    exit 1
fi
echo "✓ Dev server is running"
echo ""

# Check if ngrok is installed
echo "📌 Checking for ngrok..."
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Install with: brew install ngrok"
    echo "Then sign up at: https://ngrok.com"
    echo "Then run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    echo "After that, run this script again."
    exit 1
fi
echo "✓ ngrok is installed"
echo ""

# Start ngrok
echo "🌐 Starting ngrok tunnel..."
echo ""
echo "Share this URL with your team:"
echo "===================="
ngrok http 3000

echo ""
echo "===================="
echo "Press Ctrl+C to stop sharing"
