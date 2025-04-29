const { DataTypes } = require("sequelize");
const db = require("../config/database");

const User = db.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50], // Le nom d'utilisateur doit faire entre 3 et 50 caractères
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Assure que l'email soit valide
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255], // Le mot de passe doit avoir au moins 8 caractères
    },
  },
  role: {
    type: DataTypes.ENUM("user", "moderator", "admin"),
    defaultValue: "user",
  },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
});

module.exports = User;
