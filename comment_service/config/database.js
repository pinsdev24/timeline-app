const { Sequelize } = require("sequelize");
require("dotenv").config();

// Création d'une instance Sequelize avec SQLite
const sequelize = new Sequelize({
  //dialect: process.env.DB_DIALECT, // Utilise SQLite (défini dans .env)
  dialect: 'sqlite',
  storage: 'comment_db.sqlite',
  //storage: "./comment_db.sqlite", // Nom du fichier SQLite
  logging: false, // Désactive les logs SQL (optionnel)
});

// Vérification de la connexion et ajout de la colonne event_id si nécessaire
(async () => {
  try {
    // Vérification de la connexion à la base de données
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données réussie !");
    
    // Synchronisation de la base de données avec le modèle (ajout des nouvelles colonnes si nécessaire)
    await sequelize.sync({ alter: true });
    console.log("📦 Base de données synchronisée !");

  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error);
  }
})();

module.exports = sequelize;
