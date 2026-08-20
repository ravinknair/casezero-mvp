# 🎯 Quick Reference Card - Share with Your Team

## Copy & Paste This for Your Team

---

### 📍 GITHUB REPOSITORY
```
https://github.com/ravinknair/casezero-mvp
```

### 🚀 30-SECOND SETUP

```bash
# 1. Clone
git clone https://github.com/ravinknair/casezero-mvp.git
cd casezero-mvp

# 2. Setup (auto-installs dependencies)
chmod +x setup-collaborator.sh
./setup-collaborator.sh

# 3. Start
npm run dev

# 4. Open browser
http://localhost:3000
```

### 🧪 TESTING
```bash
npm run test        # Run all tests
npm run test:dashboard   # Open the test dashboard
npm run lint        # Check code style
npm run build       # Build for production
```

### 🌐 LIVE DEMO (shared with you)
```
[Link will be provided via ngrok or Vercel]
```

### 📚 DOCUMENTATION
- **No-Questions Runbook:** COLLABORATOR_RUNBOOK.md
- **Setup Guide:** COLLABORATORS.md
- **Project Info:** README.md
- **Sharing Help:** SHARE_CHECKLIST.md
- **Issue Tracker:** GitHub Issues tab

### 🎮 COMMANDS CHEATSHEET
```bash
npm run dev         # Start development server
npm run test        # Run tests
npm run build       # Build production bundle
npm run lint        # Check code quality
npm run check       # Lint + test + build
npm run smoke:servicenow  # Local ServiceNow webhook smoke test
make dev            # Alternative: make dev
make test           # Alternative: make test
make build          # Alternative: make build
```

### ❓ STUCK?
1. Check COLLABORATORS.md - complete setup instructions
2. Check README.md - project documentation
3. Open a GitHub Issue
4. Ask in the project discussions

### 💡 TIPS
- Use branches for new features: `git checkout -b feature/name`
- Pull latest changes often: `git pull origin main`
- Run tests before pushing: `npm run test`
- Push to GitHub: `git push origin feature/name` then create Pull Request

---

## For Project Owner (You)

### ADD COLLABORATORS TO GITHUB
1. Go to: https://github.com/ravinknair/casezero-mvp/settings/access/collaborators
2. Click "Add people"
3. Enter their GitHub username
4. Select "Push" access
5. They get email invite - they accept it

### SHARE LIVE DEMO - OPTION A (ngrok)
```bash
# Terminal 1
npm run dev

# Terminal 2
./quick-share.sh

# Or manually:
ngrok http 3000

# Share the forwarding URL (e.g. https://abc123.ngrok.io)
```

### SHARE LIVE DEMO - OPTION B (Vercel)
```bash
npm install -g vercel
cd casezero-mvp
vercel

# Share the URL (e.g. https://casezero-mvp.vercel.app)
```

### PUSH UPDATES
```bash
git add .
git commit -m "Feature: description"
git push origin main
```

### MERGE PULL REQUESTS
- Team pushes to branches and creates Pull Requests
- GitHub runs CI/CD automatically
- Review and merge when tests pass

---

## PROJECT STRUCTURE

```
casezero-mvp/
├── casezero-mvp/          ← Main application
│   ├── app/               ← React components
│   ├── tests/             ← Test files (9 tests)
│   ├── test-reports/      ← Test dashboard HTML
│   └── package.json       ← App dependencies
├── .github/workflows/     ← GitHub Actions CI/CD
├── Makefile               ← Quick commands
├── start.sh               ← Start dev server
├── stop.sh                ← Stop dev server
├── restart.sh             ← Restart dev server
└── README.md              ← Full documentation
```

---

## TEST RESULTS

✅ **All 16 Tests Passing**
- certificate approval → verified resolution
- incident approval → verified resolution
- database approval → verified resolution
- support approval → verified resolution
- access approval → verified resolution
- pipeline approval → verified resolution
- rejection logic → records decision, no execution
- stop-condition rollback → doesn't resolve
- idempotence → duplicate approval is safe
- ServiceNow FCR payload normalization
- ServiceNow invalid payload rejection
- dashboard metrics stable response shape
- FCR maturity window, escalation, and repeat-contact logic

---

## ENVIRONMENT REQUIREMENTS

- **Node.js:** 22.13.0 or higher
- **npm:** 10.0.0 or higher
- **Git:** Latest version
- **OS:** macOS, Linux, or Windows (with WSL)

---

**Ready to collaborate? You've got everything!** 🚀
