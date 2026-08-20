# 🧪 Interactive Test Dashboard

Your test dashboard can now run tests directly from the web page!

## ✅ How It Works

1. **Start the test server:**
   ```bash
   cd /Users/ravinair/Documents/GitHub/casezero-mvp/casezero-mvp
   node test-reports/server.mjs
   ```

2. **Open the dashboard:**
   ```
   http://localhost:3001
   ```

3. **Click "Run Tests Now"** button to execute tests in real-time

4. **Results update** on the page immediately

---

## 🚀 Quick Start

**Terminal:**
```bash
cd casezero-mvp
node test-reports/server.mjs
```

**Browser:**
```
http://localhost:3001
```

Then click the **"🧪 Run Tests Now"** button!

---

## 📋 What Happens

1. Click "Run Tests Now"
2. Server executes: `node --test tests/casezero-e2e.test.mjs`
3. Test results stream back to the page
4. Dashboard updates with:
   - ✅ Pass/fail counts
   - 📊 Test output
   - ⏱️ Timestamp of last run

---

## 🛠️ Behind the Scenes

- **Server:** `test-reports/server.mjs` (simple Node.js HTTP server)
- **API Endpoint:** `POST /api/run-tests` - Executes tests and returns results
- **Dashboard:** `test-reports/index.html` - Fetches results and displays them

---

## 📱 Features

✅ **Real-time test execution** from the browser  
✅ **Live result updates** - No page reload needed  
✅ **Clean output** - Formatted test results  
✅ **Status indicators** - Pass/fail with visual feedback  
✅ **Timestamps** - Track when tests last ran  
✅ **Error handling** - Clear error messages if something fails  

---

## ⚠️ Troubleshooting

**"Cannot GET /api/run-tests"**
- Make sure you're running: `node test-reports/server.mjs`
- Check that port 3001 is not blocked

**Tests don't update**
- Check browser console (F12) for errors
- Verify server is running (you should see the banner message)
- Try refreshing the page (Ctrl+R)

**Port 3001 already in use**
```bash
# Kill the process using port 3001
lsof -ti :3001 | xargs kill -9

# Then restart
node test-reports/server.mjs
```

---

## 🔗 Commands Summary

| Action | Command |
|--------|---------|
| Start server | `node test-reports/server.mjs` |
| Open dashboard | `http://localhost:3001` |
| Run tests | Click "🧪 Run Tests Now" button |
| Stop server | `Ctrl+C` in terminal |

---

## 📝 Files

- `test-reports/server.mjs` - Backend API server
- `test-reports/index.html` - Interactive dashboard
- `tests/casezero-e2e.test.mjs` - Your test suite

---

**Your interactive test dashboard is ready!** 🎉

Start the server and open http://localhost:3001
