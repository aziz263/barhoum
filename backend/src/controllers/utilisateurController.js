const { Utilisateur } = require('../models');

// GET /api/utilisateurs
exports.getAll = async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await Utilisateur.findAll({ where, order: [['nom', 'ASC']] });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/utilisateurs/:id
exports.getById = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/utilisateurs
exports.create = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, role, specialite, service, laboratoire } = req.body;

    const existing = await Utilisateur.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const user = await Utilisateur.create({
      nom, prenom, email, motDePasse, role,
      specialite: role === 'medecin' ? specialite : null,
      service: role === 'infirmier' ? service : null,
      laboratoire: role === 'technicien' ? laboratoire : null,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/utilisateurs/:id
exports.update = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const { nom, prenom, email, role, specialite, service, laboratoire } = req.body;

    await user.update({
      nom: nom || user.nom,
      prenom: prenom || user.prenom,
      email: email || user.email,
      role: role || user.role,
      specialite, service, laboratoire,
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/utilisateurs/:id
exports.remove = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    await user.destroy();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
