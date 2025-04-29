const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const db = require("./config/database");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Test de la connexion à la base de données
db.authenticate()
  .then(() => console.log("✅ Connexion à la base de données réussie"))
  .catch((err) => console.error("❌ Erreur de connexion DB", err));

// Synchronisation de la base de données
db.sync({ force: false })
  .then(() => console.log("✅ Base de données synchronisée"))
  .catch((err) => console.error("❌ Erreur de connexion DB", err));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
