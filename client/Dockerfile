# Use a lightweight Node.js image
FROM node:21-alpine

# Accept build-time enviroment variables
ARG VITE_API_SERVER_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_CALLBACK_URL
ARG VITE_AUTH0_AUDIENCE
ARG CLIENT_SSL_CERT
ARG CLIENT_SSL_KEY

# Set the enviroment variables
ENV VITE_API_SERVER_URL=${VITE_API_SERVER_URL}
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_CALLBACK_URL=${VITE_AUTH0_CALLBACK_URL}
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}

# Install serve to deploy production version of the app
RUN npm install -g serve

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

# Create SSL key and cert files
RUN echo "$CLIENT_SSL_CERT" | base64 -d > ssl_cert.pem
RUN echo "$CLIENT_SSL_KEY" | base64 -d > ssl_key.pem

# Expose the port the client will run on
EXPOSE 4040

# Command to start the client in production mode
CMD ["serve", "-s", "dist", "-p", "4040", "--ssl-cert", "ssl_cert.pem", "--ssl-key", "ssl_key.pem"]
