# Use Node.js 22 Alpine for smaller image size
FROM node:22-alpine

# Install Prisma system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm isntall

# Copy application code
COPY . .

# Generate Prisma Client (essential for runtime)
RUN npx prisma generate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app
USER nextjs

# Expose default Next.js port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]