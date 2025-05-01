/**
 * Database Configuration
 */
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true, // Adds createdAt and updatedAt timestamps to every model
      underscored: true // Use snake_case for auto-generated fields
    }
  }
);

module.exports = sequelize;
