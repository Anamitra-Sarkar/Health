# Multi-stage Dockerfile for Healthsync (build React frontend, run Node backend)
FROM node:22-alpine AS builder
WORKDIR /workspace

# Build args for Vite (Firebase client config, needed at build time)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_API_URL
ARG VITE_SOCKET_URL

# Install dependencies and build frontend
COPY react/package.json react/package-lock.json ./react/
COPY react/ ./react/
RUN cd react && npm ci --silent && npm run build

## Final image
FROM node:22-alpine
WORKDIR /app

# Copy backend sources
COPY backend/package.json backend/package-lock.json ./backend/
COPY backend/ ./backend/

# Copy built frontend into react/dist so server can serve static files from ../react/dist
COPY --from=builder /workspace/react/dist ./react/dist

# Install backend deps (production)
RUN cd backend && npm ci --only=production --silent

ENV NODE_ENV=production
# Use PORT provided by platform (Render sets PORT)
EXPOSE 4000

CMD ["node", "backend/index.js"]
