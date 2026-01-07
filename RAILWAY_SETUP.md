# Railway Setup Instructions

## Critical Step: Set Root Directory

Railway needs to know that your backend code is in the `backend/` folder. Here's how to configure it:

### Step 1: Open Service Settings

1. In Railway dashboard, click on your **project** (not the service card)
2. Click on the **`fishbowlFlexSelfCoded`** service
3. Click on the **"Settings"** tab (top navigation)

### Step 2: Find Root Directory Setting

In the Settings page, look for one of these options:

**Option A: Under "Source" Section**

- Scroll down to find **"Source"** section
- Look for **"Root Directory"** or **"Source Directory"**
- Set it to: `backend`

**Option B: Under "Build & Deploy" Section**

- Look for **"Build & Deploy"** section
- Find **"Root Directory"** or **"Working Directory"**
- Set it to: `backend`

**Option C: If you don't see Root Directory**

1. Go to **Variables** tab
2. Look for **"RAILWAY_SERVICE_ROOT"** or similar
3. Or go back to **Settings** → Look for **"Deploy"** or **"Build"** sections

### Step 3: Set Start Command (if not already set)

In **Settings** → **Deploy** section:

- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Alternative: Delete and Recreate Service

If you can't find Root Directory setting:

1. **Delete the current service:**

   - Go to service → Settings → Scroll down → **"Delete Service"**

2. **Create a new service:**

   - In your Railway project, click **"New"** → **"GitHub Repo"**
   - Select your repository
   - Railway should ask for configuration - look for **"Root Directory"** during setup
   - Set it to: `backend`

3. **After creating, add environment variables:**
   - `DATABASE_URL=your-supabase-url`
   - `CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json`
   - `CLERK_ISSUER=https://your-app.clerk.accounts.dev`

### What to Look For in Settings Tab

When you're in the Settings tab, you should see sections like:

- Source / Repository
- Build & Deploy
- Variables
- Networking
- Health Check

The **Root Directory** should be in **"Source"** or **"Build & Deploy"** section.

### Still Can't Find It?

1. Take a screenshot of the Settings page and share it
2. Or check Railway's documentation: https://docs.railway.com/develop/railway-toml

The key is: **Railway needs `backend/` as the root so it can find `requirements.txt` and auto-detect Python.**
