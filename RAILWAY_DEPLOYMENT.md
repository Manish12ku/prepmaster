# 🚀 Deploy PrepMaster Backend on Railway

## ✅ What's Been Prepared

1. ✅ Created `Procfile` - Tells Railway how to start your app
2. ✅ Created `.gitignore` - Prevents sensitive files from being uploaded
3. ✅ Backend is Railway-ready with proper configuration

---

## 📋 Step-by-Step Deployment Guide

### **Step 1: Prepare Your MongoDB Database**

Railway doesn't include MongoDB by default, so you have **3 options**:

#### **Option A: Use MongoDB Atlas (RECOMMENDED - Free)**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user (username & password)
5. Whitelist IP: `0.0.0.0/0` (allow all IPs)
6. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/prepmaster?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your credentials

#### **Option B: Use Railway MongoDB (Easiest)**

We'll add this during Railway deployment (see Step 4)

#### **Option C: Use MongoDB on Render/Another Provider**

Same as Option A, just different hosting

---

### **Step 2: Push Backend to GitHub**

Railway needs your code on Git:

```bash
cd c:\Users\manku\Downloads\PrepMaster

# Initialize Git if not already done
git init

# Add backend folder
git add backend/

# Commit
git commit -m "Prepare backend for Railway deployment"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/prepmaster.git
git push -u origin main
```

**OR** if you already have a Git repo, just push your latest changes.

---

### **Step 3: Connect to Railway**

1. **Go to**: https://railway.app/
2. **Sign up/Login** with GitHub
3. **Click**: "New Project"
4. **Choose**: "Deploy from GitHub repo"
5. **Select** your `prepmaster` repository
6. **Railway will auto-detect** your backend

---

### **Step 4: Add MongoDB to Railway**

#### **If using Railway MongoDB:**

1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add MongoDB"**
3. Railway will provision a MongoDB instance
4. Copy the `MONGODB_URI` from the variables

#### **If using MongoDB Atlas:**

Skip this step - you already have your connection string from Step 1

---

### **Step 5: Configure Environment Variables**

In your Railway project dashboard:

1. Click on your **backend service**
2. Go to **"Variables"** tab
3. Add these environment variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/prepmaster
FIREBASE_PROJECT_ID=mock-test81
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@mock-test81.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCWzyFE6+v27Tnv
1+4WnN567+nQpxvEV8F92twK3v/edmi+UppLkZ9AXvHUg6B4W04QG9GMCStUmtia
7vvlFxj5dZwFDfbjVUF/ksqiBenjVjQxUFH0vtzzSckH5PEYZ5G3l25GTgVzegS1
0P4auQRxqfl3Bf0a9t8rwiHA9RCg/cNDFqj8pXXux5LTfoSRyCLNYIvAtIcjLAcP
aNE0kHBarJz8DixXVEWeOhZow+XDzWB3SfTnIW39fsfFhaKrGrYED9jfN0WFAoCD
aWqcUvkDdtGnFu52urODFb8ZqtJqs1n6yPrlnHbXdoc0Xi6im47loo2/tAfA74Dj
5NlnhfLbAgMBAAECggEAA6U8IgtfgXElYZVwDVHh1HzwkCxwVzDiREv1d7nOQfvN
kMdnlwRziHEDGkz+pKPB+x4aoaG/6P3ZPV2IVanwq5vayqOv+ezTD+XMSibBPmj6
2AC5PaS2q8oQnV7WYrpvyYCHZOGr76lEBeHobClYYMFoGCcOTqGOR+OCDcUFKUip
LArM8KXXQTaLWJ0HfUwRW1NfOSTTCUbqaepcNAbWokWZTunknXOgMPvFeCr2FT8a
gJ6JTtQJUbaxnA5aQX7cdkfSOF8jDUyqIYjgiHpTNrOYvG9trwW55CecAp86f46b
0Ak4WKNeZcqilTdiFRBqvbwH7Xo1aXAep1pfTqbmaQKBgQDElHUKBXUpSSeOmJDq
jPGv0qqnRJkc5PByGkku3is89DrRqCQHPY20ZxPsHzgA0VT2F4Hc+ScMHtaN8Bsh
Jpa/mykG+j8nohwSZhfbl4I4gBYAkjAHkx5xTtXXfrLmvg1ja6ujT4yTuIGiLxxA
HrU4dr4FxIxr1yZVfrNjn2qVJwKBgQDEZOIqSR7tbRETVH8eP5nPSK0DVLPNk2bH
JOU/HqudSs5slQmaXQ66nWFuEgRne6KRZVWQ8C9MGD9tZAvsCKZK1jlQfVxmNfEG
oPQEHk5MECBdwwLOcpa2s5pnbCn+8F84rUNaMdJgyMGTcE3XboVQjxZK6aXl2hb6
rbaSq8tNLQKBgEHcTz4VSASWCte+i8bZg9vZY+14kSfaGCjSX7SBINFiLhayE6gN
Wl2Xr1gLuZKkj6eHhq3HF+r6pf2V9TDtIdJ+JIe+7cvUhz0u0U1z/F/7oeN9FvRi
uO9Tb1esjjm6cPffSfkEHOAdD+mLiRZ+c07AkbeS+0ziH2jDc0ysS2Q/AoGAVIM9
OAkjP/SRRooz8aZY3/RcT3ShszNdJRFhfVoLa7KHRf6UlVK6Rd/3z0/9iTKQ8JR0
z9wr3kkI8l/9KWNHfCjXnSV1H57Sy5FzsFoCQ4UlCHQkvwZciN6c8SiAoe56a39T
3npWF8QMWRAYzz4GLHaGl1IYS+MfxFwAlvlKkTkCgYEAnS5BOvyKNK8YMR15RPuM
eslhDeEqyREhT0RrOt3FtkUXALTYHz/5jz64KSk90OGBwYp63LzL1IJ7QXoDa8fY
aBYvLtpVLny5HFcS8A6diBL2zuIubK9WF95Ex8cjKu0hz8UNLjyTx7ZbiXD41AHM
KU61onDOfJ/pusJqxI07xWQ=
-----END PRIVATE KEY-----

