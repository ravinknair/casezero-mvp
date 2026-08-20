# 🚀 CaseZero MVP - Team Sharing Package

Complete setup and sharing instructions for collaborators.

---

## 📋 Quick Links

**No-Questions Runbook for Mandar and Iranga:**
```
COLLABORATOR_RUNBOOK.md
```

**GitHub Repository:**
```
https://github.com/ravinknair/casezero-mvp
```

**Live Demo (Local - you share this):**
```
Will be provided via ngrok or deployment link
```

---

## 👥 Step 1: Add Collaborators to GitHub

### For the Project Owner (You):

1. **Open GitHub Settings:**
   - Go to https://github.com/ravinknair/casezero-mvp
   - Click `Settings` tab (top right)
   - Click `Collaborators` in left sidebar

2. **Add Collaborators:**
   - Click `Add people` button
   - Enter their GitHub username
   - Select permission level:
     - **Push** (Recommended): Can view & push code
     - **Pull**: Read-only access
   - Click `Add <username> to this repository`

3. **They will receive an email invitation**
   - They need to accept the invitation to gain access

### For Collaborators (Your team):

When you receive an invitation:
1. Check your GitHub email
2. Click the invitation link or go to https://github.com/notifications
3. Click "View invitation"
4. Click "Accept invitation"

---

## 💻 Step 2: Setup Instructions (For All Team Members)

### Prerequisites
- Node.js 22.13.0 or higher (use nvm if needed)
- Git
- A text editor or IDE (VS Code recommended)

### Clone the Repository

```bash
# Clone the repo
git clone https://github.com/ravinknair/casezero-mvp.git

# Navigate to project
cd casezero-mvp
```

### Install Dependencies

```bash
# From project root
make install
```

### Start Development Server

```bash
# From project root
npm run dev

# Or use the shortcut script (Mac/Linux)
./start.sh

# Or use make
make dev
```

The app will start on: **http://localhost:3000**

Open these productized FCR pages:

- Dashboard: http://localhost:3000/dashboard
- ServiceNow onboarding: http://localhost:3000/admin/integrations/servicenow
- Leadership brief: http://localhost:3000/reports/leadership-brief
- Security posture: http://localhost:3000/security

### Run Tests

```bash
# From project root
npm run test

# Or with make
make test

# Or open the test dashboard
npm run test:dashboard
```

### Build for Production

```bash
npm run build

# Or with make
make build
```

### Other Commands

```bash
# Lint code
npm run lint

# Run full check (lint + test + build)
npm run check
make check

# Run local ServiceNow webhook smoke test
npm run smoke:servicenow
make smoke-servicenow

# Stop dev server
./stop.sh

# Restart dev server cleanly
./restart.sh
```

---

## 🌐 Step 3: Share the Live Demo Link

### Option A: Using ngrok (Temporary, Free)

**Setup (Do this once):**
```bash
# Install ngrok
brew install ngrok

# Sign up for free: https://ngrok.com
# Get your auth token from dashboard

# Authenticate
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE

# Test it works
ngrok http 3000
```

**Every time you want to share:**
```bash
# Start your dev server (in one terminal)
npm run dev

# In another terminal, expose it
ngrok http 3000

# Copy the forwarding URL (looks like: https://abc123.ngrok.io)
# Share this link with your team
```

**Share this with collaborators:**
```
🔗 Live Demo: https://abc123.ngrok.io
(Note: This link expires when ngrok closes. I'll update you with a new one when restarting)
```

### Option B: Deploy to Vercel (Permanent)

**Setup (Do this once):**
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from casezero-mvp folder
cd casezero-mvp
vercel

# Follow prompts, get your permanent URL
```

**Share this with collaborators:**
```
🔗 Live Demo: https://casezero-mvp.vercel.app
```

---

## 📧 Email Template for Your Team

Copy and send this to your 2 collaborators:

```
---

Hi [Name],

I've shared the CaseZero MVP project with you! Here's how to get started:

📍 CODE ACCESS
GitHub: https://github.com/ravinknair/casezero-mvp
(You should have received an invitation email - accept it to get access)

🚀 TO RUN LOCALLY
1. Clone: git clone https://github.com/ravinknair/casezero-mvp.git
2. Install: make install
3. Start: npm run dev
4. Open: http://localhost:3000

