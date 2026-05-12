const express = require("express");
const Document = require("../models/Document");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/", requireAuth, async (req, res) => {
  const { title, author, keyword, type, year } = req.query;

  const query = {};
  if (title) query.title = { $regex: escapeRegex(title), $options: "i" };
  if (author) query.author = { $regex: escapeRegex(author), $options: "i" };
  if (keyword) query.keywords = { $regex: escapeRegex(keyword), $options: "i" };
  if (type) query.type = { $regex: escapeRegex(type), $options: "i" };
  if (year) {
    const y = Number(year);
    if (!Number.isNaN(y)) query.year = y;
  }

  const results = await Document.find(query).sort({ createdAt: -1 }).limit(100);
  return res.json({ count: results.length, results });
});

module.exports = router;
