# ⚡ Quick Railway Deployment Checklist

## 📦 Before You Start
- [ ] Create MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas/register
- [ ] Get MongoDB connection string

## 🚀 Deploy Steps (5 Minutes)

### 1. Push to GitHub
```bash
cd c:\Users\manku\Downloads\PrepMaster
git add .
git commit -m "Deploy backend to Railway"
git push
```

### 2. Deploy on Railway
1. Go to: https://railway.app/
2. Click: **New Project** → **Deploy from GitHub repo**
3. Select: your `prepmaster` repo

### 3. Configure Railway
1. **Settings** → **Root Directory**: `backend`
2. **Variables** → Add these:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prepmaster
   FIREBASE_PROJECT_ID=mock-test81
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@mock-test81.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   ```

### 4. Get Your URL
Railway gives you: `https://prepmaster-production.up.railway.app`

### 5. Update Frontend
1. Go to Vercel Dashboard
2. Update `VITE_API_URL` = `https://YOUR_RAILWAY_URL/api`
3. Redeploy frontend

### 6. Test
```
https://YOUR_RAILWAY_URL/api/health
```
Should return: `{"status":"OK","message":"PrepMaster API is running"}`

---

## 🎉 Done! Your stack:
- Frontend: Vercel
- Backend: Railway  
- Database: MongoDB Atlas

**Full guide**: See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
