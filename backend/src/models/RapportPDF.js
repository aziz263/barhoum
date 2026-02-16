const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RapportPDF = sequelize.define('RapportPDF', {
  idRapport: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dateGeneration: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  cheminFichier: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  dossierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'dossiers_medicaux', key: 'idDossier' },
  },
  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
}, {
  tableName: 'rapports_pdf',
  timestamps: true,
});

module.exports = RapportPDF;
