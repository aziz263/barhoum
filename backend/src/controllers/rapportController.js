const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { RapportPDF, DossierMedical, Patient, Utilisateur } = require('../models');
const config = require('../config/config');

// GET /api/rapports
exports.getAll = async (req, res) => {
  try {
    const { dossierId } = req.query;
    const where = {};
    if (dossierId) where.dossierId = dossierId;

    const rapports = await RapportPDF.findAll({
      where,
      include: [
        { model: DossierMedical, as: 'dossier', include: [{ association: 'patient', attributes: ['idPatient', 'nom', 'prenom'] }] },
        { model: Utilisateur, as: 'medecinRapport', attributes: ['idUtilisateur', 'nom', 'prenom'] },
      ],
      order: [['dateGeneration', 'DESC']],
    });
    res.json(rapports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/rapports/generate
exports.generate = async (req, res) => {
  try {
    const { dossierId } = req.body;

    const dossier = await DossierMedical.findByPk(dossierId, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Utilisateur, as: 'medecinDossier', attributes: ['idUtilisateur', 'nom', 'prenom', 'specialite'] },
        { association: 'analyses', include: [{ association: 'resultat' }] },
      ],
    });

    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé.' });

    // Ensure uploads directory exists
    const uploadsDir = path.resolve(config.uploadDir);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `rapport_${dossier.idDossier}_${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Rapport Médical', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
    doc.moveDown();

    // Patient info
    doc.fontSize(14).text('Informations du Patient', { underline: true });
    doc.fontSize(11);
    doc.text(`Nom: ${dossier.patient.nom} ${dossier.patient.prenom}`);
    doc.text(`Date de naissance: ${dossier.patient.dateNaissance}`);
    doc.text(`Sexe: ${dossier.patient.sexe === 'M' ? 'Masculin' : 'Féminin'}`);
    doc.moveDown();

    // Dossier
    doc.fontSize(14).text('Dossier Médical', { underline: true });
    doc.fontSize(11);
    doc.text(`Date de création: ${dossier.dateCreation}`);
    doc.text(`Diagnostic: ${dossier.diagnostic || 'Non spécifié'}`);
    doc.text(`Traitement: ${dossier.traitement || 'Non spécifié'}`);
    doc.text(`Médecin: Dr. ${dossier.medecinDossier.nom} ${dossier.medecinDossier.prenom}`);
    doc.moveDown();

    // Analyses
    if (dossier.analyses && dossier.analyses.length > 0) {
      doc.fontSize(14).text('Analyses de Laboratoire', { underline: true });
      doc.fontSize(11);
      dossier.analyses.forEach((analyse, i) => {
        doc.text(`${i + 1}. ${analyse.typeAnalyse} - ${analyse.dateAnalyse}`);
        if (analyse.resultat) {
          doc.text(`   Résultat: ${analyse.resultat.valeur} ${analyse.resultat.unite}`);
          doc.text(`   Interprétation: ${analyse.resultat.interpretation || 'N/A'}`);
        }
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(9).text('Document généré automatiquement par le Système de Suivi Médical', { align: 'center' });

    doc.end();

    await new Promise((resolve) => stream.on('finish', resolve));

    const rapport = await RapportPDF.create({
      dossierId,
      dateGeneration: new Date(),
      cheminFichier: fileName,
      medecinId: req.user.idUtilisateur,
    });

    res.status(201).json(rapport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/rapports/:id/download
exports.download = async (req, res) => {
  try {
    const rapport = await RapportPDF.findByPk(req.params.id);
    if (!rapport) return res.status(404).json({ message: 'Rapport non trouvé.' });

    const filePath = path.resolve(config.uploadDir, rapport.cheminFichier);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier PDF non trouvé.' });
    }

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/rapports/:id
exports.remove = async (req, res) => {
  try {
    const rapport = await RapportPDF.findByPk(req.params.id);
    if (!rapport) return res.status(404).json({ message: 'Rapport non trouvé.' });

    const filePath = path.resolve(config.uploadDir, rapport.cheminFichier);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await rapport.destroy();
    res.json({ message: 'Rapport supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
