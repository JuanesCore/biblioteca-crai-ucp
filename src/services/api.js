/**
 * Prioridad: REACT_APP_* en build → window.__REACT_APP_API_URL__ (runtime) → localhost solo en dev local.
 */
const resolveApiBase = () => {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const runtime = window.__REACT_APP_API_URL__;
    if (runtime) return String(runtime).replace(/\/$/, "");
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
  }

  return "";
};

const API_URL = resolveApiBase();

const getToken = () => localStorage.getItem("auth_token");

const request = async (path, options = {}) => {
  if (!API_URL) {
    throw new Error(
      "API no configurada: define REACT_APP_API_URL en Amplify o window.__REACT_APP_API_URL__ (URL base con /api)."
    );
  }

  const token = getToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal
    });

    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          response.ok
            ? "Respuesta inválida del servidor."
            : `Error del servidor (${response.status}).`
        );
      }
    }
    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Please verify backend availability.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  loginWithGoogle: (idToken) =>
    request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken })
    }),
  getSession: () => request("/auth/session"),
  searchDocuments: (params) => {
    const query = new URLSearchParams(params);
    return request(`/search?${query.toString()}`);
  },
  librarySearch: ({ q, page = 1, lang = "es-ES" }) => {
    const query = new URLSearchParams({
      q: String(q || "").trim(),
      page: String(Math.max(1, Number(page) || 1)),
      lang: lang || "es-ES"
    });
    return request(`/library/search?${query.toString()}`);
  },
  getFavorites: () => request("/favorites"),
  addFavorite: (documentId) =>
    request(`/favorites/${documentId}`, {
      method: "POST"
    }),
  removeFavorite: (documentId) =>
    request(`/favorites/${documentId}`, {
      method: "DELETE"
    }),
  createDocument: (payload) =>
    request("/documents", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateUserRole: ({ email, newRole, adminKey }) =>
    request("/users/role", {
      method: "PUT",
      body: JSON.stringify({ email, newRole, adminKey })
    })
};
