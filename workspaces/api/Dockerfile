FROM node:krypton-alpine AS build

WORKDIR /repo

ENV NODE_ENV=production
ENV CHAT=http://localhost:3002
ENV UI=/static
ENV HUSKY=0

COPY . .

RUN corepack enable
RUN yarn install --immutable
RUN yarn build:ui
RUN yarn build:api

FROM node:krypton-alpine

WORKDIR /app

ENV PORT=3000
ENV LOG_LEVEL=info
ENV NODE_ENV=production
ENV DOCS_DIR=/app/docs
ENV POSTGRES_HOST=postgres
ENV POSTGRES_PORT=5432

COPY --from=build --chown=node:node /repo/package.json ./
COPY --from=build --chown=node:node /repo/dist/api ./

RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/healthcheck" || exit 1

CMD ["node", "index.js"]
