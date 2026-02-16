const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  idPatient: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  dateNaissance: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  sexe: {
    type: DataTypes.ENUM('M', 'F'),
    allowNull: false,
  },
  telephone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // Foreign keys for who created/manages
  medecinId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
  infirmierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'utilisateurs', key: 'idUtilisateur' },
  },
}, {
  tableName: 'patients',
  timestamps: true,
});

module.exports = Patient;
