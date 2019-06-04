FROM node:10.15.3

# Create app directory
RUN mkdir -p /usr/src/backend-api
WORKDIR /usr/src/backend-api

# Install app dependencies
COPY package.json /usr/src/backend-api
RUN npm install

# Bundle app source
COPY . /usr/src/backend-api

# Build arguments
ARG NODE_VERSION=10.15.3

# Environment
ENV NODE_VERSION $NODE_VERSION