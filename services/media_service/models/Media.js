/**
 * Media Model
 * Represents media files associated with events
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false,
    validate: {
      isIn: [['image', 'video']],
      notEmpty: true
    },
    comment: 'Type of media (image or video)'
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Path to the media file or external URL'
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Text description or caption for the media'
  },
  event_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Foreign key to Events table'
  },
  uploader_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the user who uploaded the media'
  }
}, {
  tableName: 'media',
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Media;
