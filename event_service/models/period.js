const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Period = sequelize.define('Period', {
  id: {
    type: DataTypes.UUID,  
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: { 
    type: DataTypes.DATE,
  },
  end_date: {  
    type: DataTypes.DATE,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
  },
}, {
  timestamps: true, 
  underscored: true,
});

module.exports = Period;