FROM oven/bun:1.1.42-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Copy application code
COPY . .

# -----------------------------------------------
# Production stage
FROM oven/bun:1.1.42-alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S bunjs && \
    adduser -S -u 1001 -G bunjs bunuser

# Create app directory
WORKDIR /usr/src/app

# Copy built artifacts from builder stage
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/package.json ./
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/bun.lockb* ./
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/server.js ./
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/models ./models
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/routes ./routes
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/controllers ./controllers
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/middleware ./middleware
COPY --from=builder --chown=bunuser:bunjs /usr/src/app/config ./config

# Switch to non-root user
USER bunuser

# Expose port the application will run on
EXPOSE 5000

# Command to run the application
CMD ["bun", "run", "server.js"]