NODE_ENV=production
```

**⚠️ IMPORTANT**: 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- The `FIREBASE_PRIVATE_KEY` should be exactly as shown (with `\n` for newlines)
- Do NOT include quotes around the private key

---

### **Step 6: Configure Root Directory**

Since your backend is in a subfolder:

1. In Railway, go to **"Settings"** tab
2. Find **"Root Directory"**
3. Set it to: `backend`
4. Railway will now look for `package.json` in the `backend/` folder

---

### **Step 7: Deploy!**

Railway will automatically:
1. Detect your `package.json`
2. Run `npm install`
3. Start your server with `npm start`

You'll see a deployment URL like:
```
https://prepmaster-production.up.railway.app
```

---

### **Step 8: Test Your Backend**

1. **Health Check**:
   ```
   https://YOUR_RAILWAY_URL.up.railway.app/api/health
   ```
   Should return: `{"status":"OK","message":"PrepMaster API is running"}`

2. **Test API endpoints** in your browser or Postman

---

### **Step 9: Update Frontend Environment Variable**

After Railway deployment, update your Vercel frontend:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Update `VITE_API_URL` to:
   ```
   https://YOUR_RAILWAY_URL.up.railway.app/api
   ```
3. **Redeploy** your frontend on Vercel

---

## 🔍 Troubleshooting

### Issue: Build fails on Railway

**Solution**: 
- Check that Root Directory is set to `backend`
- Make sure `package.json` has correct `start` script
- Check deployment logs in Railway

### Issue: MongoDB connection fails

**Solution**:
- Verify `MONGODB_URI` is correct
- If using Atlas, check IP whitelist includes `0.0.0.0/0`
- Check database user credentials

### Issue: Firebase authentication fails

**Solution**:
- Ensure `FIREBASE_PRIVATE_KEY` has correct format (with `\n`)
- No quotes around the private key value
- Check all Firebase variables are set

### Issue: CORS errors

**Solution**: Your backend already has `cors()` enabled, which allows all origins. This should work automatically.

---

## 📊 Railway Project Structure

```
Railway Project
└── prepMaster (GitHub Repo)
    └── backend/ (Root Directory)
        ├── src/
        │   └── server.js (Entry point)
        ├── package.json
        ├── Procfile (web: npm start)
        └── Environment Variables
            ├── PORT
            ├── MONGODB_URI
            ├── FIREBASE_PROJECT_ID
            ├── FIREBASE_CLIENT_EMAIL
            └── FIREBASE_PRIVATE_KEY
```

---

## 💰 Railway Pricing

- **Free Tier**: $5 credit/month (enough for small apps)
- **Hobby Plan**: $5/month
- Your backend should fit within the free tier for light usage

---

## 🎯 Quick Checklist

- [ ] MongoDB database created (Atlas or Railway)
- [ ] Code pushed to GitHub
- [ ] Railway project created from GitHub repo
- [ ] Root Directory set to `backend`
- [ ] Environment variables configured
- [ ] MongoDB connected successfully
- [ ] Health endpoint responds
- [ ] Frontend `VITE_API_URL` updated to Railway URL
- [ ] Frontend redeployed on Vercel

---

## 🔒 Security Notes

1. **Never commit `.env` files** to Git (already in `.gitignore`)
2. **Use Railway Variables** for all sensitive data
3. **Firebase private key** is stored securely in Railway, not in code
4. **CORS is open** (`cors()` allows all origins) - consider restricting to your Vercel domain in production

---

## 🚀 After Deployment

Once your backend is live on Railway:

1. **Update Vercel frontend** with new backend URL
2. **Test full authentication flow** (Google login, email, phone)
3. **Test API endpoints** (tests, results, questions)
4. **Monitor logs** in Railway dashboard for any errors

Your full stack will be:
- **Frontend**: Vercel (https://prepmaster-silk.vercel.app)
- **Backend**: Railway (https://prepmaster-production.up.railway.app)
- **Database**: MongoDB Atlas or Railway MongoDB
