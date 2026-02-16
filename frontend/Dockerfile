# Frontend - Plateforme sécurisée de gestion de documents médicaux
FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY public/ ./public/
COPY src/ ./src/

# Build de production - L'API passe par le proxy Nginx /api
ENV REACT_APP_API_URL=/api
RUN npm run build

# ── Serveur Nginx sécurisé ──
FROM nginx:alpine

# Copier le build React
COPY --from=build /app/build /usr/share/nginx/html

# Configuration Nginx pour SPA + proxy API
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
