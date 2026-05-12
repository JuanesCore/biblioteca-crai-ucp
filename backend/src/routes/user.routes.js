const express = require("express");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const ADMIN_KEY = process.env.ADMIN_ROLE_KEY || "2603";
const validRoles = new Set(["admin", "teacher", "student"]);

router.put("/role", requireAuth, async (req, res) => {
  try {
    const { email, newRole, adminKey } = req.body || {};

    const normalizedEmail = String(email || "").toLowerCase().trim();
    const role = String(newRole || "").toLowerCase().trim();
    const key = String(adminKey || "").trim();

    if (!normalizedEmail.endsWith("@ucp.edu.co")) {
      return res.status(403).json({ message: "No autorizado" });
    }

    if (key !== ADMIN_KEY) {
      return res.status(403).json({ message: "Clave administrativa incorrecta" });
    }

    if (!validRoles.has(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    // Only allow changing own role (prevents arbitrary changes with leaked key + token).
    if (req.user?.email?.toLowerCase() !== normalizedEmail) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const result = await User.updateOne({ email: normalizedEmail }, { role });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ message: "Rol actualizado correctamente", role });
  } catch (_error) {
    return res.status(500).json({ message: "No fue posible actualizar el rol." });
  }
});

module.exports = router;

