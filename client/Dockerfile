# Use a lightweight Node.js image
FROM node:21-alpine

# Set working directory
WORKDIR /app/client

# Copy the application
COPY ./client .

# Install dependencies
RUN npm install

# Expose the port the client will run on
EXPOSE 4040

# Command to start the client in development mode
CMD rm -rf node_modules/.vite && npm run dev
