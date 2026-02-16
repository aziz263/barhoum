# Backend - Plateforme sécurisée de gestion de documents médicaux
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm install --only=production

# Copier le code source
COPY src/ ./src/

# Créer les répertoires nécessaires
RUN mkdir -p uploads/encrypted uploads/tmp logs

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Commande de démarrage
CMD ["node", "src/server.js"]
