const { Sequelize } = require('sequelize');
require('dotenv').config(); // Charge les variables d'environnement depuis .env

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

module.exports = sequelize;