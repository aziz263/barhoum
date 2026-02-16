const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Utilisateur = sequelize.define('Utilisateur', {
  idUtilisateur: {
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
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  motDePasse: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('medecin', 'infirmier', 'administrateur', 'technicien'),
    allowNull: false,
  },
  // Role-specific fields stored in same table (Single Table Inheritance)
  specialite: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  service: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  laboratoire: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'utilisateurs',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.motDePasse) {
        user.motDePasse = await bcrypt.hash(user.motDePasse, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('motDePasse')) {
        user.motDePasse = await bcrypt.hash(user.motDePasse, 10);
      }
    },
  },
});

Utilisateur.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.motDePasse);
};

Utilisateur.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.motDePasse;
  return values;
};

module.exports = Utilisateur;
