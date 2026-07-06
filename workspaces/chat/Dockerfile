FROM node:krypton-alpine

WORKDIR /app

ENV PORT=3000
ENV LOG_LEVEL=info
ENV NODE_ENV=production

COPY --chown=node:node . .

RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/healthcheck" || exit 1

CMD ["node", "index.js"]
