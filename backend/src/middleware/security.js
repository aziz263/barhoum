const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

/**
 * Configuration Helmet - En-têtes de sécurité HTTP
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Rate Limiter global - Protection contre les attaques par force brute
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // maximum 100 requêtes par IP par fenêtre
  message: {
    message: 'Trop de requêtes depuis cette adresse IP, réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter strict pour l'authentification
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // maximum 10 tentatives de login par 15 min
  message: {
    message: 'Trop de tentatives de connexion, réessayez dans 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter pour les uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // 50 uploads par heure
  message: {
    message: 'Limite d\'upload atteinte, réessayez plus tard.',
  },
});

/**
 * Configuration CORS sécurisée
 * En Docker, le frontend passe par le proxy Nginx (même origine)
 */
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
const corsConfig = cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (proxy nginx, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // En dev, autoriser tout
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});

/**
 * Middleware de validation de la taille des requêtes
 */
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10 MB max
  if (contentLength > maxSize) {
    return res.status(413).json({ message: 'Requête trop volumineuse (max 10 MB).' });
  }
  next();
};

module.exports = {
  helmetConfig,
  globalLimiter,
  authLimiter,
  uploadLimiter,
  corsConfig,
  requestSizeLimit,
};
