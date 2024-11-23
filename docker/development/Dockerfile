FROM node:lts-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install global development dependencies
RUN npm install -g ts-node ts-node-dev

# Copy package files for workspace
COPY package.json package-lock.json ./
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/
COPY services/*/package.json ./services/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set service name from build arg
ARG SERVICE
ENV SERVICE_NAME=$SERVICE

# Start service using npm script
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"test\" ]; then cd packages/core && npm run test; else npm run dev:$SERVICE_NAME; fi"]
