const { Patient, DossierMedical, Utilisateur, SignesVitaux, AnalyseLaboratoire, Statistique } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// GET /api/statistiques
exports.getDashboard = async (req, res) => {
  try {
    const totalPatients = await Patient.count();
    const totalMedecins = await Utilisateur.count({ where: { role: 'medecin' } });
    const totalInfirmiers = await Utilisateur.count({ where: { role: 'infirmier' } });
    const totalTechniciens = await Utilisateur.count({ where: { role: 'technicien' } });
    const totalDossiers = await DossierMedical.count();
    const totalAnalyses = await AnalyseLaboratoire.count();
    const totalSignesVitaux = await SignesVitaux.count();

    // Patients by sex
    const patientsBySex = await Patient.findAll({
      attributes: ['sexe', [sequelize.fn('COUNT', sequelize.col('idPatient')), 'count']],
      group: ['sexe'],
    });

    // Recent patients (last 30 days)
    const recentPatients = await Patient.count({
      where: {
        createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    // Recent analyses (last 30 days)
    const recentAnalyses = await AnalyseLaboratoire.count({
      where: {
        dateAnalyse: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    // Detect at-risk patients based on vital signs
    const patientsAtRisk = await detectPatientsAtRisk();

    res.json({
      totalPatients,
      totalMedecins,
      totalInfirmiers,
      totalTechniciens,
      totalDossiers,
      totalAnalyses,
      totalSignesVitaux,
      patientsBySex,
      recentPatients,
      recentAnalyses,
      patientsAtRisk,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Detect patients with abnormal vital signs
async function detectPatientsAtRisk() {
  try {
    const patients = await Patient.findAll({
      include: [
        {
          model: SignesVitaux,
          as: 'signesVitaux',
          order: [['dateMesure', 'DESC']],
          limit: 1,
        },
        { model: Utilisateur, as: 'medecin', attributes: ['idUtilisateur', 'nom', 'prenom'] },
      ],
    });

    const atRisk = [];

    for (const patient of patients) {
      if (!patient.signesVitaux || patient.signesVitaux.length === 0) continue;

      const latest = patient.signesVitaux[0];
      const risks = [];

      // Check temperature (normal: 36.1 - 37.8)
      if (latest.temperature < 35.0) risks.push({ type: 'Hypothermie', valeur: `${latest.temperature}°C`, severity: 'high' });
      else if (latest.temperature > 39.0) risks.push({ type: 'Fièvre élevée', valeur: `${latest.temperature}°C`, severity: 'high' });
      else if (latest.temperature > 38.0) risks.push({ type: 'Fièvre', valeur: `${latest.temperature}°C`, severity: 'medium' });
      else if (latest.temperature > 37.8) risks.push({ type: 'Fébricule', valeur: `${latest.temperature}°C`, severity: 'low' });

      // Check heart rate (normal: 60-100 bpm)
      if (latest.frequenceCardiaque > 120) risks.push({ type: 'Tachycardie sévère', valeur: `${latest.frequenceCardiaque} bpm`, severity: 'high' });
      else if (latest.frequenceCardiaque > 100) risks.push({ type: 'Tachycardie', valeur: `${latest.frequenceCardiaque} bpm`, severity: 'medium' });
      else if (latest.frequenceCardiaque < 50) risks.push({ type: 'Bradycardie sévère', valeur: `${latest.frequenceCardiaque} bpm`, severity: 'high' });
      else if (latest.frequenceCardiaque < 60) risks.push({ type: 'Bradycardie', valeur: `${latest.frequenceCardiaque} bpm`, severity: 'low' });

      // Check blood pressure (parse "120/80" format)
      if (latest.pressionArterielle) {
        const parts = latest.pressionArterielle.split('/');
        if (parts.length === 2) {
          const systolique = parseInt(parts[0]);
          const diastolique = parseInt(parts[1]);
          if (systolique >= 180 || diastolique >= 120) risks.push({ type: 'Crise hypertensive', valeur: `${latest.pressionArterielle} mmHg`, severity: 'high' });
          else if (systolique >= 140 || diastolique >= 90) risks.push({ type: 'Hypertension', valeur: `${latest.pressionArterielle} mmHg`, severity: 'medium' });
          else if (systolique < 90 || diastolique < 60) risks.push({ type: 'Hypotension', valeur: `${latest.pressionArterielle} mmHg`, severity: 'medium' });
        }
      }

      if (risks.length > 0) {
        const maxSeverity = risks.some(r => r.severity === 'high') ? 'high' : risks.some(r => r.severity === 'medium') ? 'medium' : 'low';
        atRisk.push({
          idPatient: patient.idPatient,
          nom: patient.nom,
          prenom: patient.prenom,
          medecin: patient.medecin ? `Dr. ${patient.medecin.nom} ${patient.medecin.prenom}` : 'Non assigné',
          dateMesure: latest.dateMesure,
          risks,
          severity: maxSeverity,
        });
      }
    }

    // Sort by severity: high first
    const severityOrder = { high: 0, medium: 1, low: 2 };
    atRisk.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return atRisk;
  } catch (error) {
    console.error('Error detecting at-risk patients:', error);
    return [];
  }
}
