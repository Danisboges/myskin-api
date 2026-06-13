# Base image containing the Ollama engine
FROM ollama/ollama:latest

# Install Node.js 20 and npm packages needed for the Express app
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set the container workspace for your Node.js app
WORKDIR /app

# Install dependencies before copying the source code (improves build caching)
COPY package*.json ./
RUN npm install

# Copy all local project source files to the container workspace
COPY . .

# Generate the Prisma client so it can access your Supabase database
RUN npx prisma generate

# Convert the entry point script to an executable
RUN chmod +x /app/entrypoint.sh

# Expose your application port (Railway sets this via the PORT variable automatically)
EXPOSE 3000

# Fire up both systems using the entry point script
CMD ["/app/entrypoint.sh"]