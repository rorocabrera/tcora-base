FROM node:lts-alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
CMD ["npm", "start"]
