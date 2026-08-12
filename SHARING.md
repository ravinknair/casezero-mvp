# Sharing CaseZero MVP with Collaborators

## Step 1: Share the GitHub Repository

Your repo is already public at: **https://github.com/ravinknair/casezero-mvp**

### To add collaborators with write access:
1. Go to https://github.com/ravinknair/casezero-mvp
2. Click **Settings** (top right)
3. Click **Collaborators** (left sidebar)
4. Click **Add people**
5. Enter their GitHub usernames and select the permission level:
   - **Pull access**: View code only
   - **Triage access**: Can manage issues
   - **Push access**: Can push code changes (recommended for active collaborators)
   - **Maintain access**: Can manage repo without access to sensitive actions
   - **Admin access**: Full control

They'll receive an invitation email and can accept to gain access.

---

## Step 2: Create a Public Link for the Running App

The app is currently running on `http://localhost:3000` but only accessible locally.

### Option A: Using ngrok (Recommended)
1. Install ngrok:
   ```bash
   brew install ngrok
   ```

2. Sign up for free at https://ngrok.com

3. Authenticate ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. Expose your local dev server:
   ```bash
   ngrok http 3000
   ```

5. ngrok will show:
   ```
   Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
   ```

6. Share that URL with your collaborators: `https://abc123.ngrok.io`

**Note:** The ngrok URL changes each time you restart. Use a fixed domain if ngrok is already paid.

### Option B: Deploy to Vercel (Permanent)
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd casezero-mvp
   vercel
   ```

3. Vercel provides a permanent URL like `https://casezero-mvp.vercel.app`

### Option C: Use GitHub Actions + Deployment
The `ci.yml` workflow can be extended to auto-deploy to Vercel or Netlify.

---

## Step 3: Share Access Instructions

Send your collaborators this info:

```
📝 CaseZero MVP - Shared Project

GitHub Repository:
👉 https://github.com/ravinknair/casezero-mvp

Live Demo:
👉 https://abc123.ngrok.io  (or your deployed Vercel URL)

To run locally:
1. Clone: git clone https://github.com/ravinknair/casezero-mvp
2. Install: npm install (from root) or cd casezero-mvp && npm install
3. Start dev: npm run dev
4. Open: http://localhost:3000
5. Run tests: npm run test
6. Build: npm run build

Project Structure:
- casezero-mvp/ - Main Next.js app
- .github/workflows/ci.yml - CI/CD pipeline
- Makefile - Local automation shortcuts
- README.md - Full documentation
```

---

## Sharing Checklist

- [x] GitHub repo is public
- [ ] Add collaborators to the repo (Settings → Collaborators)
- [ ] Set up ngrok or deploy to Vercel
- [ ] Share the public URL
- [ ] Share these instructions with your team

---

## Managing Collaborators

To remove a collaborator:
1. Go to Settings → Collaborators
2. Click the "X" next to their name
3. Confirm removal

To manage permissions:
1. Go to Settings → Collaborators
2. Click the dropdown next to their name
3. Select new permission level
