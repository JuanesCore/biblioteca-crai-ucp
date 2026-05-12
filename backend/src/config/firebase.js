const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let firebaseAdminApp = null;

const getFirebaseAdmin = () => {
  if (firebaseAdminApp) {
    return admin;
  }

  // Option A (recommended): Provide a service account JSON file path.
  // Supports FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS.
  const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || "";

  if (serviceAccountPath) {
    // Resolve relative to backend root to avoid cwd surprises when running "start:full".
    const backendRoot = path.join(__dirname, "..", "..");
    const abs = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(backendRoot, serviceAccountPath);

    let raw = "";
    try {
      raw = fs.readFileSync(abs, "utf8");
    } catch (e) {
      throw new Error(`Firebase Admin: no se pudo leer el archivo JSON en ${abs}. (${e.message})`);
    }

    if (!raw.trim()) {
      throw new Error(`Firebase Admin: el archivo JSON está vacío en ${abs}.`);
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Firebase Admin: JSON inválido en ${abs}. (${e.message})`);
    }

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    return admin;
  }

  // Option B: Provide individual env vars (useful for CI/CD).
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH (recommended) or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
    );
  }

  firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey })
  });

  return admin;
};

module.exports = { getFirebaseAdmin };
