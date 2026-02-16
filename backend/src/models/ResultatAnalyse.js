const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResultatAnalyse = sequelize.define('ResultatAnalyse', {
  idResultat: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  valeur: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  unite: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  interpretation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  analyseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'analyses_laboratoire', key: 'idAnalyse' },
  },
}, {
  tableName: 'resultats_analyse',
  timestamps: true,
});

module.exports = ResultatAnalyse;
