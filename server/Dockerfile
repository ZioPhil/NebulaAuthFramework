# Use a lightweight Node.js image
FROM node:21-alpine

# Accept build-time enviroment variables
ARG SERVER_SSL_CERT
ARG SERVER_SSL_KEY

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

# Create SSL key and cert files
RUN echo "$SERVER_SSL_CERT" | base64 -d > cert.pem
RUN echo "$SERVER_SSL_KEY" | base64 -d > key.pem

# Expose the port the server will run on
EXPOSE 8000

# Command to start the server
CMD ["npm", "start"]
