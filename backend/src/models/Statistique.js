const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Statistique = sequelize.define('Statistique', {
  idStatistique: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  valeur: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dateCalcul: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'statistiques',
  timestamps: true,
});

module.exports = Statistique;
