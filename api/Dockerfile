# Contexto de build = raiz do repositório: docker build -f api/Dockerfile .
FROM node:22-slim AS build
WORKDIR /repo
COPY api/package.json api/package-lock.json api/
RUN cd api && npm ci
COPY api api
RUN cd api && npm run build && npm prune --omit=dev

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /srv
COPY --from=build /repo/api/node_modules node_modules
COPY --from=build /repo/api/package.json package.json
COPY --from=build /repo/api/dist dist
USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
