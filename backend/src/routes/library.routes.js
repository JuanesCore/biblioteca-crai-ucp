const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const SUMMON_SEARCH_URL = "https://ucp.summon.serialssolutions.com/api/search";
const REFERER = "https://biblioteca.ucp.edu.co/";

router.get("/search", requireAuth, async (req, res) => {
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const pageNum = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
  const lang = typeof req.query.lang === "string" ? req.query.lang.trim() : "es-ES";

  if (!rawQ) {
    return res.status(400).json({ message: "Query parameter q is required." });
  }

  const params = new URLSearchParams({
    screen_res: "W946H730",
    __refererURL: REFERER,
    pn: String(pageNum),
    ho: "t",
    "include.ft.matches": "f",
    q: rawQ
  });

  if (lang && lang !== "general") {
    params.set("l", lang);
  }

  const url = `${SUMMON_SEARCH_URL}?${params.toString()}`;

  try {
    const upstream = await fetch(url, {
      headers: {
        Accept: "application/json",
        Referer: REFERER
      }
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (_e) {
      return res.status(502).json({ message: "Library search returned invalid JSON." });
    }

    if (!upstream.ok) {
      return res.status(upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502).json({
        message: data?.message || "Library search request failed.",
        upstreamStatus: upstream.status
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("library proxy", error);
    return res.status(502).json({ message: "Could not reach library search service." });
  }
});

module.exports = router;
