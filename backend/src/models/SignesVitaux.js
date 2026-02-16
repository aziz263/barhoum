const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SignesVitaux = sequelize.define('SignesVitaux', {
  idSignes: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  pressionArterielle: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  frequenceCardiaque: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dateMesure: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'patients', key: 'idPatient' },
  },
  infirmierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
}, {
  tableName: 'signes_vitaux',
  timestamps: true,
});

module.exports = SignesVitaux;
