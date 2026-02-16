const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JournalActivite = sequelize.define('JournalActivite', {
  idLog: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'UPLOAD', 'DOWNLOAD', 'EXPORT', 'GENERATE'),
    allowNull: false,
  },
  ressource: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type de ressource: Patient, Dossier, Analyse, Document, etc.',
  },
  ressourceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Détails supplémentaires de l\'action',
  },
  adresseIP: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  utilisateurId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
}, {
  tableName: 'journal_activites',
  timestamps: true,
  updatedAt: false,
});

module.exports = JournalActivite;
