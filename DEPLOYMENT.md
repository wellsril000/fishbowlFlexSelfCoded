# Deployment Guide

## Overview

Your application has **3 components** that need to be deployed:

1. **Frontend** (React/Vite) - Static files served to users
2. **Backend** (FastAPI) - API server handling requests
3. **Database** (PostgreSQL) - Already on Supabase (cloud-hosted)

## Deployment Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │ ──────> │   Backend   │ ──────> │  Database   │
│  (Static)   │         │  (FastAPI)  │         │ (Supabase)  │
└─────────────┘         └─────────────┘         └─────────────┘
```

## Component 1: Frontend Deployment

### Option A: Vercel (Recommended - Easiest)
**Best for:** Quick deployment, automatic HTTPS, free tier

**Steps:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Click "New Project" → Import your GitHub repo
4. Configure:
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variables:
   - `VITE_API_URL` = Your backend URL (e.g., `https://your-backend.railway.app`)
   - `VITE_CLERK_PUBLISHABLE_KEY` = Your Clerk publishable key
6. Deploy!

**Pros:**
- Free tier
- Automatic HTTPS
- Automatic deployments on git push
- CDN for fast global access

**Cons:**
- Need to set environment variables in Vercel dashboard

### Option B: Netlify
Similar to Vercel, also free tier with automatic deployments.

### Option C: AWS S3 + CloudFront
**Best for:** Enterprise, more control

**Steps:**
1. Build: `cd Frontend && npm run build`
2. Upload `dist/` folder to S3 bucket
3. Configure CloudFront for CDN
4. Set up custom domain

**Pros:**
- Very scalable
- Full control

**Cons:**
- More complex setup
- Costs money (though minimal for small traffic)

## Component 2: Backend Deployment

### Option A: Railway (Recommended - Easiest)
**Best for:** Quick deployment, automatic HTTPS, free tier

**Steps:**
1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add service → Select `backend/` directory
5. Railway will auto-detect Python
6. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://... (your Supabase URL)
   CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json
   CLERK_ISSUER=https://your-app.clerk.accounts.dev
   ```
7. Railway will automatically:
   - Install dependencies from `requirements.txt`
   - Run `uvicorn main:app` (you may need to configure this)
8. Get your backend URL (e.g., `https://your-app.railway.app`)

**Configure Start Command:**
- In Railway dashboard → Settings → Add start command:
  ```
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```

**Run Migrations:**
- Railway provides a shell/console
- Run: `alembic upgrade head`

**Pros:**
- Free tier ($5 credit/month)
- Automatic HTTPS
- Easy environment variable management
- Automatic deployments on git push

**Cons:**
- Need to configure start command
- Need to run migrations manually

### Option B: Render
**Best for:** Similar to Railway, also has free tier

**Steps:**
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy!

### Option C: AWS EC2 / Google Cloud Run / Azure
**Best for:** Enterprise, more control, but more complex

## Component 3: Database

✅ **Already deployed!** Your Supabase database is cloud-hosted and ready to use.

**Just make sure:**
- Run migrations: `alembic upgrade head` (before first deployment)
- Database URL is correct in backend environment variables

## Environment Variables Summary

### Frontend (Vercel/Netlify)
```env
VITE_API_URL=https://your-backend.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Backend (Railway/Render)
```env
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json
CLERK_ISSUER=https://your-app.clerk.accounts.dev
```

### Clerk Dashboard
- Update **Allowed Origins** to include your frontend URL
- Update **Redirect URLs** to include your frontend URL

## Deployment Checklist

### Before First Deployment:
- [ ] Run database migrations: `alembic upgrade head`
- [ ] Update Clerk dashboard with production URLs
- [ ] Set all environment variables in deployment platforms
- [ ] Test locally with production-like settings
- [ ] Build frontend: `cd Frontend && npm run build` (verify it works)

### Deployment Steps:
1. [ ] Deploy backend first (Railway/Render)
2. [ ] Get backend URL
3. [ ] Update frontend `VITE_API_URL` with backend URL
4. [ ] Deploy frontend (Vercel/Netlify)
5. [ ] Update Clerk dashboard with frontend URL
6. [ ] Test the full flow end-to-end

## Making Changes After Deployment

### Option 1: Automatic Deployments (Recommended)
**If you connect GitHub to Vercel/Railway:**
- Push code to GitHub → Automatic deployment
- No manual steps needed!

**Workflow:**
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel/Railway automatically:
# 1. Detects the push
# 2. Builds your code
# 3. Deploys to production
# 4. Updates the live site
```

### Option 2: Manual Deployment

**Frontend:**
```bash
cd Frontend
npm run build
# Upload dist/ folder to your hosting service
```

**Backend:**
```bash
cd backend
# Push to GitHub (if using Railway/Render with GitHub)
# OR manually deploy via their dashboard
```

**Database Migrations:**
```bash
# After code changes that affect database
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head  # Run on production server
```

## Updating Environment Variables

### Frontend (Vercel):
1. Go to Vercel dashboard
2. Select your project
3. Settings → Environment Variables
4. Add/Edit variables
5. Redeploy (automatic or manual)

### Backend (Railway):
1. Go to Railway dashboard
2. Select your service
3. Variables tab
4. Add/Edit variables
5. Service will automatically restart

## Production Best Practices

### 1. Use Production Database
- Don't use the same Supabase project for dev and prod
- Create a separate Supabase project for production

### 2. Environment-Specific Settings
- Development: `http://localhost:8000`
- Production: `https://your-backend.railway.app`

### 3. CORS Configuration
Update `backend/main.py` for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
        "https://your-frontend.vercel.app"  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Error Handling
- Production should have minimal console.log
- Use proper error logging (consider Sentry for production)

### 5. Monitoring
- Railway/Render provide basic logs
- Consider adding monitoring (e.g., Sentry, LogRocket)

## Cost Estimate

**Free Tier (Small Scale):**
- Frontend (Vercel): Free
- Backend (Railway): Free ($5 credit/month)
- Database (Supabase): Free (500MB database)
- Clerk: Free (up to 10,000 MAU)
- **Total: $0/month**

**Paid (As You Scale):**
- Railway: ~$5-20/month
- Supabase: ~$25/month (Pro plan)
- Clerk: ~$25/month (Pro plan)
- **Total: ~$50-70/month**

## Quick Start Deployment (Recommended Path)

1. **Deploy Backend to Railway:**
   - Connect GitHub
   - Select `backend/` directory
   - Add environment variables
   - Deploy

2. **Deploy Frontend to Vercel:**
   - Connect GitHub
   - Select `Frontend/` directory
   - Add `VITE_API_URL` = Railway backend URL
   - Deploy

3. **Update Clerk:**
   - Add Vercel URL to allowed origins
   - Add redirect URLs

4. **Run Migrations:**
   - Use Railway console: `alembic upgrade head`

5. **Test:**
   - Visit your Vercel URL
   - Try logging in and creating a project

## Troubleshooting

### Backend won't start:
- Check start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Check environment variables are set
- Check logs in Railway/Render dashboard

### Frontend can't connect to backend:
- Check `VITE_API_URL` is correct
- Check CORS settings in backend
- Check backend is actually running

### Database connection fails:
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Verify password is URL-encoded

### Authentication not working:
- Check Clerk keys are correct
- Check Clerk dashboard has correct URLs
- Check CORS allows your frontend domain

## Need Help?

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

