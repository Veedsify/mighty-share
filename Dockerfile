FROM oven/bun:1-alpine

# Install Prisma system dependencies
RUN apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build Next.js application
RUN bun run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start with Bun
CMD ["bun", "start"]