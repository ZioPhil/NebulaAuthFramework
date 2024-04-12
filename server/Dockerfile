# Use a lightweight Node.js image
FROM node:21-alpine

# Set working directory
WORKDIR /app/server

# Copy package.json and package-lock.json
COPY ./server/package* .

# Install dependencies
RUN npm install

# Install node-fetch to polyfill fetch function
RUN npm install node-fetch

# Copy the rest of the server application
COPY ./server .

# Expose the port the server will run on
EXPOSE 8000

# Command to start the server
CMD ["npm", "start"]
