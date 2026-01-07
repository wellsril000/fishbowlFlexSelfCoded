# Clerk Authentication Setup Guide

## Step 1: Create Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Sign Up" and create a free account
3. You'll be taken to the Clerk dashboard

## Step 2: Create a Clerk Application

1. In the Clerk dashboard, click "Create Application"
2. Choose a name for your application (e.g., "Fishbowl Flex")
3. Select authentication methods:
   - **Email** (recommended)
   - Optionally: Google, GitHub, etc.
4. Click "Create Application"

## Step 3: Get Your API Keys

1. In your Clerk dashboard, go to **API Keys** (in the sidebar)
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

## Step 4: Configure Frontend

1. Create a `.env` file in the `Frontend/` directory:

   ```bash
   cd Frontend
   touch .env
   ```

2. Add your Clerk publishable key:

   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   VITE_API_URL=http://localhost:8000
   ```

3. Restart your frontend dev server if it's running

## Step 5: Configure Backend

1. Create a `.env` file in the `backend/` directory:

   ```bash
   cd backend
   touch .env
   ```

2. Add your Clerk keys:

   ```
   CLERK_SECRET_KEY=sk_test_your_secret_key_here
   CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

3. Restart your backend server if it's running

## Step 6: Set Up Admin User (Optional)

1. In Clerk dashboard, go to **Users**
2. Create your first user account (or sign up through the app)
3. To make yourself admin:
   - Go to **Users** → Select your user
   - Go to **Metadata** tab
   - Add custom metadata:
     - Key: `role`
     - Value: `admin`

## Step 7: Test Authentication

1. Start your backend:

   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start your frontend:

   ```bash
   cd Frontend
   npm run dev
   ```

3. Visit your app - you should be redirected to the sign-in page
4. Sign in with your Clerk account
5. You should now see the home page with a user button in the navbar

## Troubleshooting

### "VITE_CLERK_PUBLISHABLE_KEY is not set"

- Make sure you created the `.env` file in the `Frontend/` directory
- Make sure the key starts with `VITE_` (required for Vite)
- Restart your dev server after adding the `.env` file

### "CLERK_SECRET_KEY not configured"

- Make sure you created the `.env` file in the `backend/` directory
- Check that the key is correct
- Restart your backend server

### Token verification fails

- Make sure both frontend and backend are using the same Clerk application
- Check that your keys match (publishable key in frontend, secret key in backend)

## Next Steps

Once authentication is working:

1. We'll set up the database (PostgreSQL)
2. We'll create project management features
3. We'll integrate projects with the import flow
