# Multi-stage Dockerfile for building and running the TypeScript Node app

# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm prune --production

# --- Production stage ---
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY package.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
