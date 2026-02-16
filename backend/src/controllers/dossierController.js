const { DossierMedical, Patient, Utilisateur, AnalyseLaboratoire, ResultatAnalyse, RapportPDF, SignesVitaux } = require('../models');

// GET /api/dossiers
exports.getAll = async (req, res) => {
  try {
    const { patientId } = req.query;
    const where = {};
    if (patientId) where.patientId = patientId;

    const dossiers = await DossierMedical.findAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['idPatient', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'medecinDossier', attributes: ['idUtilisateur', 'nom', 'prenom'] },
      ],
      order: [['dateCreation', 'DESC']],
    });
    res.json(dossiers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/dossiers/:id
exports.getById = async (req, res) => {
  try {
    const dossier = await DossierMedical.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Utilisateur, as: 'medecinDossier', attributes: ['idUtilisateur', 'nom', 'prenom', 'specialite'] },
        { model: AnalyseLaboratoire, as: 'analyses', include: [{ association: 'resultat' }, { association: 'technicien', attributes: ['idUtilisateur', 'nom', 'prenom'] }] },
        { model: RapportPDF, as: 'rapports' },
      ],
    });
    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé.' });
    res.json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/dossiers
exports.create = async (req, res) => {
  try {
    const { patientId, diagnostic, traitement } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé.' });

    const dossier = await DossierMedical.create({
      patientId,
      diagnostic,
      traitement,
      dateCreation: new Date(),
      medecinId: req.user.idUtilisateur,
    });

    res.status(201).json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/dossiers/:id
exports.update = async (req, res) => {
  try {
    const dossier = await DossierMedical.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé.' });

    const { diagnostic, traitement } = req.body;
    await dossier.update({ diagnostic, traitement });

    res.json(dossier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/dossiers/:id/csv
exports.exportCSV = async (req, res) => {
  try {
    const dossier = await DossierMedical.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Utilisateur, as: 'medecinDossier', attributes: ['idUtilisateur', 'nom', 'prenom', 'specialite'] },
        { model: AnalyseLaboratoire, as: 'analyses', include: [{ model: ResultatAnalyse, as: 'resultat' }, { model: Utilisateur, as: 'technicien', attributes: ['idUtilisateur', 'nom', 'prenom'] }] },
      ],
    });
    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé.' });

    // Get vital signs for this patient
    const signesVitaux = await SignesVitaux.findAll({
      where: { patientId: dossier.patientId },
      order: [['dateMesure', 'DESC']],
      limit: 20,
    });

    let csv = 'RAPPORT MEDICAL - EXPORT CSV\n\n';
    csv += 'INFORMATIONS DU PATIENT\n';
    csv += 'Champ,Valeur\n';
    csv += `Nom,${dossier.patient.nom}\n`;
    csv += `Prénom,${dossier.patient.prenom}\n`;
    csv += `Date de naissance,${dossier.patient.dateNaissance}\n`;
    csv += `Sexe,${dossier.patient.sexe === 'M' ? 'Masculin' : 'Féminin'}\n`;
    csv += `Téléphone,${dossier.patient.telephone || 'N/A'}\n`;
    csv += `Adresse,${dossier.patient.adresse || 'N/A'}\n\n`;

    csv += 'DOSSIER MEDICAL\n';
    csv += 'Champ,Valeur\n';
    csv += `Date de création,${dossier.dateCreation}\n`;
    csv += `Diagnostic,"${(dossier.diagnostic || 'Non spécifié').replace(/"/g, '""')}"\n`;
    csv += `Traitement,"${(dossier.traitement || 'Non spécifié').replace(/"/g, '""')}"\n`;
    csv += `Médecin,Dr. ${dossier.medecinDossier?.nom || ''} ${dossier.medecinDossier?.prenom || ''}\n\n`;

    if (signesVitaux.length > 0) {
      csv += 'SIGNES VITAUX\n';
      csv += 'Date,Température (°C),Pression Artérielle,Fréquence Cardiaque (bpm)\n';
      signesVitaux.forEach(s => {
        csv += `${new Date(s.dateMesure).toLocaleString('fr-FR')},${s.temperature},${s.pressionArterielle},${s.frequenceCardiaque}\n`;
      });
      csv += '\n';
    }

    if (dossier.analyses && dossier.analyses.length > 0) {
      csv += 'ANALYSES DE LABORATOIRE\n';
      csv += 'Date,Type,Technicien,Valeur,Unité,Interprétation\n';
      dossier.analyses.forEach(a => {
        csv += `${a.dateAnalyse},${a.typeAnalyse},${a.technicien ? a.technicien.nom + ' ' + a.technicien.prenom : 'N/A'},`;
        csv += `${a.resultat ? a.resultat.valeur : 'En attente'},${a.resultat ? a.resultat.unite : ''},"${(a.resultat?.interpretation || '').replace(/"/g, '""')}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=dossier_${dossier.idDossier}_${dossier.patient.nom}_${dossier.patient.prenom}.csv`);
    res.send('\uFEFF' + csv); // BOM for Excel compatibility
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/dossiers/:id
exports.remove = async (req, res) => {
  try {
    const dossier = await DossierMedical.findByPk(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé.' });

    await dossier.destroy();
    res.json({ message: 'Dossier supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
