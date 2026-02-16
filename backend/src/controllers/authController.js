const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { Utilisateur } = require('../models');
const { logManual } = require('../middleware/logger');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await Utilisateur.findOne({ where: { email } });
    if (!user) {
      await logManual('LOGIN', 'Authentification', `Tentative login échouée: ${email}`, req);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) {
      await logManual('LOGIN', 'Authentification', `Mot de passe incorrect: ${email}`, req);
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.idUtilisateur, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Logger la connexion réussie
    req.user = user;
    await logManual('LOGIN', 'Authentification', `Connexion réussie: ${user.email} (${user.role})`, req, user.idUtilisateur);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    const isMatch = await req.user.comparePassword(ancienMotDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: 'Ancien mot de passe incorrect.' });
    }

    req.user.motDePasse = nouveauMotDePasse;
    await req.user.save();

    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
