
# Multi-stage Dockerfile for building and running the TypeScript Node app

# --- Build stage ---
FROM node:20-alpine AS builder

# Build args to help in restricted networks (proxy, custom registry)
ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NPM_REGISTRY=https://registry.npmjs.org/

WORKDIR /usr/src/app

# Make proxy env available during the build
ENV HTTP_PROXY=${HTTP_PROXY}
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV NODE_ENV=development

# Install build tools required by some native modules / TypeScript
RUN apk add --no-cache python3 make g++

# Copy package manifests first to leverage Docker cache
COPY package.json package-lock.json* ./

# Use custom registry if provided and install dependencies (including dev deps)
RUN npm set registry $NPM_REGISTRY
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Remove dev dependencies to keep only production modules for the final image
RUN npm prune --production


# --- Production stage ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Copy production node_modules and compiled output from builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json ./

# Create a non-root user and give ownership of the app directory
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
