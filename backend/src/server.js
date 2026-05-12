const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const searchRoutes = require("./routes/search.routes");
const favoritesRoutes = require("./routes/favorites.routes");
const documentsRoutes = require("./routes/documents.routes");
const libraryRoutes = require("./routes/library.routes");
const userRoutes = require("./routes/user.routes");

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Orígenes permitidos: CORS_ORIGIN o FRONTEND_ORIGIN (coma-separados).
 * Ejemplo producción: https://main.xxxxx.amplifyapp.com,https://app.midominio.edu.co
 */
const resolveCorsOrigins = () => {
  const raw = process.env.CORS_ORIGIN || process.env.FRONTEND_ORIGIN || "";
  if (!raw.trim()) {
    return ["http://localhost:3000"];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const allowedOrigins = resolveCorsOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  })
);

if (process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/users", userRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
};

start().catch((error) => {
  console.error("Could not start server", error);
  process.exit(1);
});
