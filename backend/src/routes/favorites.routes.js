const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Document = require("../models/Document");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  return res.json({ favorites: user.favorites || [] });
});

router.post("/:documentId", requireAuth, async (req, res) => {
  const { documentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(400).json({ message: "Invalid document id." });
  }

  const document = await Document.findById(documentId);
  if (!document) {
    return res.status(404).json({ message: "Document not found." });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { favorites: document._id } }
  );

  return res.status(201).json({ message: "Document added to favorites." });
});

router.delete("/:documentId", requireAuth, async (req, res) => {
  const { documentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(400).json({ message: "Invalid document id." });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $pull: { favorites: documentId } }
  );

  return res.json({ message: "Document removed from favorites." });
});

module.exports = router;
