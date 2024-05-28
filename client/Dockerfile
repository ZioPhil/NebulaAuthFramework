# Use a lightweight Node.js image
FROM node:21-alpine

# Accept build-time enviroment variables
ARG VITE_API_SERVER_URL
ARG VITE_AUTH0_DOMAIN
ARG VITE_AUTH0_CLIENT_ID
ARG VITE_AUTH0_CALLBACK_URL
ARG VITE_AUTH0_AUDIENCE

# Set the enviroment variables
ENV VITE_API_SERVER_URL=${VITE_API_SERVER_URL}
ENV VITE_AUTH0_DOMAIN=${VITE_AUTH0_DOMAIN}
ENV VITE_AUTH0_CLIENT_ID=${VITE_AUTH0_CLIENT_ID}
ENV VITE_AUTH0_CALLBACK_URL=${VITE_AUTH0_CALLBACK_URL}
ENV VITE_AUTH0_AUDIENCE=${VITE_AUTH0_AUDIENCE}

# Install http-server to deploy production version of the app
RUN npm install -g http-server

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
CMD ["http-server", "dist", "-p 4040"]
