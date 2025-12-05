FROM node:20-alpine

WORKDIR /app

# Install dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY server.js ./
COPY public/ ./public/

# Create data directory for SQLite
RUN mkdir -p data

# Expose the default port
EXPOSE 3001

# NOTE: We intentionally keep the container running as root because docker-compose
# binds ./data from the host into /app/data. On first run this host directory is
# created with root ownership, preventing a non-root user from writing the
# SQLite database. Running as root avoids permission errors while keeping the
# image minimal. If you prefer a non-root user, ensure the host data directory
# is writable by that user before startup (e.g., chown to uid 1001).

# Start the server
CMD ["node", "server.js"]
