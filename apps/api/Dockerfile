# ============================================================
# Vigie API — image de production (multi-stage, non-root)
# Build :  docker build -f apps/api/Dockerfile -t vigie-api .
# Run   :  docker run --env-file .env -p 3000:3000 vigie-api
# ============================================================

# --- Étape 1 : build (bundle esbuild, @vigie/shared inclus) ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci

COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build --workspace @vigie/api

# --- Étape 2 : dépendances de production uniquement ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci --omit=dev --ignore-scripts

# --- Étape 3 : image finale minimale ---
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/apps/api

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY apps/api/migrations ./migrations

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/v1/health || exit 1

CMD ["node", "dist/index.js"]
