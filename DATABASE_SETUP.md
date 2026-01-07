# Database Setup Guide

## Step 1: Create PostgreSQL Database

### Option A: Supabase (Recommended - Free Tier)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - **Name**: Fishbowl Flex (or your choice)
   - **Database Password**: Create a strong password (save this!) Mydogeatstacos
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for database to be created

### Option B: Railway

1. Go to [https://railway.app](https://railway.app)
2. Sign up/login
3. Click "New Project"
4. Click "Add PostgreSQL"
5. Copy the connection string from the PostgreSQL service

### Option C: Render

1. Go to [https://render.com](https://render.com)
2. Sign up/login
3. Click "New" → "PostgreSQL"
4. Fill in details and create
5. Copy the connection string

## Step 2: Get Database Connection String

### Supabase:

1. Go to your project dashboard
2. Click "Settings" → "Database"
3. Scroll to "Connection string"
4. Select "URI" tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you set when creating the project

### Railway/Render:

- Copy the connection string from the service dashboard
- Format: `postgresql://user:password@host:port/database`

## Step 3: Configure Backend

1. **Install python-dotenv** (if not already installed):

   ```bash
   cd backend
   pip install python-dotenv
   ```

2. **Create a `.env` file** in the `backend` directory:

   ```bash
   cd backend
   touch .env
   ```

3. **Add your database connection string** to `backend/.env`:

   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

4. **Also add your Clerk keys** (if not already present):

   ```env
   CLERK_JWKS_URL=https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json
   CLERK_ISSUER=https://your-clerk-instance.clerk.accounts.dev
   DATABASE_URL=postgresql://...
   ```

   **Example `.env` file:**

   ```env
   # Database
   DATABASE_URL=postgresql://postgres:yourpassword@db.abcdefgh.supabase.co:5432/postgres

   # Clerk Authentication
   CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json
   CLERK_ISSUER=https://your-app.clerk.accounts.dev
   ```

   **Important:** Replace the placeholder values with your actual credentials!

## Step 4: Run Database Migrations

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Create the initial migration:

   ```bash
   alembic revision --autogenerate -m "Initial migration - users and projects"
   ```

3. Apply the migration to create tables:
   ```bash
   alembic upgrade head
   ```

This will create the `users` and `projects` tables in your database.

## Step 5: Verify Database

You can verify the tables were created by:

- **Supabase**: Go to "Table Editor" in dashboard
- **Railway/Render**: Use a database client like pgAdmin or DBeaver

You should see:

- `users` table
- `projects` table

## Troubleshooting

### "Connection refused" error

- Check that your database is running
- Verify the connection string is correct
- Check firewall/network settings

### "Database does not exist" error

- Make sure the database name in the connection string is correct
- Some providers create the database automatically, others require manual creation

### Migration errors

- Make sure `DATABASE_URL` is set correctly
- Check that you have write permissions to the database
- Verify all packages are installed: `pip install -r requirements.txt`

## Next Steps`

Once the database is set up:

1. Start your backend: `uvicorn main:app --reload`
2. Test creating a project through the frontend
3. Verify it appears in your database
