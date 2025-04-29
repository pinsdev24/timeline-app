const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,  // Définir une valeur par défaut
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Par défaut, le commentaire doit être validé par un modérateur
  },
});

module.exports = Comment;
