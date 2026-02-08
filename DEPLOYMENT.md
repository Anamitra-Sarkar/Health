# 🚀 HealthSync Deployment Guide

This guide provides step-by-step instructions for deploying the HealthSync application to production:
- **Frontend**: Vercel
- **Backend**: Render

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] MongoDB Atlas database set up and configured
- [ ] Firebase project created with Authentication enabled
- [ ] All required API keys obtained (Groq, SerpAPI, Google OAuth - optional)
- [ ] Firebase service account credentials downloaded (for backend)
- [ ] Firebase web app config obtained (for frontend)
- [ ] Email account configured for password reset (Gmail with App Password)
- [ ] GitHub repository access
- [ ] Vercel account (free tier works)
- [ ] Render account (free tier works)

## 🗄️ MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Select "Free" tier (M0)
   - Choose a cloud provider and region closest to your users
   - Name your cluster (e.g., "healthsync-cluster")

3. **Configure Database Access**
   - Go to "Database Access" in the sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Grant "Read and write to any database" permission

4. **Configure Network Access**
   - Go to "Network Access" in the sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Render and Vercel to connect

5. **Get Connection String**
   - Go to "Database" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Add `?appName=HealthSync` at the end

## 🔧 Backend Deployment (Render)

### Step 1: Prepare Backend

1. **Push Code to GitHub**
   ```bash
   git push origin main
   ```

2. **Verify Dockerfile**
   - Ensure `Dockerfile` is in the root directory
   - Ensure Node version is 22 (already fixed in this PR)

### Step 2: Deploy on Render

1. **Sign Up / Log In to Render**
   - Go to https://render.com
   - Sign up or log in

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your Health repository

3. **Configure Service**
   - **Name**: `healthsync-backend` (or your preferred name)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your production branch)
   - **Instance Type**: `Free` (for testing) or `Starter` (for production)

4. **Add Environment Variables**
   Click "Advanced" and add these environment variables:

   ```env
   # Required
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=HealthSync
   MONGODB_DB=healthsync
   JWT_SECRET=<generate-random-64-char-string>
   PORT=4000
   FRONTEND_URL=https://your-app.vercel.app
   ENABLE_SOCKETS=true
   NODE_ENV=production
   
   # Firebase Admin SDK (Required for Firebase Authentication)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"
   
   # Email (Required for password reset)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   
   # Optional (for AI features)
   GROQ_API_KEY=your-groq-api-key
   SERPAPI_KEY=your-serpapi-key
   ```

   **How to generate JWT_SECRET:**
   ```bash
   openssl rand -hex 32
   ```

   **Note about FRONTEND_URL:**
   - You'll update this after deploying frontend.
   - For now, use a placeholder: `https://healthsync-temp.vercel.app`.
   - If you have multiple frontend domains (custom domain + Vercel preview), provide a comma-separated list:
     `FRONTEND_URL=https://healthsync.com,https://healthsync-temp.vercel.app`

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your Docker container
   - Wait 3-5 minutes for first deployment
   - Copy your backend URL (e.g., `https://healthsync-backend.onrender.com`)

### Step 3: Verify Backend

1. **Test Health Endpoint**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```
   
   Should return:
   ```json
   {
     "ok": true,
     "status": "healthy",
     "timestamp": "...",
     "uptime": 123.45,
     "socketConnections": 0,
     "socketEnabled": true
   }
   ```

2. **Check Logs**
   - In Render dashboard, click on your service
   - Go to "Logs" tab
   - Verify no errors
   - Should see: "HealthSync backend listening on port 4000"

## 🎨 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update vercel.json** (if needed)
   The current `vercel.json` routes API calls to serverless functions:
   ```json
   {
     "version": 2,
     "routes": [
       { "src": "/api/(.*)", "dest": "/api/[...slug].js" }
     ]
   }
   ```
   **Note**: For production, we recommend pointing frontend directly to Render backend instead of using Vercel serverless functions for API.

2. **Create Production Environment File**
   Create `react/.env.production`:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   VITE_API_BASE_URL=/api
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
   Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### Step 2: Deploy on Vercel

1. **Sign Up / Log In to Vercel**
   - Go to https://vercel.com
   - Sign up or log in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect it as a monorepo

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `react` (important!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Go to "Environment Variables" and add:
   
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   VITE_API_BASE_URL=/api
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
   
   **Important**: Replace `your-backend-url.onrender.com` with your actual Render URL!

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build and deployment
   - Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 3: Update Backend CORS

1. **Configure FRONTEND_URLS** (Required)
   - In Render backend service settings, set the `FRONTEND_URLS` environment variable
   - This environment variable accepts **comma-separated** frontend origins
   - Example: `FRONTEND_URLS=https://your-app.vercel.app,https://your-custom-domain.com`
   - The backend will automatically allow CORS and Socket.IO connections from all listed origins
   - **Why this matters**: Prevents Socket.IO handshake rejections and allows multiple deployment environments
   - If not set, the backend falls back to the hardcoded default (`https://health-bice-rho.vercel.app`)
   - **Note**: This replaces any previous `FRONTEND_URL` variable if you were using it

