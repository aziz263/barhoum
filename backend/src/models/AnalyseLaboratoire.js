const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalyseLaboratoire = sequelize.define('AnalyseLaboratoire', {
  idAnalyse: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  typeAnalyse: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  dateAnalyse: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dossierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'dossiers_medicaux', key: 'idDossier' },
  },
  technicienId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
}, {
  tableName: 'analyses_laboratoire',
  timestamps: true,
});

module.exports = AnalyseLaboratoire;
