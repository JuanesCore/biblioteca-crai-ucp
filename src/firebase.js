import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";

/**
 * Soporta:
 * 1. Variables de entorno (.env)
 * 2. Configuración runtime (window.__FIREBASE_CONFIG__)
 */

// 🔹 Config desde .env
const envConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// 🔹 Config runtime (opcional)
const runtimeConfig =
  typeof window !== "undefined" &&
  window.__FIREBASE_CONFIG__ &&
  typeof window.__FIREBASE_CONFIG__ === "object"
    ? window.__FIREBASE_CONFIG__
    : null;

// 🔹 Mezcla final (prioridad runtime)
const resolvedConfig = {
  apiKey: runtimeConfig?.apiKey || envConfig.apiKey,
  authDomain: runtimeConfig?.authDomain || envConfig.authDomain,
  projectId: runtimeConfig?.projectId || envConfig.projectId,
  storageBucket: runtimeConfig?.storageBucket || envConfig.storageBucket,
  messagingSenderId: runtimeConfig?.messagingSenderId || envConfig.messagingSenderId,
  appId: runtimeConfig?.appId || envConfig.appId,
  measurementId: runtimeConfig?.measurementId || envConfig.measurementId
};

// 🔹 Fallback hardcode (si NO hay .env válido). Esto NO rompe el resto.
const hardcodedConfig = {
  apiKey: "AIzaSyBpWyCUXkvokgntKyZ-T5FPRH9SUSvVzKI",
  authDomain: "biblioteca-crai-ucp.firebaseapp.com",
  projectId: "biblioteca-crai-ucp",
  storageBucket: "biblioteca-crai-ucp.firebasestorage.app",
  messagingSenderId: "821809872544",
  appId: "1:821809872544:web:06843196fee24e2dc013c5",
  measurementId: "G-EB0TYBJKLX"
};

const finalConfig =
  resolvedConfig?.apiKey && resolvedConfig?.authDomain && resolvedConfig?.projectId ? resolvedConfig : hardcodedConfig;

let firebaseAuth = null;
let googleProvider = null;
let firebaseApp = null;
let firebaseAnalytics = null;
let initError = null;

export const ensureFirebase = () => {
  // Si ya está inicializado, reutilizar
  if (firebaseAuth && googleProvider) {
    return { firebaseApp, firebaseAuth, googleProvider, firebaseAnalytics, initError };
  }

  try {
    // Validación fuerte
    if (
      !finalConfig.apiKey ||
      !finalConfig.authDomain ||
      !finalConfig.projectId
    ) {
      throw new Error("Firebase config incompleta");
    }

    // Evita doble init
    const app = getApps().length ? getApp() : initializeApp(finalConfig);
    firebaseApp = app;

    firebaseAuth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Config opcional (mejora UX)
    googleProvider.setCustomParameters({
      prompt: "select_account"
    });

    // Analytics (opcional)
    if (!firebaseAnalytics && finalConfig.measurementId) {
      analyticsSupported()
        .then((ok) => {
          if (!ok) return;
          firebaseAnalytics = getAnalytics(app);
        })
        .catch(() => {
          // ignore
        });
    }

    initError = null;
  } catch (error) {
    console.error("🔥 Firebase init error:", error);
    initError = error;
    firebaseApp = null;
    firebaseAuth = null;
    googleProvider = null;
    firebaseAnalytics = null;
  }

  return { firebaseApp, firebaseAuth, googleProvider, firebaseAnalytics, initError };
};

// Inicialización automática (efecto lateral al cargar el módulo)
ensureFirebase();

export { firebaseApp, firebaseAuth, googleProvider, firebaseAnalytics, initError };