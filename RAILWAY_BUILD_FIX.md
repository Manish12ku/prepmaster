# 🔧 Railway Build Error Fix

## ❌ Error: "Error creating build plan with Railpack"

This error happens when Railway can't find or detect your `package.json` file.

---

## ✅ Solution: Fix Railway Configuration

### **Step 1: Verify Root Directory Setting**

This is the **MOST COMMON** issue:

1. Go to your Railway project dashboard
2. Click on your **service** (backend)
3. Go to **"Settings"** tab
4. Find **"Root Directory"**
5. Set it to: `backend`
   - ⚠️ NOT `./backend`
   - ⚠️ NOT `/backend`
   - ✅ Just `backend`

### **Step 2: Push railway.json to Git**

I just created a `railway.json` file. You need to push it:

```bash
cd c:\Users\manku\Downloads\PrepMaster
git add backend/railway.json
git commit -m "Add Railway configuration"
git push
```

### **Step 3: Redeploy on Railway**

1. In Railway dashboard, click **"Deployments"** tab
2. Click **"Redeploy"** on the latest commit
3. Or trigger a new deployment by pushing a commit

---

## 🔍 Alternative Solutions

### **Option A: Use Nixpacks (Already Configured)**

The `railway.json` I created uses Nixpacks builder, which is Railway's modern build system.

### **Option B: Remove Conflicting Files**

If you have any of these files in the `backend/` folder, **DELETE** them:
- `Dockerfile` (unless you want to use Docker)
- `docker-compose.yml`
- Any other build configuration files

Railway will try to use them instead of the Node.js builder.

### **Option C: Manual Build Command**

If automatic detection still fails:

1. Go to Railway → Settings
2. Find **"Build Command"**
3. Set it to: `npm install`
4. Find **"Start Command"**  
5. Set it to: `node src/server.js`

---

## 📋 Checklist Before Redeploying

- [ ] Root Directory is set to `backend` (not `./backend`)
- [ ] `railway.json` is pushed to Git
- [ ] `package.json` exists in `backend/` folder
- [ ] `package.json` has `"start": "node src/server.js"` script
- [ ] No Dockerfile in backend folder (unless intentional)
- [ ] Environment variables are configured

---

## 🚀 Complete Redeployment Steps

### 1. Push the railway.json file
```bash
cd c:\Users\manku\Downloads\PrepMaster
git add .
git commit -m "Fix Railway build configuration"
git push
```

### 2. Configure Railway
1. Go to: https://railway.app/
2. Select your project
3. Click on the backend service
4. **Settings** tab:
   - **Root Directory**: `backend`
   - **Watch Paths**: `backend/**/*`

### 3. Trigger Redeployment
- Railway should auto-deploy from the new Git push
- OR manually click **"Deployments"** → **"Redeploy"**

### 4. Check Build Logs
- Click on the deployment
- View **"Build"** logs
- Should see:
  ```
  Nixpacks detected Node.js
  Installing dependencies...
  Building...
  ```

---

## 🐛 Still Getting Errors?

### Check These:

1. **Is package.json actually in backend folder?**
   ```bash
   ls backend/package.json
   ```

2. **Is it valid JSON?**
   ```bash
   cat backend/package.json
   ```

3. **Check Git is tracking the file:**
   ```bash
   git ls-files backend/
   ```

4. **Try creating a new Railway project:**
   - Delete the current project on Railway
   - Create new project
   - Connect to GitHub repo
   - Set Root Directory to `backend`
   - Add environment variables
   - Deploy

---

## ✅ Expected Build Output

When it works, you should see:

```
==> Running build...
==> Detected Node.js
==> Installing dependencies...
added X packages
==> Build complete
==> Starting service...
Server running on port 5000
MongoDB Connected: ...
```

---

## 📞 Quick Fix Summary

**The issue is almost always:**
1. ❌ Root Directory not set correctly
2. ❌ package.json not in the right place
3. ❌ Git not pushed with latest changes

**Fix:**
1. ✅ Set Root Directory to `backend`
2. ✅ Push railway.json to Git
3. ✅ Redeploy on Railway
