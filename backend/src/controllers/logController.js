const { JournalActivite, Utilisateur } = require('../models');
const { Op } = require('sequelize');

// GET /api/logs - Liste des journaux d'activité
exports.getAll = async (req, res) => {
  try {
    const { action, ressource, utilisateurId, dateDebut, dateFin, page = 1, limit = 50 } = req.query;

    const where = {};
    if (action) where.action = action;
    if (ressource) where.ressource = ressource;
    if (utilisateurId) where.utilisateurId = utilisateurId;

    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt[Op.gte] = new Date(dateDebut);
      if (dateFin) where.createdAt[Op.lte] = new Date(dateFin);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: logs, count: total } = await JournalActivite.findAndCountAll({
      where,
      include: [
        { model: Utilisateur, as: 'utilisateur', attributes: ['idUtilisateur', 'nom', 'prenom', 'email', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/logs/stats - Statistiques des logs
exports.getStats = async (req, res) => {
  try {
    const { fn, col } = require('sequelize');
    const sequelize = require('../config/database');

    const actionStats = await JournalActivite.findAll({
      attributes: ['action', [fn('COUNT', col('idLog')), 'count']],
      group: ['action'],
      raw: true,
    });

    const ressourceStats = await JournalActivite.findAll({
      attributes: ['ressource', [fn('COUNT', col('idLog')), 'count']],
      group: ['ressource'],
      raw: true,
    });

    const totalLogs = await JournalActivite.count();

    // Activité des dernières 24h  
    const last24h = await JournalActivite.count({
      where: {
        createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    res.json({
      total: totalLogs,
      dernières24h: last24h,
      parAction: actionStats,
      parRessource: ressourceStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
