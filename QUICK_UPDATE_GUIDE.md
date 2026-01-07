# Quick Update Guide

## Making Changes After Deployment

### If You Have Automatic Deployments Set Up (GitHub → Vercel/Railway)

**Simple workflow:**
```bash
# 1. Make your changes locally
# 2. Test locally
npm run dev  # Frontend
# In another terminal:
cd backend && uvicorn main:app --reload  # Backend

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 4. Wait 2-5 minutes
# Vercel and Railway will automatically:
# - Detect the push
# - Build your code
# - Deploy to production
# - Your site is updated!
```

### If You Need to Update Environment Variables

**Frontend (Vercel):**
1. Go to vercel.com → Your project
2. Settings → Environment Variables
3. Edit or add variables
4. Click "Redeploy" (or wait for next git push)

**Backend (Railway):**
1. Go to railway.app → Your project
2. Click on your backend service
3. Variables tab
4. Edit or add variables
5. Service automatically restarts

### If You Need to Update Database Schema

**After changing models.py:**
```bash
# 1. Create migration locally
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "Description of changes"

# 2. Test migration locally
alembic upgrade head

# 3. Push code to GitHub (migration file included)

# 4. Run migration on production
# Option A: Railway Console
# - Go to Railway dashboard
# - Click on your backend service
# - Open "Deploy Logs" or "Shell"
# - Run: alembic upgrade head

# Option B: SSH/Remote Access
# - Connect to your production server
# - Run: alembic upgrade head
```

### Common Update Scenarios

#### Adding a New Feature
1. Code changes locally
2. Test locally
3. `git add . && git commit -m "Add feature" && git push`
4. Automatic deployment happens
5. Test on production URL

#### Fixing a Bug
1. Fix locally
2. Test the fix
3. `git add . && git commit -m "Fix bug" && git push`
4. Automatic deployment happens
5. Verify fix on production

#### Updating Dependencies

**Frontend:**
```bash
cd Frontend
npm install package-name
npm install  # Update package-lock.json
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install package-name
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update dependencies"
git push
```

#### Changing Environment Variables
- Update in Vercel/Railway dashboard
- Redeploy (or wait for next git push)
- No code changes needed

## Rollback (If Something Breaks)

### Vercel (Frontend):
1. Go to Vercel dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Railway (Backend):
1. Go to Railway dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "Redeploy"

### Database:
```bash
# Rollback last migration
alembic downgrade -1

# Or rollback to specific version
alembic downgrade <revision_id>
```

## Testing Production Updates

**Before pushing:**
1. Test locally with `npm run dev` and `uvicorn main:app --reload`
2. Build frontend: `cd Frontend && npm run build` (check for errors)
3. Run backend: `cd backend && uvicorn main:app` (check for errors)

**After deployment:**
1. Visit your production URL
2. Test critical flows:
   - Login
   - Create project
   - Upload file
   - Validate data
   - Export to Excel

## Pro Tips

1. **Use Git Branches for Big Changes:**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Test on preview deployment
   # Merge to main when ready
   ```

2. **Check Deployment Logs:**
   - Vercel: Dashboard → Deployments → Click deployment → View logs
   - Railway: Dashboard → Service → Deploy Logs

3. **Monitor After Updates:**
   - Check Railway/Render logs for backend errors
   - Check browser console for frontend errors
   - Test user flows

4. **Keep Environment Variables in Sync:**
   - Document all env vars needed
   - Update both dev and prod when adding new ones

