const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Period = require('./period');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,       
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true,
  },
  period_id: {
    type: DataTypes.UUID,       
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
  date: DataTypes.DATE,
  location: DataTypes.JSON,  
  theme: DataTypes.JSON,    
  medias: DataTypes.JSON,  
  sources: DataTypes.JSON,  
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

Event.belongsTo(Period, { foreignKey: 'period_id', as: 'period' }); 
Period.hasMany(Event, { foreignKey: 'period_id', as: 'events' });

module.exports = Event;
