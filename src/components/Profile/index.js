import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from "firebase/auth";
import { firebaseAuth } from "../../firebase";
import { api } from "../../services/api";

const profileStorageKey = (email) => `ucp_profile_${email || "anon"}`;

const roleLabels = {
  admin: "Administrador",
  teacher: "Docente",
  student: "Estudiante",
  guest: "Invitado"
};

const loadProfile = (email) => {
  try {
    const raw = localStorage.getItem(profileStorageKey(email));
    const p = raw ? JSON.parse(raw) : {};
    return {
      career: typeof p.career === "string" ? p.career : "",
      faculty: typeof p.faculty === "string" ? p.faculty : "",
      photoDataUrl: typeof p.photoDataUrl === "string" ? p.photoDataUrl : "",
      displayName: typeof p.displayName === "string" ? p.displayName : ""
    };
  } catch {
    return { career: "", faculty: "", photoDataUrl: "", displayName: "" };
  }
};

const Profile = ({ user, setAuth }) => {
  const email = user?.email || "";
  const [tab, setTab] = useState("view");
  const [saved, setSaved] = useState(() => loadProfile(email));
  const [form, setForm] = useState(() => loadProfile(email));
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [roleForm, setRoleForm] = useState({ adminKey: "", newRole: "student" });
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [roleSuccess, setRoleSuccess] = useState("");

  useEffect(() => {
    const next = loadProfile(email);
    setSaved(next);
    setForm(next);
  }, [email]);

  useEffect(() => {
    const syncTab = () => {
      setTab(window.location.hash === "#edit" ? "edit" : "view");
    };
    syncTab();
    window.addEventListener("hashchange", syncTab);
    return () => window.removeEventListener("hashchange", syncTab);
  }, []);

  const mergedName = useMemo(() => {
    const local = form.displayName?.trim();
    if (local) return local;
    return user?.name || "";
  }, [form.displayName, user?.name]);

  const roleLabel = roleLabels[user?.role] || user?.role || "—";
  const isStudent = user?.role === "student";

  const normalizePwError = (err) => {
    const code = err?.code || "";
    const msg = String(err?.message || "");
    if (msg.includes("Failed to fetch")) return "No fue posible conectarse. Intenta nuevamente.";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") return "La contraseña actual no es correcta.";
    if (code === "auth/too-many-requests") return "Demasiados intentos. Espera un momento e intenta de nuevo.";
    if (code === "auth/weak-password") return "La nueva contraseña es muy débil. Usa una más segura.";
    if (code === "auth/requires-recent-login") return "Por seguridad, vuelve a iniciar sesión e intenta de nuevo.";
    if (code === "auth/network-request-failed") return "Problema de conexión. Revisa tu internet.";
    return msg || "No fue posible actualizar la contraseña.";
  };

  const persist = (next) => {
    localStorage.setItem(profileStorageKey(email), JSON.stringify(next));
    setSaved(next);
    setForm(next);
  };

  const onPhoto = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const photoDataUrl = typeof reader.result === "string" ? reader.result : "";
      setForm((prev) => ({ ...prev, photoDataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const submitEdit = (event) => {
    event.preventDefault();
    persist({
      career: form.career.trim(),
      faculty: form.faculty.trim(),
      photoDataUrl: form.photoDataUrl,
      displayName: form.displayName.trim()
    });
    setTab("view");
    window.history.replaceState(null, "", "/perfil");
  };

  const submitPasswordChange = async (event) => {
    event.preventDefault();
    setPwError("");
    setPwSuccess("");

    const currentPassword = pwForm.currentPassword;
    const newPassword = pwForm.newPassword;
    const confirmPassword = pwForm.confirmPassword;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Completa todos los campos para actualizar la contraseña.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("La confirmación no coincide con la nueva contraseña.");
      return;
    }
    if (!firebaseAuth) {
      setPwError("Cambio de contraseña no disponible en este entorno (Firebase no configurado).");
      return;
    }
    if (!email) {
      setPwError("No se encontró el correo del usuario.");
      return;
    }

    setPwLoading(true);
    try {
      // Este sistema usa JWT del backend. Para cambiar contraseña en Firebase,
      // autenticamos temporalmente en Firebase con email/password.
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, currentPassword);
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(cred.user, credential);
      await updatePassword(cred.user, newPassword);
      await signOut(firebaseAuth);

      setPwSuccess("Contraseña actualizada correctamente.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(normalizePwError(err));
      try {
        await signOut(firebaseAuth);
      } catch {
        // ignore
      }
    } finally {
      setPwLoading(false);
    }
  };

  const submitRoleChange = async (event) => {
    event.preventDefault();
    setRoleError("");
    setRoleSuccess("");

    const adminKey = String(roleForm.adminKey || "");
    const newRole = String(roleForm.newRole || "");

    if (adminKey !== "2603") {
      setRoleError("Clave administrativa incorrecta");
      return;
    }
    if (!email.toLowerCase().endsWith("@ucp.edu.co")) {
      setRoleError("Solo usuarios institucionales pueden cambiar de rol");
      return;
    }

    setRoleLoading(true);
    try {
      await api.updateUserRole({ email, newRole, adminKey });
      setRoleSuccess("Rol actualizado correctamente.");
      setRoleForm({ adminKey: "", newRole });

      // Refresca el usuario en memoria para que Navbar / Analytics reaccionen.
      if (typeof setAuth === "function") {
        const session = await api.getSession();
        setAuth({ checking: false, user: session.user });
      }
    } catch (e) {
      const msg = String(e?.message || "");
      setRoleError(msg || "No fue posible actualizar el rol.");
    } finally {
      setRoleLoading(false);
    }
  };

  const avatarInitial = (tab === "edit" ? form.displayName || user?.name : mergedName).slice(0, 1).toUpperCase() || "U";
  const photoSrc = tab === "edit" ? form.photoDataUrl : saved.photoDataUrl;

  return (
    <div className="crai-profile crai-profile--dashboard">
      <div className="crai-profile__head">
        <div>
          <h1 className="crai-profile__title">Mi perfil UCP</h1>
          <p className="crai-profile__subtitle">Información académica y datos de contacto.</p>
        </div>
        <Link to="/" className="crai-profile__back">
          Volver al buscador
        </Link>
      </div>

      <div className="crai-profile__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "view"}
          className={`crai-profile__tab ${tab === "view" ? "is-active" : ""}`}
          onClick={() => {
            setTab("view");
            window.history.replaceState(null, "", "/perfil");
          }}
        >
          Ver perfil
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "edit"}
          className={`crai-profile__tab ${tab === "edit" ? "is-active" : ""}`}
          onClick={() => {
            setTab("edit");
            window.history.replaceState(null, "", "/perfil#edit");
          }}
        >
          Editar información
        </button>
      </div>

      {tab === "view" ? (
        <div className="crai-profile__shell crai-surface">
          <div className="crai-profile__grid">
            <aside className="crai-profile__col crai-profile__col--aside">
              <div className="crai-profile__avatar-wrap crai-profile__avatar-wrap--lg">
                {saved.photoDataUrl ? (
                  <img src={saved.photoDataUrl} alt="" className="crai-profile__avatar crai-profile__avatar--lg" />
                ) : (
                  <div className="crai-profile__avatar crai-profile__avatar--lg crai-profile__avatar--placeholder" aria-hidden>
                    {mergedName.slice(0, 1).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="crai-profile__identity">
                <div className="crai-profile__identity-name">{mergedName || "—"}</div>
                <div className="crai-profile__identity-email">{email || "—"}</div>
              </div>
              <div
                className={`crai-profile__role-pill${isStudent ? " crai-profile__role-pill--student" : ""}`}
                title="Rol asignado en el sistema (solo lectura)"
              >
                {roleLabel}
              </div>
            </aside>
            <div className="crai-profile__col crai-profile__col--main">
              <dl className="crai-profile__fields-readonly">
                <div className="crai-profile__readonly-row">
                  <dt>Carrera</dt>
                  <dd>{saved.career || "—"}</dd>
                </div>
                <div className="crai-profile__readonly-row">
                  <dt>Facultad</dt>
                  <dd>{saved.faculty || "—"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : (
        <div className="crai-profile__shell crai-surface">
          <form className="crai-profile__form" onSubmit={submitEdit}>
            <div className="crai-profile__grid">
              <aside className="crai-profile__col crai-profile__col--aside">
                <div className="crai-profile__avatar-wrap crai-profile__avatar-wrap--lg">
                  {photoSrc ? (
                    <img src={photoSrc} alt="" className="crai-profile__avatar crai-profile__avatar--lg" />
                  ) : (
                    <div className="crai-profile__avatar crai-profile__avatar--lg crai-profile__avatar--placeholder" aria-hidden>
                      {avatarInitial}
                    </div>
                  )}
                </div>
                <div className="crai-profile__identity">
                  <div className="crai-profile__identity-name">{mergedName || user?.name || "—"}</div>
                  <div className="crai-profile__identity-email">{email || "—"}</div>
                </div>
                <label className="crai-profile__upload">
                  <span className="crai-primary-btn crai-profile__upload-btn">Subir foto</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
                </label>
                <div
                  className={`crai-profile__role-pill${isStudent ? " crai-profile__role-pill--student" : ""}`}
                  title="Rol asignado en el sistema (solo lectura)"
                >
                  {roleLabel}
                </div>
              </aside>

              <div className="crai-profile__col crai-profile__col--main">
                <label className="crai-profile__field">
                  <span>Nombre</span>
                  <input
                    className="crai-input"
                    value={form.displayName}
                    onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
                    placeholder={user?.name || ""}
                  />
                </label>

                <label className="crai-profile__field">
                  <span>Correo electrónico</span>
                  <input className="crai-input" value={email} disabled />
                </label>

                <label className="crai-profile__field">
                  <span>Carrera</span>
                  <input
                    className="crai-input"
                    value={form.career}
                    onChange={(e) => setForm((p) => ({ ...p, career: e.target.value }))}
                    placeholder="Ej: Ingeniería de Sistemas y Telecomunicaciones"
                  />
                </label>

                <label className="crai-profile__field">
                  <span>Facultad</span>
                  <input
                    className="crai-input"
                    value={form.faculty}
                    onChange={(e) => setForm((p) => ({ ...p, faculty: e.target.value }))}
                    placeholder="Ej: Ingeniería y Ciencias Básicas"
                  />
                </label>
              </div>
            </div>

            <div className="crai-profile__actions">
              <button type="submit" className="crai-primary-btn">
                Guardar cambios
              </button>
              <button
                type="button"
                className="crai-secondary-btn"
                onClick={() => {
                  setForm(saved);
                  setTab("view");
                  window.history.replaceState(null, "", "/perfil");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>

          <section className="crai-profile__password">
            <h2 className="crai-surface-title">Configuración</h2>
            <p className="crai-helper-inline">Contraseña y ajustes administrativos (si aplica).</p>

            <div className="crai-profile__config-grid">
              <div className="crai-profile__config-block">
                <h3 className="crai-profile__config-title">Cambio de contraseña</h3>
                <p className="crai-helper-inline">Disponible para cuentas con correo y contraseña.</p>

                <form className="crai-profile__password-form" onSubmit={submitPasswordChange}>
                  <div className="crai-profile__password-grid">
                    <label className="crai-profile__field">
                      <span>Contraseña actual</span>
                      <input
                        className="crai-input"
                        type="password"
                        value={pwForm.currentPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </label>

                    <label className="crai-profile__field">
                      <span>Nueva contraseña</span>
                      <input
                        className="crai-input"
                        type="password"
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                        placeholder="Mín. 6 caracteres"
                        autoComplete="new-password"
                      />
                    </label>

                    <label className="crai-profile__field">
                      <span>Confirmar nueva contraseña</span>
                      <input
                        className="crai-input"
                        type="password"
                        value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="Repite la nueva contraseña"
                        autoComplete="new-password"
                      />
                    </label>
                  </div>

                  {pwError ? <p className="error-text">{pwError}</p> : null}
                  {pwSuccess ? <p className="success-text">{pwSuccess}</p> : null}

                  <div className="crai-profile__password-actions">
                    <button type="submit" className="crai-primary-btn" disabled={pwLoading}>
                      {pwLoading ? "Actualizando..." : "Actualizar contraseña"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="crai-profile__config-block">
                <h3 className="crai-profile__config-title">Configuración de Rol (Administrativo)</h3>
                <p className="crai-helper-inline">Requiere clave administrativa y correo institucional.</p>

                <form className="crai-profile__role-form" onSubmit={submitRoleChange}>
                  <div className="crai-profile__role-grid">
                    <label className="crai-profile__field">
                      <span>Clave administrativa</span>
                      <input
                        className="crai-input"
                        type="password"
                        value={roleForm.adminKey}
                        onChange={(e) => setRoleForm((p) => ({ ...p, adminKey: e.target.value }))}
                        placeholder="••••"
                        autoComplete="off"
                      />
                    </label>

                    <label className="crai-profile__field">
                      <span>Rol</span>
                      <select
                        className="crai-input"
                        value={roleForm.newRole}
                        onChange={(e) => setRoleForm((p) => ({ ...p, newRole: e.target.value }))}
                      >
                        <option value="student">Estudiante</option>
                        <option value="teacher">Profesor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </label>
                  </div>

                  {roleError ? <p className="error-text">{roleError}</p> : null}
                  {roleSuccess ? <p className="success-text">{roleSuccess}</p> : null}

                  <div className="crai-profile__password-actions">
                    <button type="submit" className="crai-primary-btn" disabled={roleLoading}>
                      {roleLoading ? "Actualizando..." : "Actualizar Rol"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Profile;
