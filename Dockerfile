# =============================================================================
# Dockerfile — imagen de producción del backend Ceveco (Express + frontend estático)
#
# Multi-stage:
#   1) deps-backend   → instala dependencias del backend SIN devDeps.
#   2) build-frontend → instala deps del frontend y compila Tailwind a CSS.
#   3) runtime        → imagen final mínima Alpine con sólo lo necesario.
# =============================================================================

# ---------- 1) Backend deps -------------------------------------------------
FROM node:18-alpine AS deps-backend

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev


# ---------- 2) Frontend build (Tailwind) ------------------------------------
FROM node:18-alpine AS build-frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build:css


# ---------- 3) Runtime ------------------------------------------------------
FROM node:18-alpine

# curl para HEALTHCHECK; tini para señales correctas (kill, SIGTERM)
RUN apk add --no-cache curl tini

WORKDIR /app

# Backend con sus node_modules
COPY backend/ ./backend/
COPY --from=deps-backend /app/backend/node_modules ./backend/node_modules

# Frontend ya construido (incluye assets/css/tailwind.min.css)
COPY --from=build-frontend /app/frontend ./frontend

# Usuario sin privilegios + directorios de uploads
RUN addgroup -S ceveco && adduser -S ceveco -G ceveco && \
    mkdir -p /app/backend/public/images/productos && \
    mkdir -p /app/frontend/assets/img/banner-hero && \
    chown -R ceveco:ceveco /app

USER ceveco

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:3000/api/v1/productos?limit=1 > /dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "backend/index.js"]
