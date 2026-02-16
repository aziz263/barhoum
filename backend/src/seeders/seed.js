const sequelize = require('../config/database');
require('../models');
const { Utilisateur, Patient, DossierMedical, SignesVitaux, AnalyseLaboratoire, ResultatAnalyse, JournalActivite } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await sequelize.sync({ force: true });
    console.log('Tables recreated.');

    // Create users
    const admin = await Utilisateur.create({
      nom: 'Admin', prenom: 'System', email: 'admin@medical.com',
      motDePasse: 'admin123', role: 'administrateur',
    });

    const medecin1 = await Utilisateur.create({
      nom: 'Benali', prenom: 'Ahmed', email: 'medecin@medical.com',
      motDePasse: 'medecin123', role: 'medecin', specialite: 'Cardiologie',
    });

    const medecin2 = await Utilisateur.create({
      nom: 'Khediri', prenom: 'Sara', email: 'sara.khediri@medical.com',
      motDePasse: 'medecin123', role: 'medecin', specialite: 'Neurologie',
    });

    const infirmier1 = await Utilisateur.create({
      nom: 'Boudjema', prenom: 'Fatima', email: 'infirmier@medical.com',
      motDePasse: 'infirmier123', role: 'infirmier', service: 'Urgences',
    });

    const technicien1 = await Utilisateur.create({
      nom: 'Merad', prenom: 'Karim', email: 'technicien@medical.com',
      motDePasse: 'technicien123', role: 'technicien', laboratoire: 'Biochimie',
    });

    console.log('Users created.');

    // Create patients
    const patient1 = await Patient.create({
      nom: 'Zidane', prenom: 'Mohamed', dateNaissance: '1985-03-15', sexe: 'M',
      telephone: '0555123456', adresse: 'Alger, Algérie',
      medecinId: medecin1.idUtilisateur, infirmierId: infirmier1.idUtilisateur,
    });

    const patient2 = await Patient.create({
      nom: 'Benmansour', prenom: 'Amina', dateNaissance: '1990-07-22', sexe: 'F',
      telephone: '0661987654', adresse: 'Oran, Algérie',
      medecinId: medecin2.idUtilisateur, infirmierId: infirmier1.idUtilisateur,
    });

    const patient3 = await Patient.create({
      nom: 'Hamidi', prenom: 'Youssef', dateNaissance: '1978-11-05', sexe: 'M',
      telephone: '0770456789', adresse: 'Constantine, Algérie',
      medecinId: medecin1.idUtilisateur,
    });

    console.log('Patients created.');

    // Create dossiers
    const dossier1 = await DossierMedical.create({
      patientId: patient1.idPatient, medecinId: medecin1.idUtilisateur,
      dateCreation: '2025-01-10',
      diagnostic: 'Hypertension artérielle modérée',
      traitement: 'Amlodipine 5mg, régime hyposodé',
    });

    const dossier2 = await DossierMedical.create({
      patientId: patient2.idPatient, medecinId: medecin2.idUtilisateur,
      dateCreation: '2025-02-20',
      diagnostic: 'Migraine chronique',
      traitement: 'Sumatriptan 50mg à la demande',
    });

    console.log('Medical records created.');

    // Create vital signs
    await SignesVitaux.bulkCreate([
      { patientId: patient1.idPatient, infirmierId: infirmier1.idUtilisateur, temperature: 37.2, pressionArterielle: '140/90', frequenceCardiaque: 78, dateMesure: '2025-01-10T08:00:00' },
      { patientId: patient1.idPatient, infirmierId: infirmier1.idUtilisateur, temperature: 36.8, pressionArterielle: '135/85', frequenceCardiaque: 72, dateMesure: '2025-01-15T09:00:00' },
      { patientId: patient2.idPatient, infirmierId: infirmier1.idUtilisateur, temperature: 36.9, pressionArterielle: '120/80', frequenceCardiaque: 68, dateMesure: '2025-02-20T10:00:00' },
    ]);

    console.log('Vital signs created.');

    // Create analyses
    const analyse1 = await AnalyseLaboratoire.create({
      dossierId: dossier1.idDossier, technicienId: technicien1.idUtilisateur,
      typeAnalyse: 'Bilan lipidique', dateAnalyse: '2025-01-12',
    });

    await ResultatAnalyse.create({
      analyseId: analyse1.idAnalyse,
      valeur: '2.3', unite: 'g/L', interpretation: 'Cholestérol total légèrement élevé',
    });

    console.log('Lab analyses created.');

    console.log('\n✓ Seed completed successfully!');
    console.log('\nTest accounts:');
    console.log('  Admin:      admin@medical.com / admin123');
    console.log('  Médecin:    medecin@medical.com / medecin123');
    console.log('  Infirmier:  infirmier@medical.com / infirmier123');
    console.log('  Technicien: technicien@medical.com / technicien123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
