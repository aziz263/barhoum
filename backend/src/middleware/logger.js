const { JournalActivite } = require('../models');

/**
 * Middleware de journalisation des activités
 * Enregistre automatiquement les actions CRUD dans le journal
 */
const logActivity = (action, ressource) => {
  return async (req, res, next) => {
    // Sauvegarder la méthode originale res.json
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Enregistrer le log après une réponse réussie
      if (res.statusCode < 400) {
        const logData = {
          action,
          ressource,
          ressourceId: req.params.id || data?.idPatient || data?.idDossier || data?.idDocument || null,
          details: `${action} ${ressource} - ${req.method} ${req.originalUrl}`,
          adresseIP: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent']?.substring(0, 500),
          utilisateurId: req.user?.idUtilisateur || null,
        };

        // Log async - ne pas bloquer la réponse
        JournalActivite.create(logData).catch((err) => {
          console.error('Erreur journalisation:', err.message);
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Logger une action manuellement (pour login, logout, etc.)
 */
const logManual = async (action, ressource, details, req, ressourceId = null) => {
  try {
    await JournalActivite.create({
      action,
      ressource,
      ressourceId,
      details,
      adresseIP: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']?.substring(0, 500),
      utilisateurId: req.user?.idUtilisateur || null,
    });
  } catch (err) {
    console.error('Erreur journalisation manuelle:', err.message);
  }
};

module.exports = { logActivity, logManual };
