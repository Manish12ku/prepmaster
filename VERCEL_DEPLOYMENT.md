# Vercel Deployment Guide for PrepMaster Frontend

## ✅ Issues Fixed

1. **Fixed frontend/package.json** - Was corrupted with wrong workspace configuration
2. **Added vercel.json** - Proper Vercel deployment configuration
3. **Restored correct dependencies** - All React and Vite packages are now properly configured
4. **Build tested** - Successfully builds locally

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel
```

### Option 2: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

## ⚠️ Important: Environment Variables

You **MUST** add these environment variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following:

```
VITE_API_URL=https://your-backend-url.com/api
```

**Note**: Replace `https://your-backend-url.com` with your actual backend URL.

### Backend URL Options:

- If backend is on Render: `https://prepmaster-backend.onrender.com/api`
- If backend is on Railway: `https://prepmaster-production.up.railway.app/api`
- If backend is local (testing only): `http://localhost:5000/api`

## 🔧 Vercel Configuration

The `vercel.json` file includes:
- SPA routing (all routes go to index.html)
- Proper build and output configuration
- Vite framework detection

## 📝 Post-Deployment Checklist

- [ ] Environment variables added to Vercel
- [ ] Backend is deployed and accessible
- [ ] CORS is configured in backend to allow Vercel domain
- [ ] Firebase configuration is correct
- [ ] Test login/authentication flow
- [ ] Test API calls to backend

## 🐛 Common Issues

### Issue: Build fails on Vercel
**Solution**: Check that `frontend/package.json` has correct dependencies (now fixed)

### Issue: API calls fail after deployment
**Solution**: Add `VITE_API_URL` environment variable in Vercel settings

### Issue: CORS errors
**Solution**: Update backend CORS configuration to include your Vercel domain

### Issue: 404 on page refresh
**Solution**: The `vercel.json` rewrites configuration handles this (already configured)

## 🔒 Security Note

Your Firebase config is exposed in the client code (this is normal for Firebase), but make sure:
- Firebase security rules are properly configured
- Backend API validation is in place
- Sensitive operations require authentication
