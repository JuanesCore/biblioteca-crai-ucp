const express = require("express");
const Document = require("../models/Document");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, requireRole("admin", "teacher"), async (req, res) => {
  const { title, author, keywords = [], abstract = "", year, type, publishedAt } = req.body;
  if (!title || !author || !year || !type) {
    return res.status(400).json({ message: "title, author, year and type are required." });
  }

  const normalizedKeywords = Array.isArray(keywords)
    ? keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)
    : [];

  const created = await Document.create({
    title,
    author,
    abstract,
    year: Number(year),
    type,
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    keywords: normalizedKeywords
  });

  return res.status(201).json(created);
});

module.exports = router;
