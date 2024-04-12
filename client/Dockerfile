# Use a lightweight Node.js image
FROM node:21-alpine

# Set working directory
WORKDIR /app/client

# Copy the client application
COPY . .

# Install dependencies
RUN npm install

# Build the client app
RUN npm run build

# Expose the port the client will run on
EXPOSE 4040

# Command to start the client in development mode
CMD ["npm", "run", "dev"]
