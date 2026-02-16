const Utilisateur = require('./Utilisateur');
const Patient = require('./Patient');
const DossierMedical = require('./DossierMedical');
const SignesVitaux = require('./SignesVitaux');
const AnalyseLaboratoire = require('./AnalyseLaboratoire');
const ResultatAnalyse = require('./ResultatAnalyse');
const RapportPDF = require('./RapportPDF');
const Statistique = require('./Statistique');
const JournalActivite = require('./JournalActivite');
const DocumentSensible = require('./DocumentSensible');

// ── Associations ──

// Medecin -> Patient (crée)
Utilisateur.hasMany(Patient, { foreignKey: 'medecinId', as: 'patientsMedecin' });
Patient.belongsTo(Utilisateur, { foreignKey: 'medecinId', as: 'medecin' });

// Infirmier -> Patient (enregistre)
Utilisateur.hasMany(Patient, { foreignKey: 'infirmierId', as: 'patientsInfirmier' });
Patient.belongsTo(Utilisateur, { foreignKey: 'infirmierId', as: 'infirmier' });

// Patient -> DossierMedical
Patient.hasMany(DossierMedical, { foreignKey: 'patientId', as: 'dossiers' });
DossierMedical.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// Medecin -> DossierMedical (crée/modifie)
Utilisateur.hasMany(DossierMedical, { foreignKey: 'medecinId', as: 'dossiersCrees' });
DossierMedical.belongsTo(Utilisateur, { foreignKey: 'medecinId', as: 'medecinDossier' });

// Patient -> SignesVitaux (mesure)
Patient.hasMany(SignesVitaux, { foreignKey: 'patientId', as: 'signesVitaux' });
SignesVitaux.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

// Infirmier -> SignesVitaux (mesure)
Utilisateur.hasMany(SignesVitaux, { foreignKey: 'infirmierId', as: 'mesures' });
SignesVitaux.belongsTo(Utilisateur, { foreignKey: 'infirmierId', as: 'infirmierMesure' });

// DossierMedical -> AnalyseLaboratoire
DossierMedical.hasMany(AnalyseLaboratoire, { foreignKey: 'dossierId', as: 'analyses' });
AnalyseLaboratoire.belongsTo(DossierMedical, { foreignKey: 'dossierId', as: 'dossier' });

// Technicien -> AnalyseLaboratoire (saisit)
Utilisateur.hasMany(AnalyseLaboratoire, { foreignKey: 'technicienId', as: 'analysesSaisies' });
AnalyseLaboratoire.belongsTo(Utilisateur, { foreignKey: 'technicienId', as: 'technicien' });

// AnalyseLaboratoire -> ResultatAnalyse (1:1)
AnalyseLaboratoire.hasOne(ResultatAnalyse, { foreignKey: 'analyseId', as: 'resultat' });
ResultatAnalyse.belongsTo(AnalyseLaboratoire, { foreignKey: 'analyseId', as: 'analyse' });

// DossierMedical -> RapportPDF
DossierMedical.hasMany(RapportPDF, { foreignKey: 'dossierId', as: 'rapports' });
RapportPDF.belongsTo(DossierMedical, { foreignKey: 'dossierId', as: 'dossier' });

// Medecin -> RapportPDF (génère)
Utilisateur.hasMany(RapportPDF, { foreignKey: 'medecinId', as: 'rapportsGeneres' });
RapportPDF.belongsTo(Utilisateur, { foreignKey: 'medecinId', as: 'medecinRapport' });

// ── Journalisation ──
Utilisateur.hasMany(JournalActivite, { foreignKey: 'utilisateurId', as: 'journaux' });
JournalActivite.belongsTo(Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });

// ── Documents sensibles ──
Patient.hasMany(DocumentSensible, { foreignKey: 'patientId', as: 'documents' });
DocumentSensible.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Utilisateur.hasMany(DocumentSensible, { foreignKey: 'uploadePar', as: 'documentsUploades' });
DocumentSensible.belongsTo(Utilisateur, { foreignKey: 'uploadePar', as: 'uploadeur' });

module.exports = {
  Utilisateur,
  Patient,
  DossierMedical,
  SignesVitaux,
  AnalyseLaboratoire,
  ResultatAnalyse,
  RapportPDF,
  Statistique,
  JournalActivite,
  DocumentSensible,
};
