# HealthSync Setup Guide

This guide explains how to set up and run the HealthSync application locally with all features working.

## Prerequisites

- Node.js 22.x or higher
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB instance)
- Firebase project (for authentication)

## Environment Configuration

The application requires environment variables for both backend and frontend.

### Backend Environment Variables

A `.env` file needs to be created in the `backend/` directory with the following configuration:

```env
# Database Configuration (Required)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
MONGODB_DB=healthsync

# Authentication (Required)
JWT_SECRET=<your-secure-random-secret-key>

# Server Configuration (Required)
PORT=4000
FRONTEND_URL=http://localhost:3000

# Real-time Features (Required)
ENABLE_SOCKETS=true

# Email Configuration (Required for password reset feature)
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-app-specific-password>

# Firebase Admin SDK (Required for Firebase Authentication)
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_CLIENT_EMAIL=<your-firebase-client-email>
FIREBASE_PRIVATE_KEY="<your-firebase-private-key>"

# AI Integration (Optional - Required for disease information features)
GROQ_API_KEY=<your-groq-api-key>
SERPAPI_KEY=<your-serpapi-key>
```

**Important:** 
- Replace `<username>`, `<password>`, `<cluster>`, and `<appName>` with your MongoDB Atlas credentials
- Generate a secure random string for `JWT_SECRET` (e.g., using `openssl rand -hex 32`)
- For email functionality, use Gmail with an App Password (not your regular password)
  - Enable 2FA on your Google account
  - Generate an App Password at: https://myaccount.google.com/apppasswords
- Get Firebase service account credentials from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- Get `GROQ_API_KEY` from: https://console.groq.com/
- Get `SERPAPI_KEY` from: https://serpapi.com/
- The `.env` file is gitignored for security. Never commit credentials to version control.

### Frontend Environment Variables

A `.env` file needs to be created in the `react/` directory for local development:

```env
# Backend API Configuration (Required)
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_API_BASE_URL=/api

# Google OAuth (Optional - Only if using legacy Google login)
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>

# Firebase Client SDK (Required for Firebase Authentication)
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-firebase-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
```

These settings point the frontend to your local backend server.

**Note:** 
- `VITE_GOOGLE_CLIENT_ID` is only needed if you want to enable legacy Google OAuth login
- Get your Google OAuth Client ID from: https://console.cloud.google.com/apis/credentials
- Firebase config values can be found in your Firebase Console under Project Settings → General → Your apps

## Installation Steps

### 1. Create Environment Files

**Backend .env file:**
```bash
cd backend
cat > .env << 'EOF'
# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
MONGODB_DB=healthsync

# Authentication
JWT_SECRET=<your-secure-random-secret-key>

# Server Configuration
PORT=4000
FRONTEND_URL=http://localhost:3000

# Real-time Features
ENABLE_SOCKETS=true

# Email Configuration (for password reset)
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASSWORD=<your-app-specific-password>

# Firebase Admin SDK
FIREBASE_PROJECT_ID=<your-firebase-project-id>
FIREBASE_CLIENT_EMAIL=<your-firebase-client-email>
FIREBASE_PRIVATE_KEY="<your-firebase-private-key>"

# AI Integration (optional)
GROQ_API_KEY=<your-groq-api-key>
SERPAPI_KEY=<your-serpapi-key>
EOF
```

Replace the placeholders with your actual values.

**Frontend .env file:**
```bash
cd react
cat > .env << 'EOF'
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-firebase-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
EOF
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd react
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The backend will start on `http://localhost:4000`

### Start Frontend Development Server

In a new terminal:

```bash
cd react
npm run dev
```

The frontend will start on `http://localhost:3000`

## Features Enabled

- ✅ **MongoDB Connection**: Configured to connect to MongoDB Atlas
- ✅ **Firebase Authentication**: Firebase-based login, signup, and Google sign-in
- ✅ **JWT Authentication**: Secure token-based authentication issued after Firebase verification
- ✅ **Chat History**: AI chat conversations persisted in MongoDB
- ✅ **Real-time Socket.IO**: Enabled for live notifications and updates
- ✅ **CORS**: Configured to allow frontend-backend communication
- ✅ **API Endpoints**: All REST API routes available

## Testing the Application

1. **Sign Up**: Navigate to `http://localhost:3000/signup` to create a new account
2. **Login**: Navigate to `http://localhost:3000/login` to sign in
3. **Dashboard**: Access the EMR dashboard after successful login
4. **Real-time Features**: Socket.IO connections for live notifications

## Troubleshooting

### MongoDB Connection Issues

If you see DNS resolution errors like `ENOTFOUND` or `querySrv EREFUSED`:
- Check your internet connection
- Verify the MongoDB URI is correct
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check if your network allows connections to MongoDB Atlas
- Try using a standard connection string instead of SRV format if DNS issues persist

### Port Already in Use

If port 4000 or 3000 is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Modify `server.port` in `react/vite.config.ts`

### Environment Variables Not Loading

Make sure:
- `.env` files are in the correct directories (`backend/.env` and `react/.env`)
- No typos in variable names
- Restart the servers after changing `.env` files

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique values for `JWT_SECRET` in production
- Regularly rotate database credentials
- Enable MongoDB Atlas IP whitelisting in production

## Architecture

- **Backend**: Express.js server with Socket.IO for real-time features
- **Frontend**: React with Vite for fast development
- **Database**: MongoDB Atlas for data persistence
- **Authentication**: Firebase Authentication (client SDK) + JWT tokens issued by backend after Firebase token verification, with bcrypt password hashing for legacy endpoints
- **Real-time**: Socket.IO for live notifications and updates
