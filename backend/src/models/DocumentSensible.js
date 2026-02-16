const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentSensible = sequelize.define('DocumentSensible', {
  idDocument: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nomFichier: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom original du fichier uploadé',
  },
  nomFichierCrypte: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nom du fichier stocké (chiffré) sur le serveur',
  },
  typeFichier: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'MIME type du fichier',
  },
  tailleFichier: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Taille en octets',
  },
  categorie: {
    type: DataTypes.ENUM('rapport_medical', 'analyse', 'ordonnance', 'imagerie', 'certificat', 'autre'),
    allowNull: false,
    defaultValue: 'autre',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estChiffre: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indique si le fichier est chiffré sur le disque',
  },
  hashFichier: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: 'SHA-256 hash pour vérifier l\'intégrité',
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'patients', key: 'idPatient' },
  },
  uploadePar: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
}, {
  tableName: 'documents_sensibles',
  timestamps: true,
});

module.exports = DocumentSensible;
