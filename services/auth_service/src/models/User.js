/**
 * User Model
 * Defines the schema for user data
 */
const { DataTypes } = require("sequelize");
const db = require("../config/database");

const User = db.define("User", {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [3, 50],
        msg: "Username must be between 3 and 50 characters"
      }
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: "Email must be a valid email address"
      }
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [8, 255],
        msg: "Password must be at least 8 characters long"
      }
    },
  },
  role: {
    type: DataTypes.ENUM("user", "moderator", "admin"),
    defaultValue: "user",
    validate: {
      isIn: {
        args: [["user", "moderator", "admin"]],
        msg: "Role must be one of: user, moderator, admin"
      }
    }
  },
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  // Return virtuals in JSON responses
  toJSON: {
    virtuals: true,
    // Hide sensitive data when converting to JSON
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    }
  }
});

module.exports = User;
