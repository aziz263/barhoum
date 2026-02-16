const { AnalyseLaboratoire, ResultatAnalyse, DossierMedical, Utilisateur } = require('../models');

// GET /api/analyses
exports.getAll = async (req, res) => {
  try {
    const { dossierId } = req.query;
    const where = {};
    if (dossierId) where.dossierId = dossierId;

    const analyses = await AnalyseLaboratoire.findAll({
      where,
      include: [
        { model: DossierMedical, as: 'dossier', include: [{ association: 'patient', attributes: ['idPatient', 'nom', 'prenom'] }] },
        { model: Utilisateur, as: 'technicien', attributes: ['idUtilisateur', 'nom', 'prenom'] },
        { model: ResultatAnalyse, as: 'resultat' },
      ],
      order: [['dateAnalyse', 'DESC']],
    });
    res.json(analyses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/analyses/:id
exports.getById = async (req, res) => {
  try {
    const analyse = await AnalyseLaboratoire.findByPk(req.params.id, {
      include: [
        { model: DossierMedical, as: 'dossier', include: [{ association: 'patient' }] },
        { model: Utilisateur, as: 'technicien', attributes: ['idUtilisateur', 'nom', 'prenom'] },
        { model: ResultatAnalyse, as: 'resultat' },
      ],
    });
    if (!analyse) return res.status(404).json({ message: 'Analyse non trouvée.' });
    res.json(analyse);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/analyses
exports.create = async (req, res) => {
  try {
    const { dossierId, typeAnalyse } = req.body;

    const dossier = await DossierMedical.findByPk(dossierId);
    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé.' });

    const analyse = await AnalyseLaboratoire.create({
      dossierId,
      typeAnalyse,
      dateAnalyse: new Date(),
      technicienId: req.user.idUtilisateur,
    });

    res.status(201).json(analyse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/analyses/:id/resultat
exports.addResultat = async (req, res) => {
  try {
    const analyse = await AnalyseLaboratoire.findByPk(req.params.id);
    if (!analyse) return res.status(404).json({ message: 'Analyse non trouvée.' });

    const existing = await ResultatAnalyse.findOne({ where: { analyseId: analyse.idAnalyse } });
    if (existing) {
      await existing.update(req.body);
      return res.json(existing);
    }

    const { valeur, unite, interpretation } = req.body;
    const resultat = await ResultatAnalyse.create({
      analyseId: analyse.idAnalyse,
      valeur, unite, interpretation,
    });

    res.status(201).json(resultat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/analyses/:id
exports.remove = async (req, res) => {
  try {
    const analyse = await AnalyseLaboratoire.findByPk(req.params.id);
    if (!analyse) return res.status(404).json({ message: 'Analyse non trouvée.' });

    await ResultatAnalyse.destroy({ where: { analyseId: analyse.idAnalyse } });
    await analyse.destroy();
    res.json({ message: 'Analyse supprimée.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
