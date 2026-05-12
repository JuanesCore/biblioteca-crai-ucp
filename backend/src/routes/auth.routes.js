const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");
const { requireAuth } = require("../middleware/auth");
const { getFirebaseAdmin } = require("../config/firebase");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios." });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Ya existe una cuenta con este correo." });
    }

    const allowedRoles = new Set(["admin", "teacher", "student", "guest"]);
    const requestedRole = typeof role === "string" ? role.toLowerCase().trim() : "";
    const isInstitutional = normalizedEmail.endsWith("@ucp.edu.co");
    const inferredRole = (() => {
      if (!isInstitutional) return "guest";
      if (normalizedEmail.includes("admin")) return "admin";
      if (normalizedEmail.includes("docente") || normalizedEmail.includes("profesor")) return "teacher";
      return "student";
    })();
    const finalRole = requestedRole && allowedRoles.has(requestedRole) ? requestedRole : inferredRole;

    const passwordHash = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: finalRole
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: "No se pudo completar el registro." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: "Could not complete login." });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required." });
    }

    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const email = decodedToken.email?.toLowerCase().trim();
    const name = decodedToken.name?.trim() || "Institutional User";
    const firebaseUid = decodedToken.uid;

    if (!email || !firebaseUid) {
      return res.status(400).json({ message: "Google account data is incomplete." });
    }

    // Restrict access to institutional accounts only.
    if (!email.endsWith("@ucp.edu.co")) {
      return res.status(403).json({ message: "Only institutional accounts are allowed." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: "student",
        passwordHash: null
      });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    if (error.code?.startsWith("auth/")) {
      return res.status(401).json({ message: "Invalid Google token." });
    }
    return res.status(500).json({ message: "Could not authenticate with Google." });
  }
});

router.get("/session", requireAuth, (req, res) => {
  return res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
});

module.exports = router;
