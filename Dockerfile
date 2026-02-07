# Multi-stage Dockerfile for Healthsync (build React frontend, run Node backend)
FROM node:18-alpine AS builder
WORKDIR /workspace

# Install dependencies and build frontend
COPY react/package.json react/package-lock.json ./react/
COPY react/ ./react/
RUN cd react && npm ci --silent && npm run build

## Final image
FROM node:18-alpine
WORKDIR /app

# Copy backend sources
COPY backend/package.json backend/package-lock.json ./backend/
COPY backend/ ./backend/

# Copy built frontend into backend/react/dist so server can serve static files
COPY --from=builder /workspace/react/dist ./backend/react/dist

# Install backend deps (production)
RUN cd backend && npm ci --only=production --silent

ENV NODE_ENV=production
# Use PORT provided by platform (Render sets PORT)
EXPOSE 4000

CMD ["node", "backend/index.js"]
