const { body, param, validationResult } = require('express-validator');

/**
 * Middleware de gestion des erreurs de validation
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erreurs de validation.',
      errors: errors.array().map(e => ({ champ: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Règles de validation pour la création d'un utilisateur
 */
const validateUtilisateur = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis.')
    .isLength({ max: 100 }).withMessage('Le nom ne doit pas dépasser 100 caractères.'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis.')
    .isLength({ max: 100 }).withMessage('Le prénom ne doit pas dépasser 100 caractères.'),
  body('email').trim().isEmail().withMessage('Email invalide.').normalizeEmail(),
  body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
  body('role').isIn(['medecin', 'infirmier', 'administrateur', 'technicien']).withMessage('Rôle invalide.'),
  handleValidation,
];

/**
 * Règles de validation pour le login
 */
const validateLogin = [
  body('email').trim().isEmail().withMessage('Email invalide.').normalizeEmail(),
  body('motDePasse').notEmpty().withMessage('Le mot de passe est requis.'),
  handleValidation,
];

/**
 * Règles de validation pour un patient
 */
const validatePatient = [
  body('nom').trim().notEmpty().withMessage('Le nom est requis.'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est requis.'),
  body('dateNaissance').isISO8601().withMessage('Date de naissance invalide.'),
  body('sexe').isIn(['M', 'F']).withMessage('Sexe invalide (M ou F).'),
  handleValidation,
];

/**
 * Règles de validation pour un dossier médical
 */
const validateDossier = [
  body('patientId').isInt().withMessage('ID patient invalide.'),
  body('diagnostic').optional().trim().isLength({ max: 2000 }).withMessage('Diagnostic trop long.'),
  body('traitement').optional().trim().isLength({ max: 2000 }).withMessage('Traitement trop long.'),
  handleValidation,
];

/**
 * Règles de validation pour les signes vitaux
 */
const validateSignesVitaux = [
  body('patientId').isInt().withMessage('ID patient invalide.'),
  body('temperature').optional().isFloat({ min: 30, max: 45 }).withMessage('Température invalide (30-45°C).'),
  body('frequenceCardiaque').optional().isInt({ min: 20, max: 300 }).withMessage('Fréquence cardiaque invalide.'),
  handleValidation,
];

/**
 * Règles de validation pour un document upload
 */
const validateDocument = [
  body('categorie').optional().isIn(['rapport_medical', 'analyse', 'ordonnance', 'imagerie', 'certificat', 'autre'])
    .withMessage('Catégorie invalide.'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description trop longue.'),
  handleValidation,
];

/**
 * Validation d'un paramètre ID
 */
const validateId = [
  param('id').isInt().withMessage('ID invalide.'),
  handleValidation,
];

/**
 * Validation du changement de mot de passe
 */
const validatePasswordChange = [
  body('ancienMotDePasse').notEmpty().withMessage('L\'ancien mot de passe est requis.'),
  body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateUtilisateur,
  validateLogin,
  validatePatient,
  validateDossier,
  validateSignesVitaux,
  validateDocument,
  validateId,
  validatePasswordChange,
};
