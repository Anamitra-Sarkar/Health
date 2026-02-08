Render deployment instructions for Healthsync

Quick deploy (Render Dashboard):

1. Open the Render dashboard: $BROWSER https://dashboard.render.com/
2. Click "New" → "Web Service".
3. Connect your Git provider (GitHub) if not already connected.
4. Select the repository: `AkankshRakesh/Healthsync` and branch `master`.
5. For "Environment", choose "Docker" so Render builds the provided `Dockerfile`.
6. Service name: `Healthsync` (or pick another short name).
7. (Optional) Add environment variables required by the app (e.g. `MONGO_URI`, any secrets).

   **Required environment variables:**
   ```env
   MONGODB_URI=mongodb+srv://...
   MONGODB_DB=healthsync
   JWT_SECRET=<strong-random-secret>
   PORT=4000
   FRONTEND_URL=https://your-frontend-url
   ENABLE_SOCKETS=true

   # Firebase Admin SDK (Required for authentication)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"

   # Optional
   GROQ_API_KEY=your-groq-api-key
   SERPAPI_KEY=your-serpapi-key
   ```

8. Create the service — Render will build and deploy from the `Dockerfile`.

Optional: Create the service via Render API

1. Set your API key in the terminal (do NOT paste it into public chat):

```bash
export RENDER_API_KEY="<your-render-api-key>"
```

2. Example curl to create a Docker web service (replace placeholders):

```bash
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Healthsync",
    "type":"web_service",
    "repo": {"provider":"github","name":"AkankshRakesh/Healthsync","branch":"master"},
    "env":"docker",
    "dockerfilePath":"Dockerfile"
  }'
```

If you want me to create the Render service for you using your API key, reply "Proceed" and provide a short-lived API key (or set `RENDER_API_KEY` in the terminal and allow me to run the API request). Otherwise, follow the Dashboard steps above.
