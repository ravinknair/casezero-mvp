# 🔐 Give GitHub Code Access to Team Members

Complete guide to add mrpophali@gmail.com and prasadsmy@gmail.com as collaborators.

---

## 📋 What You Need

To add them as collaborators, you need their **GitHub usernames** (not email addresses).

**Example:**
- Email: mrpophali@gmail.com → GitHub username might be: `mrpophali` or something else
- Email: prasadsmy@gmail.com → GitHub username might be: `prasadsmy` or something else

---

## 🔍 STEP 1: Find Their GitHub Usernames

### Option A: Ask Them Directly
Send a quick message asking:
```
What's your GitHub username?
You can find it at: https://github.com/[your-username]
Or in GitHub Settings → Profile
```

### Option B: Search GitHub Website
1. Go to https://github.com/search
2. Search for their email or name
3. Click on their profile
4. Copy their username from the URL (github.com/USERNAME)

### Option C: Check If They Already Have GitHub
1. Visit: https://github.com/mrpophali (replace with their potential username)
2. If the profile exists, that's their username!

---

## ✅ STEP 2: Add Them as GitHub Collaborators

Once you have their GitHub usernames, follow these steps:

### Instructions:

1. **Open GitHub Settings:**
   - Go to: https://github.com/ravinknair/casezero-mvp/settings/access/collaborators
   - Or: Repository → Settings → Collaborators (in left sidebar)

2. **Add First Collaborator (mrpophali):**
   - Click the green "Add people" button
   - Type their GitHub username in the search box
   - Click on their profile when it appears
   - Select permission level (choose "Push" for active collaborators)
   - Click "Add <username> to this repository"

3. **Add Second Collaborator (prasadsmy):**
   - Click "Add people" again
   - Repeat the same process with the second username
   - Select "Push" access
   - Click "Add to repository"

4. **Confirm:**
   - Both should appear in the Collaborators list
   - They will receive email invitations at their GitHub-registered email

---

## 📧 STEP 3: They Accept the Invitation

After you add them:

1. **They receive an email** from GitHub saying they've been invited
2. **They click the invitation link** or go to: https://github.com/notifications
3. **They click "Accept invitation"**
4. **Done!** They now have access to the repository

---

## 🔐 Permission Levels Explained

| Level | Can Do | Best For |
|-------|--------|----------|
| **Pull** | View code only | Read-only collaborators |
| **Triage** | View + manage issues | Issue managers |
| **Push** | View + push code changes | Active developers ⭐ |
| **Maintain** | View + push + manage settings | Team leads |
| **Admin** | Full control | Project owners |

**Recommended for your team:** Choose **"Push"** so they can:
- ✅ View all code
- ✅ Clone the repository
- ✅ Create branches
- ✅ Push their changes
- ✅ Create pull requests

---

## 📝 Email Template to Get Their GitHub Usernames

Copy and send this to both of them:

```
Hi Pophali/Prasad,

I want to add you as a collaborator on the GitHub project. 

To do this, I need your GitHub username.

You can find it here:
1. Go to https://github.com/login and sign in
2. Click your profile icon (top right)
3. Click "Your profile"
4. Look at the URL or your profile page - your username is there

For example, if your GitHub profile is https://github.com/johndoe
Then your username is: johndoe

Please reply with your GitHub username and I'll add you immediately!

Thanks!
```

---

## 🚀 Complete Flow After They're Added

Once you add them as collaborators:

1. **They accept GitHub invitation** (email link)
2. **They clone the repository:**
   ```bash
   git clone https://github.com/ravinknair/casezero-mvp.git
   cd casezero-mvp
   ```

3. **They run setup:**
   ```bash
   chmod +x setup-collaborator.sh
   ./setup-collaborator.sh
   ```

4. **They start developing:**
   ```bash
   npm run dev
   ```

5. **They push changes:**
   ```bash
   git checkout -b feature/my-feature
   # Make changes
   git add .
   git commit -m "Description"
   git push origin feature/my-feature
   ```

6. **GitHub Actions runs CI/CD** automatically
7. **You review and merge** their Pull Request

---

## 🔍 VERIFY ACCESS

After adding them, verify they have access:

1. **Check Collaborators List:**
   - Go to: https://github.com/ravinknair/casezero-mvp/settings/access/collaborators
   - Both should appear in the list

2. **Check Their Email:**
   - They should have received GitHub invitation emails
   - Invitations expire after 7 days if not accepted

3. **Test Cloning:**
   - Have them try: `git clone https://github.com/ravinknair/casezero-mvp.git`
   - Should work without authentication issues

---

## 🛠️ MANAGE ACCESS LATER

### Change Permission Level:
1. Go to Collaborators settings
2. Click the dropdown next to their name
3. Select new permission level
4. Confirm

### Remove Access:
1. Go to Collaborators settings
2. Click the "X" button next to their name
3. Confirm removal

---

## ❓ COMMON ISSUES

### "Can't find their GitHub username"
- Ask them directly
- Check their GitHub profile URL
- Search for them on github.com

### "Invitation sent but they didn't receive it"
- Check their spam folder
- Verify they have a GitHub account
- Resend the invitation from the Collaborators page

### "They can't clone the repository"
- Make sure they've accepted the invitation
- Check they're using the correct SSH or HTTPS URL
- Verify their SSH key is added to GitHub (if using SSH)

### "Changes appear to be from wrong user"
- Have them set their Git config:
  ```bash
  git config user.name "Their Name"
  git config user.email "their.email@gmail.com"
  ```

---

## ✅ YOUR ACTION CHECKLIST

- [ ] Send email to mrpophali@gmail.com asking for GitHub username
- [ ] Send email to prasadsmy@gmail.com asking for GitHub username
- [ ] Receive their GitHub usernames
- [ ] Add mrpophali as collaborator with Push access
- [ ] Add prasadsmy as collaborator with Push access
- [ ] Verify both appear in Collaborators list
- [ ] Confirm they received invitation emails
- [ ] They accept the invitations
- [ ] Test that they can clone the repo
- [ ] They run ./setup-collaborator.sh
- [ ] They start developing!

---

## 🔗 IMPORTANT LINKS

| Task | Link |
|------|------|
| Add Collaborators | https://github.com/ravinknair/casezero-mvp/settings/access/collaborators |
| Repository | https://github.com/ravinknair/casezero-mvp |
| Your Profile | https://github.com/ravinknair |
| GitHub Search | https://github.com/search |

---

## 📞 QUICK REFERENCE

**To add collaborators:**
```
https://github.com/ravinknair/casezero-mvp/settings/access/collaborators
```

**They need:**
- GitHub account (free at https://github.com/signup)
- Git installed
- Node.js 22.13.0+

**After they're added, they can:**
- Clone the code
- Run tests
- Make changes
- Push to branches
- Create pull requests

---

**Project:** CaseZero MVP
**Repository:** https://github.com/ravinknair/casezero-mvp
**Status:** Ready to add collaborators
