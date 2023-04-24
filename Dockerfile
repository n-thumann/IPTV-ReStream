FROM node:20-alpine AS builder

WORKDIR /app
COPY src ./src/
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install --only=dev
RUN npx tsc

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/ ./dist
RUN mkdir ./data && wget -P ./data https://db.iptv.blog/multicastadressliste.json
COPY package*.json ./
COPY views/ ./views/
COPY public/ ./public/
RUN npm install --only=production
USER node

ENTRYPOINT [ "node", "dist/app.js" ]

