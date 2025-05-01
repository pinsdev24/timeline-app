/**
 * Comment Model
 * Defines the schema for comment data
 */
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
    validate: {
      notEmpty: {
        msg: "Comment content cannot be empty"
      },
      len: {
        args: [3, 1000],
        msg: "Comment must be between 3 and 1000 characters"
      }
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: {
        msg: "User ID must be an integer"
      }
    }
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: {
        msg: "Event ID must be an integer"
      }
    }
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Comments need moderator approval by default
  },
}, {
  timestamps: true, // Enable createdAt and updatedAt
  // Return virtuals in JSON responses
  toJSON: {
    virtuals: true
  }
});

module.exports = Comment;
