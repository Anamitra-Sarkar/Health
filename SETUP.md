# HealthSync Setup Guide

This guide explains how to set up and run the HealthSync application locally with all features working.

## Prerequisites

- Node.js 22.x or higher
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB instance)

## Environment Configuration

The application requires environment variables for both backend and frontend.

### Backend Environment Variables

A `.env` file has been created in the `backend/` directory with the following configuration:

```env
MONGODB_URI=mongodb+srv://koyeliyaghoshcse2023_db_user:KLZ9sT4Gvt9VbyWB@cluster0.7rfpons.mongodb.net/?appName=Cluster0
MONGODB_DB=healthsync
JWT_SECRET=1b51ba56573c17593369995033d10633
PORT=4000
FRONTEND_URL=http://localhost:3000
ENABLE_SOCKETS=true
```

**Important:** The `.env` file is gitignored for security. Make sure to create it locally with your own credentials.

### Frontend Environment Variables

A `.env` file has been created in the `react/` directory for local development:

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_API_BASE_URL=/api
```

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

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
- ✅ **JWT Authentication**: Secure token-based authentication for login/signup
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

If you see DNS resolution errors like `EREFUSED _mongodb._tcp.cluster0...`:
- Check your internet connection
- Verify the MongoDB URI is correct
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check if your network allows connections to MongoDB Atlas

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
- **Authentication**: JWT tokens with bcrypt password hashing
- **Real-time**: Socket.IO for live notifications and updates
