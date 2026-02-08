# HealthSync backend

This folder contains a small Express backend that implements the API the React app expects. It mirrors the endpoints previously in the Next.js `frontend` API routes.

Available endpoints

**Authentication:**
- POST /api/auth/login (legacy)
- POST /api/auth/signup (legacy)
- POST /api/auth/firebase — verify Firebase ID token and issue JWT
- GET  /api/auth/me
- POST /api/auth/logout
- POST /api/auth/forgot-password — sends password reset via Firebase

**Organizations:**
- GET  /api/organizations

**Chat History:**
- GET    /api/chats — list all chats for current user
- GET    /api/chats/:id — get a specific chat
- POST   /api/chats — create a new chat
- PUT    /api/chats/:id — update a chat
- DELETE /api/chats/:id — delete a chat

Environment variables
- `MONGODB_URI` — (optional) MongoDB connection string. If omitted the server uses an in-memory store (useful for quick testing).
- `MONGODB_DB` — (optional) database name (default: healthsync).
- `JWT_SECRET` — secret used to sign JWT tokens (default is `change-this-secret` — change for production).
- `PORT` — port for the server (default 3000).
- `FIREBASE_PROJECT_ID` — Firebase project ID (required for Firebase authentication).
- `FIREBASE_CLIENT_EMAIL` — Firebase service account email (required for Firebase authentication).
- `FIREBASE_PRIVATE_KEY` — Firebase service account private key (required for Firebase authentication).

Run locally

```powershell
cd backend
npm install
npm run dev
```

Deploy
- Render (recommended for a full Node process): create a new Web Service and point it to this folder's start command `npm start`.
- Vercel: Vercel primarily uses serverless functions; this Express app can be deployed as a Docker service or you can port the routes into Vercel Serverless Functions if you prefer.
