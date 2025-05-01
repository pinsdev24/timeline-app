/**
 * Database Configuration for Event Service
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance with database credentials from environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development',
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

module.exports = sequelize;