🌐 LIVE DEMO
[CHOOSE ONE - Share the link you set up]
- Using ngrok: https://abc123.ngrok.io
- Using Vercel: https://casezero-mvp.vercel.app

🧪 RUN TESTS
npm run test

📚 PROJECT STRUCTURE
- casezero-mvp/ - Main Next.js application
- .github/workflows/ci.yml - Automated CI/CD pipeline
- casezero-mvp/tests/ - Deterministic test suite
- README.md - Full project documentation

📚 RUNBOOK
Start with COLLABORATOR_RUNBOOK.md. It has the exact local run, smoke-test, D1 migration, Wrangler, and troubleshooting commands.

---
```

---

## 🔄 Workflow for Collaboration

### Pulling Latest Changes
```bash
git pull origin main
```

### Making Changes
```bash
# Create a branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run test
npm run lint

# Commit
git add .
git commit -m "Description of changes"

# Push
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Go to https://github.com/ravinknair/casezero-mvp
# Click "Compare & pull request"
```

### Reviewing Changes
- GitHub will run CI/CD automatically
- All tests must pass before merging
- Team members can review and approve

### Merging
```bash
# After approval, merge on GitHub or locally
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

---

## 🛠️ Makefile Shortcuts (For Quick Commands)

Available from project root:
```bash
make install   # Install dependencies
make dev       # Start dev server
make build     # Build for production
make test      # Run tests
make lint      # Lint code
make check     # Run lint + test + build
make ci        # Run full CI checks
```

---

## 📁 Project Structure

```
casezero-mvp/
├── casezero-mvp/           # Main application
│   ├── app/                # Next.js app directory
│   ├── tests/              # Test files
│   ├── scripts/            # Helper scripts
│   ├── test-reports/       # Test report dashboard
│   ├── package.json        # App dependencies
│   └── vite.config.ts      # Build config
├── .github/workflows/      # GitHub Actions CI/CD
├── Makefile                # Local automation
├── start.sh                # Start dev server
├── stop.sh                 # Stop dev server
├── restart.sh              # Restart dev server
├── LICENSE                 # MIT License
├── README.md               # Project documentation
└── COLLABORATORS.md        # This file
```

---

## ✅ Checklist Before Sharing

- [x] GitHub repo created and public
- [x] Repository has comprehensive README
- [x] All code is committed and pushed
- [x] Tests pass locally (npm run test)
- [x] .gitignore includes build artifacts
- [ ] Add collaborators to GitHub repo
- [ ] Set up ngrok or Vercel deployment
- [ ] Send collaborators this guide + live demo link
- [ ] Share live demo link with team
- [ ] Test that collaborators can clone and run

---

## 🆘 Troubleshooting

### "Node version does not match"
```bash
# Install correct Node version with nvm
nvm install 22.13.0
nvm use 22.13.0
```

### "Port 3000 is already in use"
```bash
# Kill process on port 3000
./stop.sh

# Or manually
lsof -ti :3000 | xargs kill -9

# Then restart
npm run dev
```

### "Tests fail locally but pass in GitHub Actions"
```bash
# Ensure you're on the latest code
git pull origin main

# Clear cache and reinstall
rm -rf casezero-mvp/node_modules casezero-mvp/.next
make install

# Run tests again
npm run check
```

### "Can't connect to ngrok link"
```bash
# Verify dev server is running
npm run dev

# Verify ngrok is running (in another terminal)
ngrok http 3000

# Check ngrok status dashboard: http://localhost:4040
```

### "Permission denied when cloning"
```bash
# Add SSH key to GitHub
# https://github.com/settings/keys
# Or use HTTPS with personal access token

# If using HTTPS:
git clone https://github.com/ravinknair/casezero-mvp.git
# Enter username and personal access token as password
```

---

## 📞 Support

For issues or questions:
1. Check README.md in the repo
2. Review GitHub Issues tab
3. Check GitHub Discussions
4. Reach out to @ravinknair on GitHub

---

**Last Updated:** 2026-08-12
**Project:** CaseZero MVP
**Repository:** https://github.com/ravinknair/casezero-mvp
