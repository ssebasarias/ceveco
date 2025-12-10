# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias del backend
COPY backend/package*.json ./backend/

# Instalar dependencias puras (sin devDependencies si fuera posible, pero necesitamos nodemon/etc en dev?)
# En producción usamos --production
WORKDIR /app/backend
RUN npm ci --only=production

# Copiar el resto del código
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Runtime Stage (Imagen final ligera)
FROM node:18-alpine

WORKDIR /app

# Copiar desde el builder (node_modules y código fuente limpio)
COPY --from=builder /app /app

# Variables de entorno por defecto (pueden sobreescribirse en docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Usuario no root por seguridad
RUN addgroup -S ceveco && adduser -S ceveco -G ceveco
USER ceveco

# Exponer puerto
EXPOSE 3000

# Comando de inicio (ajustando la ruta ya que WORKDIR es /app)
CMD ["node", "backend/index.js"]
