const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DossierMedical = sequelize.define('DossierMedical', {
  idDossier: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dateCreation: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  diagnostic: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  traitement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'patients', key: 'idPatient' },
  },
  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
}, {
  tableName: 'dossiers_medicaux',
  timestamps: true,
});

module.exports = DossierMedical;
