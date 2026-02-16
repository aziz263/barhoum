const { SignesVitaux, Patient, Utilisateur } = require('../models');

// GET /api/signes-vitaux
exports.getAll = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = {};
    if (patientId) where.patientId = patientId;

    const signes = await SignesVitaux.findAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['idPatient', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'infirmierMesure', attributes: ['idUtilisateur', 'nom', 'prenom'] },
      ],
      order: [['dateMesure', 'DESC']],
    });
    res.json(signes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/signes-vitaux/:id
exports.getById = async (req, res) => {
  try {
    const signe = await SignesVitaux.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Utilisateur, as: 'infirmierMesure', attributes: ['idUtilisateur', 'nom', 'prenom'] },
      ],
    });
    if (!signe) return res.status(404).json({ message: 'Mesure non trouvée.' });
    res.json(signe);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/signes-vitaux
exports.create = async (req, res) => {
  try {
    const { patientId, temperature, pressionArterielle, frequenceCardiaque } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé.' });

    const signe = await SignesVitaux.create({
      patientId,
      temperature,
      pressionArterielle,
      frequenceCardiaque,
      dateMesure: new Date(),
      infirmierId: req.user.idUtilisateur,
    });

    res.status(201).json(signe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/signes-vitaux/:id
exports.remove = async (req, res) => {
  try {
    const signe = await SignesVitaux.findByPk(req.params.id);
    if (!signe) return res.status(404).json({ message: 'Mesure non trouvée.' });

    await signe.destroy();
    res.json({ message: 'Mesure supprimée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
