FROM node:18-alpine AS builder

WORKDIR /app
COPY src ./src/
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
RUN npx tsc

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist/ ./dist
RUN mkdir ./data && wget -P ./data https://db.iptv.blog/multicastadressliste.json
COPY package*.json ./
COPY views/ ./views/
COPY public/ ./public/
RUN npm install --omit=dev
USER node

ENTRYPOINT [ "node", "dist/app.js" ]

