# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine

# Set environment to production
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Start application
CMD ["npm", "run", "prod"]
