import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
import { api } from "../../services/api";
import { ensureFirebase } from "../../firebase";
import heroBackground from "../imagen/general-3.jpg";
import logoUcp from "../imagen/logo-ucp.png";

const UCP_DOMAIN = "@ucp.edu.co";

const normalizeUiError = (err) => {
  const code = err?.code || "";
  const msg = String(err?.message || "");

  if (msg.includes("Failed to fetch")) {
    return "No fue posible conectarse al servidor. Verifica tu conexión o intenta más tarde.";
  }
  if (msg.toLowerCase().includes("timeout")) {
    return "El servidor está tardando en responder. Intenta nuevamente en unos segundos.";
  }
  if (code === "auth/network-request-failed") {
    return "Problema de conexión. Revisa tu internet e intenta nuevamente.";
  }
  if (code === "auth/popup-blocked") {
    return "El navegador bloqueó la ventana emergente. Habilita popups e intenta otra vez.";
  }
  if (code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user") {
    return "";
  }

  return msg || "Ocurrió un error. Intenta nuevamente.";
};

const Login = ({ setAuth }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const { firebaseAuth } = ensureFirebase();
      if (firebaseAuth) {
        try {
          const cred = await signInWithEmailAndPassword(firebaseAuth, form.email.trim(), form.password);
          if (!cred.user.emailVerified) {
            await signOut(firebaseAuth);
            setError("Debes verificar tu correo antes de ingresar");
            return;
          }
          await signOut(firebaseAuth);
        } catch (fbErr) {
          const code = fbErr?.code || "";
          if (code === "auth/user-not-found") {
            const data = await api.login(form.email, form.password);
            localStorage.setItem("auth_token", data.token);
            setAuth({ checking: false, user: data.user });
            return;
          }
          if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
            setError("Correo o contraseña incorrectos.");
            return;
          }
          if (code === "auth/invalid-email") {
            setError("El correo electrónico no es válido.");
            return;
          }
          if (code === "auth/too-many-requests") {
            setError("Demasiados intentos. Espera un momento e intenta de nuevo.");
            return;
          }
          throw fbErr;
        }
      }

      const data = await api.login(form.email, form.password);
      localStorage.setItem("auth_token", data.token);
      setAuth({ checking: false, user: data.user });
    } catch (requestError) {
      setError(normalizeUiError(requestError));
    } finally {
      setLoading(false);
    }
  };

  const sendFirebaseVerificationForNewUser = async (email, password) => {
    const { firebaseAuth } = ensureFirebase();
    if (!firebaseAuth) return;
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    } catch (e) {
      if (e?.code === "auth/email-already-in-use") {
        try {
          cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        } catch {
          return;
        }
      } else {
        return;
      }
    }
    await sendEmailVerification(cred.user);
    await signOut(firebaseAuth);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setRegisterLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await api.register({
        name: form.name,
        email: form.email,
        password: form.password
      });

      const { firebaseAuth } = ensureFirebase();
      if (firebaseAuth) {
        // Si el usuario ya tenía cuenta en Firebase, intentamos mandar verificación igualmente.
        await sendFirebaseVerificationForNewUser(form.email.trim(), form.password);
        setMode("login");
        setSuccessMsg(
          "Cuenta creada. Te enviamos un correo de verificación. Verifica tu correo antes de iniciar sesión."
        );
      } else {
        setMode("login");
        setSuccessMsg("Cuenta creada. Ya puedes iniciar sesión con tu correo y contraseña.");
      }
    } catch (requestError) {
      setError(normalizeUiError(requestError));
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { firebaseAuth, googleProvider } = ensureFirebase();
    if (!firebaseAuth || !googleProvider) {
      setError("Google Sign-In no está disponible. Revisa la configuración de Firebase.");
      return;
    }
    setGoogleLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      try {
        googleProvider.setCustomParameters({
          hd: "ucp.edu.co",
          prompt: "select_account"
        });
      } catch {
        // ignore
      }

      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const googleEmail = result.user.email?.toLowerCase() || "";
      if (!googleEmail.endsWith(UCP_DOMAIN)) {
        await signOut(firebaseAuth);
        setError("Solo correos institucionales UCP");
        return;
      }

      // Asegura que el correo tenga métodos válidos en Firebase (mejora mensajes si el backend responde 500)
      try {
        await fetchSignInMethodsForEmail(firebaseAuth, googleEmail);
      } catch {
        // ignore
      }

      const idToken = await result.user.getIdToken();
      const data = await api.loginWithGoogle(idToken);

      localStorage.setItem("auth_token", data.token);
      setAuth({ checking: false, user: data.user });
    } catch (requestError) {
      const code = requestError?.code || "";
      const normalized = normalizeUiError(requestError);
      if (code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user") {
        setError("");
        return;
      }
      setError(normalized || "No fue posible iniciar sesión con Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${heroBackground})` }}>
      <div className="auth-overlay" />
      <div className="auth-card">
        <img src={logoUcp} alt="Universidad Catolica de Pereira" className="auth-logo" />
        <h1 className="auth-main-title">Portal Biblioteca CRAI</h1>
        <p className="auth-subtitle auth-subtitle--split">
          <span className="auth-subtitle-line">Ingresa con tu cuenta</span>
          <span className="auth-subtitle-line">UCP</span>
        </p>

        {mode === "login" ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            {error ? <p className="error-text">{error}</p> : null}
            {successMsg ? <p className="success-text">{successMsg}</p> : null}
            <button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <input
              name="name"
              type="text"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Contraseña (mín. 6 caracteres)"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
            {error ? <p className="error-text">{error}</p> : null}
            {successMsg ? <p className="success-text">{successMsg}</p> : null}
            <button type="submit" disabled={registerLoading}>
              {registerLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        )}

        <div className="auth-mode-toggle">
          {mode === "login" ? (
            <button
              type="button"
              className="auth-linkish"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccessMsg("");
              }}
            >
              Registrarse
            </button>
          ) : (
            <button
              type="button"
              className="auth-linkish"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccessMsg("");
              }}
            >
              Ya tengo cuenta
            </button>
          )}
        </div>

        <div className="auth-separator">
          <span>o</span>
        </div>

        <button
          type="button"
          className="google-button google-button--ucp"
          onClick={handleGoogleLogin}
          disabled={googleLoading || mode === "register"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="#EA4335"
              d="M12 11.636v4.616h6.437c-.284 1.487-1.99 4.363-6.437 4.363-3.873 0-7.028-3.206-7.028-7.16 0-3.955 3.155-7.16 7.028-7.16 2.204 0 3.68.94 4.526 1.75l3.08-2.984C17.676 3.22 15.08 2 12 2 6.925 2 2.8 6.132 2.8 11.227c0 5.094 4.125 9.227 9.2 9.227 5.307 0 8.82-3.724 8.82-8.976 0-.603-.066-1.06-.147-1.515H12z"
            />
            <path
              fill="#34A853"
              d="M3.59 7.346l3.792 2.78C8.405 8.115 10.03 6.9 12 6.9c2.204 0 3.68.94 4.526 1.75l3.08-2.984C17.676 3.22 15.08 2 12 2 8.465 2 5.397 4.013 3.59 7.346z"
            />
            <path
              fill="#FBBC05"
              d="M12 22c3.02 0 5.555-.995 7.406-2.706l-3.425-2.804c-.925.644-2.106 1.025-3.981 1.025-4.429 0-6.138-2.86-6.433-4.337L1.71 16.04C3.5 19.466 7.364 22 12 22z"
            />
            <path
              fill="#4285F4"
              d="M20.853 11.478c0-.603-.066-1.06-.147-1.515H12v4.616h6.437c-.284 1.487-1.99 4.363-6.437 4.363-4.429 0-6.138-2.86-6.433-4.337L1.71 16.04C3.5 19.466 7.364 22 12 22c5.307 0 8.82-3.724 8.82-8.976z"
            />
          </svg>
          <span>{googleLoading ? "Conectando con Google..." : "Continuar con Google (@ucp.edu.co)"}</span>
        </button>

        <p className="helper-text">
          Google: solo correo institucional @ucp.edu.co. Registro con email: verificación obligatoria antes de entrar.
        </p>
      </div>
    </div>
  );
};

export default Login;
