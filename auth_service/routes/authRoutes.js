const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateToken = require("../auth.middleware"); 

require("dotenv").config();

const router = express.Router();

// Inscription
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "L'email est déjà pris" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });

    // Générer un token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "Utilisateur créé avec succès", token, user });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors.map((e) => e.message) });
    }
    res.status(400).json({ error: err.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Utilisateur non trouvé" });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe incorrect" });
    }

    // Générer un token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log(token); // Affiche le token JWT


    res.json({ message: "Connexion réussie", token, user });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// route sécurisée
router.get("/checkToken", authenticateToken, (req, res) => {
  res.json(true);
});


module.exports = router;