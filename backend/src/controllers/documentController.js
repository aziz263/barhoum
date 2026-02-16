const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { DocumentSensible, Patient, Utilisateur } = require('../models');
const { encryptFile, decryptFile, hashFile } = require('../utils/encryption');
const { logManual } = require('../middleware/logger');
const config = require('../config/config');

// Configuration Multer pour l'upload sécurisé
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = path.resolve(config.uploadDir, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtrer les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Types acceptés: PDF, images, Word, Excel, texte.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
    files: 1,
  },
});

// GET /api/documents - Liste des documents
exports.getAll = async (req, res) => {
  try {
    const { patientId, categorie } = req.query;
    const where = {};
    if (patientId) where.patientId = patientId;
    if (categorie) where.categorie = categorie;

    const documents = await DocumentSensible.findAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['idPatient', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'uploadeur', attributes: ['idUtilisateur', 'nom', 'prenom', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/documents/upload - Upload sécurisé
exports.upload = [
  upload.single('fichier'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni.' });
      }

      const { categorie, description, patientId } = req.body;
      const tmpPath = req.file.path;

      // Calculer le hash du fichier original
      const hash = await hashFile(tmpPath);

      // Chiffrer le fichier
      const encryptedDir = path.resolve(config.uploadDir, 'encrypted');
      if (!fs.existsSync(encryptedDir)) {
        fs.mkdirSync(encryptedDir, { recursive: true });
      }

      const encryptedName = `${uuidv4()}.enc`;
      const encryptedPath = path.join(encryptedDir, encryptedName);

      await encryptFile(tmpPath, encryptedPath);

      // Supprimer le fichier temporaire
      fs.unlinkSync(tmpPath);

      // Enregistrer en base de données
      const document = await DocumentSensible.create({
        nomFichier: req.file.originalname,
        nomFichierCrypte: encryptedName,
        typeFichier: req.file.mimetype,
        tailleFichier: req.file.size,
        categorie: categorie || 'autre',
        description: description || null,
        estChiffre: true,
        hashFichier: hash,
        patientId: patientId || null,
        uploadePar: req.user.idUtilisateur,
      });

      await logManual('UPLOAD', 'Document', `Upload: ${req.file.originalname}`, req, document.idDocument);

      res.status(201).json({
        message: 'Document uploadé et chiffré avec succès.',
        document,
      });
    } catch (error) {
      console.error(error);
      // Nettoyage en cas d'erreur
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: error.message || 'Erreur lors de l\'upload.' });
    }
  },
];

// GET /api/documents/:id/download - Téléchargement sécurisé (déchiffrement)
exports.download = async (req, res) => {
  try {
    const document = await DocumentSensible.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    const encryptedPath = path.resolve(config.uploadDir, 'encrypted', document.nomFichierCrypte);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ message: 'Fichier physique non trouvé.' });
    }

    // Déchiffrer dans un fichier temporaire
    const tmpDir = path.resolve(config.uploadDir, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpPath = path.join(tmpDir, `dl_${uuidv4()}${path.extname(document.nomFichier)}`);
    await decryptFile(encryptedPath, tmpPath);

    await logManual('DOWNLOAD', 'Document', `Download: ${document.nomFichier}`, req, document.idDocument);

    // Envoyer le fichier déchiffré puis supprimer
    res.download(tmpPath, document.nomFichier, (err) => {
      // Supprimer le fichier temporaire après envoi
      if (fs.existsSync(tmpPath)) {
        fs.unlinkSync(tmpPath);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du téléchargement.' });
  }
};

// DELETE /api/documents/:id - Suppression
exports.remove = async (req, res) => {
  try {
    const document = await DocumentSensible.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }

    // Supprimer le fichier chiffré
    const encryptedPath = path.resolve(config.uploadDir, 'encrypted', document.nomFichierCrypte);
    if (fs.existsSync(encryptedPath)) {
      fs.unlinkSync(encryptedPath);
    }

    const docName = document.nomFichier;
    await document.destroy();

    await logManual('DELETE', 'Document', `Suppression: ${docName}`, req, req.params.id);

    res.json({ message: 'Document supprimé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/documents/:id - Détail d'un document
exports.getById = async (req, res) => {
  try {
    const document = await DocumentSensible.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient', attributes: ['idPatient', 'nom', 'prenom'] },
        { model: Utilisateur, as: 'uploadeur', attributes: ['idUtilisateur', 'nom', 'prenom', 'role'] },
      ],
    });
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé.' });
    }
    res.json(document);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};
