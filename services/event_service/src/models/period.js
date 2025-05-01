const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Period = sequelize.define('Period', {
  id: {
    type: DataTypes.INTEGER, 
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_date: { 
    type: DataTypes.STRING,
  },
  end_date: {  
    type: DataTypes.STRING,
  },
}, {
  timestamps: true, 
  underscored: true,
});

module.exports = Period;