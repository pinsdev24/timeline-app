const express = require("express");
const Comment = require("../models/Comment");
const router = express.Router();

// ➤ Ajouter un commentaire (non approuvé par défaut)
router.post("/add", async (req, res) => {
  try {
    const { content, userId, event_id } = req.body;

    if (!content || !userId || !event_id) {
      return res.status(400).json({ message: "Le contenu, l'userId et l'event_id sont obligatoires." });
    }

    const comment = await Comment.create({ content, userId, event_id });
    res.status(201).json(comment);
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du commentaire : ", error);  // Log détaillé de l'erreur
    res.status(500).json({ message: "Erreur lors de l'ajout du commentaire.", error: error.message });
  }
});

// ➤ Récupérer tous les commentaires (peu importe leur statut)
router.get("/all", async (req, res) => {
  try {
    const allComments = await Comment.findAll(); 
    res.json(allComments);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de tous les commentaires." });
  }
});


// ➤ Récupérer tous les commentaires approuvés
router.get("/get-approved", async (req, res) => {
  try {
    const comments = await Comment.findAll({ where: { isApproved: true } });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commentaires." });
  }
});

// ➤ Récupérer les commentaires en attente de validation
router.get("/pending", async (req, res) => {
  try {
    const pendingComments = await Comment.findAll({ where: { isApproved: false } });
    res.json(pendingComments);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commentaires en attente." });
  }
});

// ➤ Approuver un commentaire (requiert un modérateur)
router.put("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable." });
    }
    await comment.update({ isApproved: true });
    res.json({ message: "Commentaire approuvé avec succès.", comment });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'approbation du commentaire." });
  }
});

// ➤ Supprimer un commentaire
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable." });
    }
    await comment.destroy();
    res.json({ message: "Commentaire supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du commentaire." });
  }
});

module.exports = router;
