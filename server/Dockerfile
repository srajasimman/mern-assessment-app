ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /usr/src/app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.16.0 --activate

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile --prod

# Copy application code
COPY . .

# -----------------------------------------------
# Production stage
FROM node:${NODE_VERSION}-alpine

# Set NODE_ENV to production
ENV NODE_ENV=production

# Install pnpm in production stage
RUN corepack enable && corepack prepare pnpm@10.16.0 --activate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodeuser

# Create app directory
WORKDIR /usr/src/app

# Copy built artifacts from builder stage
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/package.json ./
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/pnpm-lock.yaml* ./
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/server.js ./
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/models ./models
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/routes ./routes
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/controllers ./controllers
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/middleware ./middleware
COPY --from=builder --chown=nodeuser:nodejs /usr/src/app/config ./config

# Switch to non-root user
USER nodeuser

# Expose port the application will run on
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]