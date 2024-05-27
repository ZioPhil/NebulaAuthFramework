# Use a lightweight Node.js image
FROM node:21-alpine

# Set working directory
WORKDIR /app/client

# Copy package.json and package-lock.json
COPY ./client/package* .

# Install dependencies
RUN npm install

# Copy the rest of the client application
COPY ./client .

# Build the client app
RUN npm run build

# Expose the port the client will run on
EXPOSE 4040

# Command to start the client in development mode
CMD rm -rf node_modules/.vite && npm run dev
