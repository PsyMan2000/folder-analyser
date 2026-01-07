FROM node:18-alpine

WORKDIR /app

# Install dependencies for both frontend and backend
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the React app
RUN npm run build

# Expose port
EXPOSE 3000

# Mount point for volume to analyze
VOLUME ["/data"]

# Start the server
CMD ["node", "server.js"]
