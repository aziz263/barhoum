const express = require('express');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const config = require('./config/config');
const sequelize = require('./config/database');
const { helmetConfig, globalLimiter, authLimiter, corsConfig, requestSizeLimit } = require('./middleware/security');
const { logManual } = require('./middleware/logger');

// Import models to register associations
require('./models');

const app = express();

// ── Sécurité ──
app.use(helmetConfig);              // En-têtes HTTP sécurisés
app.use(corsConfig);                // CORS restrictif
app.use(globalLimiter);             // Rate limiting global
app.use(requestSizeLimit);          // Limite taille requête

// ── Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Journalisation HTTP (Morgan + fichier log) ──
const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Console en dev

// ── Fichiers statiques sécurisés ──
// Les uploads ne sont PLUS servis en statique - on utilise le endpoint /api/documents/:id/download
// Seuls les rapports PDF générés sont servis via leur route authentifiée /api/rapports/:id/download

// ── Routes ──
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/utilisateurs', require('./routes/utilisateurs'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/dossiers', require('./routes/dossiers'));
app.use('/api/signes-vitaux', require('./routes/signesVitaux'));
app.use('/api/analyses', require('./routes/analyses'));
app.use('/api/rapports', require('./routes/rapports'));
app.use('/api/statistiques', require('./routes/statistiques'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/logs', require('./routes/logs'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    securite: {
      helmet: true,
      cors: true,
      rateLimiting: true,
      chiffrementDocuments: true,
      journalisation: true,
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  // Log l'erreur dans le fichier
  const errorLog = `[${new Date().toISOString()}] ${err.stack}\n`;
  fs.appendFileSync(path.join(logsDir, 'error.log'), errorLog);
  console.error(err.stack);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Fichier trop volumineux (max 10 MB).' });
  }
  if (err.message && err.message.includes('Type de fichier')) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Connexion à la base de données établie.');

    await sequelize.sync({ alter: true });
    console.log('✓ Tables synchronisées.');

    app.listen(config.port, () => {
      console.log(`✓ Serveur démarré sur le port ${config.port}`);
      console.log(`  http://localhost:${config.port}/api/health`);
      console.log('✓ Sécurité activée: Helmet, CORS, Rate Limiting, Chiffrement');
      console.log('✓ Journalisation activée: Morgan + Journal d\'activités');
    });
  } catch (error) {
    console.error('✗ Erreur de démarrage:', error.message);
    process.exit(1);
  }
};

startServer();
