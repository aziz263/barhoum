const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/documentController');
const { auth, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/security');
const { logActivity } = require('../middleware/logger');

router.use(auth);

// Liste des documents
router.get('/', ctrl.getAll);

// Détail d'un document
router.get('/:id', ctrl.getById);

// Upload sécurisé (avec rate limiting)
router.post('/upload', uploadLimiter, ctrl.upload);

// Téléchargement sécurisé (déchiffrement à la volée)
router.get('/:id/download', logActivity('DOWNLOAD', 'Document'), ctrl.download);

// Suppression (médecin ou admin uniquement)
router.delete('/:id', authorize('medecin', 'administrateur'), ctrl.remove);

module.exports = router;
