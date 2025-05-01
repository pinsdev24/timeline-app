const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Period = require('./period');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  period_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Period,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT, 
  date: DataTypes.STRING,
  location: DataTypes.STRING,
  location_coordinates_lat: DataTypes.FLOAT,
  location_coordinates_lng: DataTypes.FLOAT,
  theme: DataTypes.JSON, 
  sources: DataTypes.JSON,
}, {
  timestamps: true, 
  underscored: true, 
});


Event.belongsTo(Period, { foreignKey: 'period_id', as: 'period' }); 
Period.hasMany(Event);

module.exports = Event;
