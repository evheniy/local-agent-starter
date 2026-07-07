FROM node:krypton-alpine AS build

WORKDIR /repo

ENV NODE_ENV=production
ENV HUSKY=0

COPY . .

RUN corepack enable
RUN yarn install --immutable
RUN yarn build:indexer

FROM node:krypton-alpine

WORKDIR /app

ENV LOG_LEVEL=info
ENV NODE_ENV=production
ENV INDEXER_POLL_MS=5000

COPY --from=build --chown=node:node /repo/dist/indexer ./

RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

USER node

CMD ["node", "index.js"]