2. **Redeploy Backend** (if needed)
   - Render will auto-redeploy when you change environment variables
   - Or manually trigger redeploy

### Step 4: Important Environment Variable Notes

**Frontend Environment Variables (Vercel)**
- `VITE_API_URL`: The full URL of your backend (e.g., `https://your-backend.onrender.com`)
- `VITE_SOCKET_URL`: The Socket.IO URL, typically same as `VITE_API_URL` (optional, defaults to `VITE_API_URL`)
- These variables are **required** for the frontend to connect to your backend
- Without them, the app falls back to hardcoded defaults which may not match your deployment

**Backend Environment Variables (Render)**
- `FRONTEND_URLS`: Comma-separated list of allowed frontend origins for CORS and Socket.IO
- Example: `FRONTEND_URLS=https://healthsync.vercel.app,https://healthsync-preview.vercel.app`
- **Important**: Include all frontend URLs where your app is deployed (production, preview, custom domains)
- Omit this variable to use the default hardcoded origin

**Why These Matter**
- The frontend uses `VITE_API_URL` and `VITE_SOCKET_URL` to know where to send API requests
- The backend uses `FRONTEND_URLS` to determine which origins are allowed to connect
- Mismatch between these causes CORS errors and Socket.IO connection failures
- Setting these correctly ensures seamless deployment across different environments

### Step 5: Verify Frontend

1. **Open Your Vercel URL**
   - Visit `https://your-app.vercel.app`
   - Homepage should load

2. **Test Authentication**
   - Go to `/signup`
   - Create a test account
   - Verify signup works
   - Try logging in

3. **Test Real-time Features**
   - After login, open dashboard
   - Open browser console (F12)
   - Look for Socket.IO connection messages
   - Should see: "Successfully connected to HealthSync real-time service"

## 🔐 Security Configuration

### 1. Gmail App Password (for email features)

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Name it "HealthSync"
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` in Render

### 2. Groq API Key (for AI features)

1. **Sign Up for Groq**
   - Go to https://console.groq.com/
   - Create free account

2. **Create API Key**
   - Go to "API Keys"
   - Click "Create API Key"
   - Copy the key
   - Add to Render as `GROQ_API_KEY`

### 3. SerpAPI Key (for research papers)

1. **Sign Up for SerpAPI**
   - Go to https://serpapi.com/
   - Create free account (100 searches/month free)

2. **Get API Key**
   - Go to dashboard
   - Copy your API key
   - Add to Render as `SERPAPI_KEY`

### 4. Google OAuth (optional, for legacy Google login)

> **Note:** Google sign-in now primarily uses Firebase `signInWithPopup` with `GoogleAuthProvider`. The legacy Google OAuth flow below is only needed for backward compatibility.

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create new project

2. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins: Add your Vercel URL
   - Authorized redirect URIs: Add `https://your-app.vercel.app/login`
   - Copy the Client ID
   - Add to Vercel as `VITE_GOOGLE_CLIENT_ID`

### 5. Firebase Setup (Required for Authentication)

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Click "Add project"
   - Enter project name and follow the wizard

2. **Enable Authentication Providers**
   - Go to "Authentication" → "Sign-in method"
   - Enable "Email/Password"
   - Enable "Google" (select a support email)

3. **Get Web App Config (Frontend)**
   - Go to Project Settings → General → Your apps
   - Click "Add app" → Web (</>) if not already added
   - Copy the `firebaseConfig` values and set them as `VITE_FIREBASE_*` env vars on Vercel

4. **Get Service Account Credentials (Backend)**
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - From the downloaded JSON, set on Render:
     - `FIREBASE_PROJECT_ID` → `project_id`
     - `FIREBASE_CLIENT_EMAIL` → `client_email`
     - `FIREBASE_PRIVATE_KEY` → `private_key` (include the quotes, preserve newlines)

## 🎯 Post-Deployment Testing

### 1. Health Check

**Backend:**
```bash
curl https://your-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "ok": true,
  "status": "healthy",
  "socketEnabled": true
}
```

### 2. Authentication Flow

1. **Signup**
   - Go to `https://your-app.vercel.app/signup`
   - Create organization account
   - Email: `test-org@example.com`
   - Password: `TestPass123`
   - Organization: `Test Hospital`

2. **Login**
   - Go to `https://your-app.vercel.app/login`
   - Login with created credentials
   - Should redirect to dashboard

3. **Create Patient**
   - In dashboard, click "New Patient"
   - Fill in patient details
   - Should create successfully

### 3. Real-time Features

1. **Open Two Browser Windows**
   - Window 1: Login as organization
   - Window 2: Login as doctor

2. **Test Patient Assignment**
   - In Window 1 (org), assign patient to doctor
   - Window 2 (doctor) should receive real-time notification
   - Check browser console for Socket.IO messages

### 4. API Endpoints

