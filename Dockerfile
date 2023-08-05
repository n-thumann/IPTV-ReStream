FROM node:20-bullseye-slim AS builder

WORKDIR /app
COPY src ./src/
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
RUN npm run build

FROM node:20-bullseye-slim
USER node
WORKDIR /app

COPY --chown=node:node --from=builder /app/dist/ /app/
ADD --chown=node:node https://db.iptv.blog/multicastadressliste.json ./data/
COPY --chown=node:node package*.json ./
COPY --chown=node:node views/ ./views/
COPY --chown=node:node public/ ./public/
RUN npm ci --omit=dev && npm cache clean --force

CMD [ "node", "app.js" ]
