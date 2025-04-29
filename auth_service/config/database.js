const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config(); // Charger les variables d'environnement

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: 3306,
  logging: false,
});

module.exports = db;