Test key endpoints:
```bash
# Get current user (after getting token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.onrender.com/api/auth/me

# Get patients
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.onrender.com/api/patients
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
- ✅ Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- ✅ Verify connection string is correct
- ✅ Check database user permissions

**Problem**: "JWT authentication failed"
- ✅ Ensure `JWT_SECRET` is set in Render
- ✅ Must be at least 32 characters
- ✅ Cannot contain special characters that need escaping

**Problem**: Backend spins down (free tier)
- ✅ Expected behavior on Render free tier (15 min inactivity)
- ✅ Keep-alive ping every 2 minutes keeps it warm
- ✅ First request after spindown takes ~30 seconds
- ✅ Upgrade to Starter plan for always-on

### Frontend Issues

**Problem**: "Network Error" when calling API
- ✅ Check `VITE_API_URL` points to correct Render URL
- ✅ Verify CORS is configured in backend (FRONTEND_URL)
- ✅ Check browser console for CORS errors

**Problem**: Socket.IO not connecting
- ✅ Verify `ENABLE_SOCKETS=true` in Render
- ✅ Check `VITE_SOCKET_URL` matches Render URL
- ✅ Socket.IO requires WebSocket support (enabled on Render)

**Problem**: Build fails on Vercel
- ✅ Ensure root directory is set to `react`
- ✅ Check all dependencies are in `react/package.json`
- ✅ Verify TypeScript errors are fixed

### Email Issues

**Problem**: Password reset emails not sending
- ✅ Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set
- ✅ Use App Password, not regular Gmail password
- ✅ Enable 2FA on Gmail account
- ✅ Check Render logs for email errors

## 📊 Monitoring & Maintenance

### Render Monitoring

1. **Check Logs**
   - Go to your service in Render
   - Click "Logs" tab
   - Monitor for errors

2. **Check Metrics**
   - CPU usage
   - Memory usage
   - Response times

### Vercel Monitoring

1. **Analytics**
   - Go to your project
   - Click "Analytics"
   - Monitor page views, performance

2. **Deployment Logs**
   - Check build logs for errors
   - Monitor function execution

### Database Monitoring

1. **MongoDB Atlas**
   - Check "Metrics" tab
   - Monitor connections, operations
   - Set up alerts for issues

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Backend (Render):**
- Render auto-deploys on every push to `main` branch
- Configure in Render: Settings → "Auto-Deploy" → Yes

**Frontend (Vercel):**
- Vercel auto-deploys on every push to `main` branch
- Also creates preview deployments for PRs

### Manual Deployment

**Backend:**
- Render Dashboard → Your Service → "Manual Deploy" → "Deploy latest commit"

**Frontend:**
- Vercel Dashboard → Your Project → "Deployments" → "Redeploy"

## 🚀 Scaling for Production

### When to Upgrade

**Render:**
- Free tier: Good for testing, low traffic
- Starter ($7/mo): Always-on, better for production
- Standard ($25/mo): High traffic, 4GB RAM

**Vercel:**
- Hobby (free): Personal projects, low traffic
- Pro ($20/mo): Production apps, better performance

**MongoDB Atlas:**
- M0 (free): 512MB storage, good for testing
- M10 ($9/mo): 10GB storage, production-ready

### Performance Optimization

1. **Enable Caching**
   - Add Redis for session caching
   - Cache API responses

2. **Database Indexes**
   - Create indexes on frequently queried fields
   - `users.email`, `patients.organizationId`, etc.

3. **CDN**
   - Vercel automatically uses CDN
   - Assets are globally distributed

## ✅ Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Firebase Authentication configured (Email/Password and Google providers enabled)
- [ ] Firebase Admin SDK credentials set on backend
- [ ] Firebase Client SDK config set on frontend
- [ ] MongoDB Atlas secured (IP whitelist, strong passwords)
- [ ] JWT secret is strong random string
- [ ] CORS configured properly
- [ ] Email functionality tested
- [ ] SSL/HTTPS working (automatic on Vercel/Render)
- [ ] Socket.IO connecting successfully
- [ ] All API endpoints tested
- [ ] Authentication flow working
- [ ] Database backups configured (MongoDB Atlas auto-backups)
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)
- [ ] Custom domain configured (optional)

## 📞 Support

If you encounter issues:

1. **Check Logs**
   - Render: Service → Logs
   - Vercel: Project → Deployments → Build Logs
   - Browser Console (F12)

2. **Review Documentation**
   - Render: https://render.com/docs
   - Vercel: https://vercel.com/docs
   - MongoDB: https://docs.mongodb.com/

3. **Common Solutions**
   - Redeploy backend and frontend
   - Clear browser cache
   - Check all environment variables
   - Verify MongoDB connection

## 🎉 Success!

Your HealthSync application should now be running in production:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Database: MongoDB Atlas
- ✅ Real-time: Socket.IO working
- ✅ Authentication: Firebase Authentication + JWT
- ✅ Email: Password reset via Firebase
- ✅ AI Features: Groq + SerpAPI (if configured)
- ✅ Chat History: Conversations persisted in MongoDB

Happy deploying! 🚀
