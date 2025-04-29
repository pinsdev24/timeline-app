const express = require("express");
require("dotenv").config();
const sequelize = require("./config/database");
const commentRoutes = require("./routes/commentRoutes");

const app = express();
app.use(express.json());
app.use("/comments", commentRoutes);

// Synchroniser la base de données et démarrer le serveur
sequelize.sync().then(() => {
  console.log("📦 Base de données synchronisée !");
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Comment Service tourne sur le port ${process.env.PORT}`);
  });
});
