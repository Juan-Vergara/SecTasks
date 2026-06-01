FROM node:20-alpine

WORKDIR /app/backend

# Dependencias primero para aprovechar caché
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Código de backend y frontend estático
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# Asegurar permisos para logs
RUN mkdir -p /app/backend/logs && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "server.js"]