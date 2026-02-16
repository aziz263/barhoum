const { Patient, Utilisateur, DossierMedical, SignesVitaux } = require('../models');

// GET /api/patients
exports.getAll = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        { model: Utilisateur, as: 'medecin', attributes: ['idUtilisateur', 'nom', 'prenom', 'specialite'] },
        { model: Utilisateur, as: 'infirmier', attributes: ['idUtilisateur', 'nom', 'prenom', 'service'] },
      ],
      order: [['nom', 'ASC']],
    });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/patients/:id
exports.getById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: 'medecin', attributes: ['idUtilisateur', 'nom', 'prenom', 'specialite'] },
        { model: Utilisateur, as: 'infirmier', attributes: ['idUtilisateur', 'nom', 'prenom', 'service'] },
        { model: DossierMedical, as: 'dossiers' },
        { model: SignesVitaux, as: 'signesVitaux', order: [['dateMesure', 'DESC']], limit: 10 },
      ],
    });
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé.' });
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/patients
exports.create = async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, sexe, telephone, adresse } = req.body;

    const patient = await Patient.create({
      nom, prenom, dateNaissance, sexe, telephone, adresse,
      medecinId: req.user.role === 'medecin' ? req.user.idUtilisateur : req.body.medecinId,
      infirmierId: req.user.role === 'infirmier' ? req.user.idUtilisateur : req.body.infirmierId,
    });

    res.status(201).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/patients/:id
exports.update = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé.' });

    await patient.update(req.body);
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/patients/:id
exports.remove = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé.' });

    await patient.destroy();
    res.json({ message: 'Patient supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
