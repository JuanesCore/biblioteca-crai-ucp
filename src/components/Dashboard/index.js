import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { api } from "../../services/api";
import {
  buildSummonQueryFromFilters,
  loadSummonFavoriteIds,
  searchSummon,
  toggleSummonFavoriteInStorage
} from "../../services/summonApi";
import { LINKS } from "../../config/externalLinks";
import { getArticles, getDatabases } from "../../services/externalApi";
import logoUcp from "../imagen/logo-ucp.png";
import hemerotecaImg from "../imagen/hemeroteca-2.jpg";
import ExternalCard from "../ExternalCard";
import SectionHeader from "../SectionHeader";
import HeroSection from "./HeroSection";
import ResourceCards from "./ResourceCards";
import FiltersPanel from "./FiltersPanel";
import FavoriteStarButton from "./FavoriteStarButton";
import FavoritesSection from "./FavoritesSection";
import TutoriasSection from "./TutoriasSection";
import Footer from "./Footer";
import Profile from "../Profile";
import Analytics from "../Admin/Analytics";
import { saveRecentSearch } from "../../utils/recentSearches";
import { cleanDisplayText } from "../../utils/cleanDisplayText";

const defaultFilters = { title: "", author: "", keyword: "", type: "", year: "" };

const pushSearchLog = (entry) => {
  try {
    const raw = localStorage.getItem("search_logs");
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    const next = [entry, ...list].slice(0, 500);
    localStorage.setItem("search_logs", JSON.stringify(next));
  } catch {
    // ignore
  }
};

const Dashboard = ({ user, setAuth }) => {
  const location = useLocation();
  const isProfileRoute = location.pathname === "/perfil";
  const [filters, setFilters] = useState(defaultFilters);
  const [documents, setDocuments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [externalLoading, setExternalLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [navSolid, setNavSolid] = useState(false);
  const [activeResource, setActiveResource] = useState("");
  const [externalDatabases, setExternalDatabases] = useState([]);
  const [externalArticles, setExternalArticles] = useState([]);
  const [recentTick, setRecentTick] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [summonLang, setSummonLang] = useState("es-ES");
  const [summonPage, setSummonPage] = useState(1);
  const [summonResults, setSummonResults] = useState([]);
  const [summonMeta, setSummonMeta] = useState({
    totalPages: 0,
    page: 1,
    pageSize: 10,
    totalRecords: 0
  });
  const [summonPagingLoading, setSummonPagingLoading] = useState(false);
  const [, setSummonFavoriteIds] = useState(() => loadSummonFavoriteIds());
  const [localFavorites, setLocalFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("favorites_ucp");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [newDocument, setNewDocument] = useState({
    title: "",
    author: "",
    keywords: "",
    abstract: "",
    year: "",
    type: ""
  });

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item._id)), [favorites]);
  const localFavoriteIds = useMemo(() => new Set(localFavorites.map((f) => f.id)), [localFavorites]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setAuth({ checking: false, user: null });
  };

  const loadFavorites = async () => {
    const response = await api.getFavorites();
    setFavorites(response.favorites || []);
  };

  const runSearch = async (event, options = {}) => {
    if (event) event.preventDefault();
    const resetSummon = options.resetSummonPage !== false;
    const f = options.filtersOverride != null ? options.filtersOverride : filters;
    const pageForSummon = resetSummon ? 1 : summonPage;
    if (resetSummon) {
      setSummonPage(1);
    }

    setLoading(true);
    setMessage("");
    try {
      const q = buildSummonQueryFromFilters(f);
      const internalPromise = api.searchDocuments(f);
      const summonPromise = q
        ? searchSummon(q, pageForSummon, summonLang)
        : Promise.resolve({
            results: [],
            totalPages: 0,
            page: 1,
            pageSize: 10,
            totalRecords: 0
          });

      const [response, summonData] = await Promise.all([internalPromise, summonPromise]);

      setDocuments(response.results || []);
      if (!q) {
        setSummonResults([]);
        setSummonMeta({ totalPages: 0, page: 1, pageSize: 10, totalRecords: 0 });
      } else {
        setSummonResults(summonData.results || []);
        setSummonMeta({
          totalPages: summonData.totalPages,
          page: summonData.page,
          pageSize: summonData.pageSize,
          totalRecords: summonData.totalRecords
        });
      }

      const internalCount = (response.results || []).length;
      const summonCount = q ? (summonData.results || []).length : 0;
      if (internalCount === 0 && summonCount === 0 && q) {
        setMessage("No se encontraron resultados con estos criterios.");
      } else if (internalCount === 0 && !q) {
        setMessage("No documents found with these filters.");
      }

      if (q && user?.email) {
        saveRecentSearch(user.email, f);
        setRecentTick((t) => t + 1);
      }

      pushSearchLog({
        day: new Date().toISOString().slice(0, 10),
        email: user?.email || "",
        type: f?.type || "",
        title: f?.title || "",
        author: f?.author || "",
        keyword: f?.keyword || "",
        year: f?.year || ""
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummonPage = async (nextPage) => {
    const q = buildSummonQueryFromFilters(filters);
    if (!q) return;
    const safePage = Math.min(Math.max(1, nextPage), summonMeta.totalPages || 1);
    setSummonPagingLoading(true);
    setMessage("");
    try {
      const summonData = await searchSummon(q, safePage, summonLang);
      setSummonPage(safePage);
      setSummonResults(summonData.results || []);
      setSummonMeta({
        totalPages: summonData.totalPages,
        page: summonData.page,
        pageSize: summonData.pageSize,
        totalRecords: summonData.totalRecords
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSummonPagingLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    runSearch(null, { filtersOverride: defaultFilters });
  };

  const handleRemoveFilterField = (key) => {
    const next = { ...filters, [key]: defaultFilters[key] ?? "" };
    setFilters(next);
    runSearch(null, { filtersOverride: next });
  };

  const onSummonLangChange = (event) => {
    const value = event.target.value;
    setSummonLang(value);
    const q = buildSummonQueryFromFilters(filters);
    if (!q) return;
    setSummonPagingLoading(true);
    setMessage("");
    setSummonPage(1);
    searchSummon(q, 1, value)
      .then((summonData) => {
        setSummonResults(summonData.results || []);
        setSummonMeta({
          totalPages: summonData.totalPages,
          page: summonData.page,
          pageSize: summonData.pageSize,
          totalRecords: summonData.totalRecords
        });
      })
      .catch((error) => setMessage(error.message))
      .finally(() => setSummonPagingLoading(false));
  };

  useEffect(() => {
    const onScroll = () => {
      setNavSolid(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocMouseDown = (event) => {
      if (!profileMenuRef.current || profileMenuRef.current.contains(event.target)) return;
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites_ucp", JSON.stringify(localFavorites));
  }, [localFavorites]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await Promise.all([runSearch(), loadFavorites()]);
      } catch (_error) {
        setMessage("Could not load dashboard data.");
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadExternalSources = async () => {
      setExternalLoading(true);
      try {
        const [databases, articles] = await Promise.all([getDatabases(), getArticles()]);
        setExternalDatabases(databases);
        setExternalArticles(articles);
      } finally {
        setExternalLoading(false);
      }
    };

    loadExternalSources();
  }, []);

  const toggleFavorite = async (doc) => {
    const favoriteEntry = {
      id: doc?.summonId || doc?._id || doc?.id || `${doc?.title || "doc"}-${doc?.year || "na"}`,
      title: doc?.title || "Sin título",
      author: doc?.author || "-",
      year: doc?.year || "-",
      type: doc?.type || "-",
      link: doc?.link || ""
    };
    if (favoriteEntry.id) {
      setLocalFavorites((prev) =>
        prev.some((f) => f.id === favoriteEntry.id) ? prev.filter((f) => f.id !== favoriteEntry.id) : [favoriteEntry, ...prev]
      );
    }

    if (doc && doc._source === "summon") {
      try {
        setSummonFavoriteIds(toggleSummonFavoriteInStorage(doc));
      } catch (error) {
        setMessage(error.message);
      }
      return;
    }

    const documentId = doc && doc._id;
    if (!documentId) return;

    try {
      if (favoriteIds.has(documentId)) {
        await api.removeFavorite(documentId);
      } else {
        await api.addFavorite(documentId);
      }
      await loadFavorites();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const onFilterChange = (event) => {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onNewDocumentChange = (event) => {
    setNewDocument((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const openExternal = (url) => {
    window.open(url, "_blank");
  };

  const onResourceSelect = (resourceLabel) => {
    setActiveResource(resourceLabel);
    if (resourceLabel === "Catálogo en línea") {
      openExternal(LINKS.catalogo);
      return;
    }
    if (resourceLabel === "Repositorio institucional") {
      openExternal(LINKS.repositorio);
    }
  };

  const onPickRecentSearch = (snap) => {
    const next = { ...defaultFilters, ...snap };
    setFilters(next);
    runSearch(null, { filtersOverride: next });
  };

  const submitNewDocument = async (event) => {
    event.preventDefault();
    try {
      await api.createDocument({
        ...newDocument,
        year: Number(newDocument.year),
        keywords: newDocument.keywords.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setNewDocument({ title: "", author: "", keywords: "", abstract: "", year: "", type: "" });
      await runSearch();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const navLinkClass = ({ isActive }) => `crai-nav-link${isActive ? " is-active" : ""}`;

  return (
    <div className="crai-page">
      <header
        className={`crai-navbar ${navSolid ? "crai-navbar--solid" : ""}${
          isProfileRoute ? " crai-navbar--profile-route" : ""
        }`}
      >
        <div className="crai-navbar-inner">
          <Link to="/" className="crai-brand crai-brand--link">
            <img src={logoUcp} alt="Universidad Católica de Pereira" className="crai-brand-logo" />
            <div className="crai-brand-text">
              <div className="crai-brand-title">Biblioteca CRAI</div>
              <div className="crai-brand-subtitle">Buscador web académico · UCP</div>
            </div>
          </Link>

          <nav className="crai-navbar-nav" aria-label="Principal">
            <NavLink to="/" end className={navLinkClass}>
              Inicio
            </NavLink>
            <NavLink to="/tutorias" className={navLinkClass}>
              Tutorías
            </NavLink>
            <Link to="/#favoritos" className="crai-nav-link">
              Mis favoritos
            </Link>
            {user?.role === "admin" ? (
              <NavLink to="/admin/analytics" className={navLinkClass}>
                Analítica
              </NavLink>
            ) : null}
          </nav>

          <div className="crai-navbar-actions">
            <div className="crai-profile-menu" ref={profileMenuRef}>
              <button
                type="button"
                className="crai-profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <span className="crai-profile-trigger-name">{user.name}</span>
                <span className="crai-profile-trigger-role">{user.role}</span>
                <span className="crai-profile-caret" aria-hidden>
                  ▾
                </span>
              </button>
              {profileOpen ? (
                <div className="crai-profile-dropdown" role="menu">
                  <Link to="/perfil" role="menuitem" className="crai-profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                    Ver perfil
                  </Link>
                  <Link
                    to="/perfil#edit"
                    role="menuitem"
                    className="crai-profile-dropdown-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    Editar información · foto · carrera
                  </Link>
                </div>
              ) : null}
            </div>
            <button className="crai-logout-btn" type="button" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection
                filters={filters}
                onFilterChange={onFilterChange}
                onSearch={runSearch}
                loading={loading}
                summonLang={summonLang}
                onSummonLangChange={onSummonLangChange}
                userEmail={user.email}
                onPickRecentSearch={onPickRecentSearch}
                recentTick={recentTick}
              />
              <ResourceCards onSelect={onResourceSelect} />

              <main className="crai-content crai-content--animate">
        {activeResource === "Plataformas digitales" && (
          <section className="crai-inline-section">
            <SectionHeader
              title="Plataformas digitales UCP"
              subtitle="Accede a los entornos de apoyo academico institucional."
            />
            <div className="external-card-grid">
              <ExternalCard title="Moodle" description="Campus virtual para cursos y contenidos." icon="🧑‍🏫" href={LINKS.plataformas.moodle} />
              <ExternalCard
                title="Biblioteca virtual"
                description="Colecciones digitales y servicios bibliotecarios."
                icon="📖"
                href={LINKS.plataformas.bibliotecaVirtual}
              />
              <ExternalCard title="E-books" description="Lectura y consulta de libros electronicos." icon="📘" href={LINKS.plataformas.ebooks} />
            </div>
          </section>
        )}

        {activeResource === "Bases de datos" && (
          <section className="crai-inline-section">
            <SectionHeader
              title="Bases de datos academicas"
              subtitle="Integracion preparada para CRAI. Actualmente se muestran datos simulados."
            />
            {externalLoading ? (
              <div className="crai-message">Cargando servicios externos...</div>
            ) : (
              <div className="crai-database-list">
                {externalDatabases.map((db) => (
                  <article key={db.id} className="crai-database-card">
                    <h3>{db.name}</h3>
                    <p>{db.description}</p>
                  </article>
                ))}
                {externalArticles.length > 0 && (
                  <p className="crai-helper-inline">Vista previa de articulos disponibles: {externalArticles.length}</p>
                )}
              </div>
            )}
          </section>
        )}

        {activeResource === "Repositorio institucional" && (
          <section className="crai-inline-section">
            <SectionHeader
              title="Repositorio institucional"
              subtitle="Abre el repositorio oficial o continua con la busqueda interna."
            />
            <div className="repo-actions">
              <button type="button" className="crai-primary-btn" onClick={() => openExternal(LINKS.repositorio)}>
                Abrir repositorio UCP
              </button>
              <button type="button" className="crai-apply-btn" onClick={() => setActiveResource("")}>
                Ver documentos internos
              </button>
            </div>
          </section>
        )}

        <div className="crai-layout">
          <aside className="crai-filters">
            <FiltersPanel
              filters={filters}
              onFilterChange={onFilterChange}
              onApply={runSearch}
              onClear={handleClearFilters}
              onRemoveField={handleRemoveFilterField}
              loading={loading}
              hemerotecaSlot={
                <div className="crai-spotlight" aria-label="Hemeroteca">
                  <div className="crai-spotlight-inner">
                    <img className="crai-spotlight-img" src={hemerotecaImg} alt="Hemeroteca" />
                    <div className="crai-spotlight-text">
                      <div className="crai-spotlight-title">Hemeroteca</div>
                      <div className="crai-spotlight-desc">
                        Recursos académicos para fortalecer tu investigación.
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </aside>

          <section className="crai-results">
            <div className="crai-results-head">
              <div>
                <h2 className="crai-results-title">Resultados de búsqueda</h2>
                <p className="crai-results-subtitle">
                  {buildSummonQueryFromFilters(filters)
                    ? `${summonResults.length} en Summon (pág. ${summonMeta.page} de ${summonMeta.totalPages || 1}) · `
                    : ""}
                  {documents.length} en catálogo institucional
                </p>
              </div>
            </div>

            {message ? (
              <div className="crai-message" role="status">
                {message}
              </div>
            ) : null}

            {(loading || summonPagingLoading) && (
              <div className="crai-results-loading" role="status" aria-live="polite">
                <span className="crai-spinner" aria-hidden />
                <span>{loading ? "Buscando en biblioteca e institucional..." : "Cargando página..."}</span>
              </div>
            )}

            <div className="crai-results-list">
              {buildSummonQueryFromFilters(filters) ? (
                <>
                  <h3 className="crai-results-section-title">Biblioteca UCP (Summon)</h3>
                  {summonResults.length === 0 && !loading && !summonPagingLoading ? (
                    <div className="crai-empty crai-empty--inline">
                      Sin resultados en Summon para esta consulta.
                    </div>
                  ) : null}
                  {summonResults.map((doc) => {
                    const isFavorite = localFavoriteIds.has(doc.summonId);
                    const keywords = Array.isArray(doc.keywords) ? doc.keywords : [];
                    return (
                      <article className="crai-result-card crai-result-card--summon" key={`summon-${doc.summonId}`}>
                        <div className="crai-result-top">
                          <div className="crai-result-main">
                            <div className="crai-result-kicker">
                              <span className="crai-result-crest">Summon · UCP</span>
                            </div>
                            <div className="crai-result-pills">
                              <span className="crai-doc-badge">{doc.type || "Documento"}</span>
                              <span className="crai-date-pill">{doc.year || "—"}</span>
                            </div>
                            <h3 className="crai-result-title">
                              {doc.link ? (
                                <a href={doc.link} target="_blank" rel="noopener noreferrer">
                                  {cleanDisplayText(doc.title)}
                                </a>
                              ) : (
                                cleanDisplayText(doc.title)
                              )}
                            </h3>
                          </div>
                          <FavoriteStarButton
                            active={isFavorite}
                            onToggle={() => toggleFavorite(doc)}
                            titleActive="Quitar de favoritos locales"
                            titleInactive="Guardar en favoritos locales"
                          />
                        </div>

                        <div className="crai-result-meta crai-result-meta--author">
                          <span>
                            <strong>Autor:</strong> {doc.author || "-"}
                          </span>
                        </div>

                        <p className="crai-result-abstract">
                          {doc.abstract ? (
                            cleanDisplayText(doc.abstract)
                          ) : (
                            <span className="crai-abstract-muted">
                              Sin resumen en catálogo. Puedes abrir el recurso si hay enlace disponible.
                            </span>
                          )}
                        </p>

                        <p className="crai-result-link-wrap">
                          {doc.link ? (
                            <a className="crai-result-link" href={doc.link} target="_blank" rel="noopener noreferrer">
                              Ver recurso / texto completo
                            </a>
                          ) : (
                            <button
                              type="button"
                              className="crai-result-link crai-result-link--disabled"
                              disabled
                              title="Recurso no disponible directamente"
                            >
                              Recurso no disponible directamente
                            </button>
                          )}
                        </p>

                        {keywords.length > 0 ? (
                          <div className="crai-keywords" aria-label="Disciplinas">
                            {keywords.slice(0, 6).map((k) => (
                              <span className="crai-keyword-chip" key={k}>
                                {cleanDisplayText(k)}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                  {summonMeta.totalPages > 1 ? (
                    <div className="crai-summon-pager">
                      <button
                        type="button"
                        className="crai-pager-btn"
                        disabled={summonMeta.page <= 1 || summonPagingLoading}
                        onClick={() => fetchSummonPage(summonMeta.page - 1)}
                      >
                        Anterior
                      </button>
                      <span className="crai-pager-status">
                        Página {summonMeta.page} de {summonMeta.totalPages}
                        {summonMeta.totalRecords ? ` · ${summonMeta.totalRecords.toLocaleString("es-CO")} registros` : ""}
                      </span>
                      <button
                        type="button"
                        className="crai-pager-btn"
                        disabled={summonMeta.page >= summonMeta.totalPages || summonPagingLoading}
                        onClick={() => fetchSummonPage(summonMeta.page + 1)}
                      >
                        Siguiente
                      </button>
                    </div>
                  ) : null}
                  <h3 className="crai-results-section-title">Catálogo institucional</h3>
                </>
              ) : null}

              {documents.length > 0 ? (
                documents.map((doc) => {
                  const isFavorite = localFavoriteIds.has(doc._id) || favoriteIds.has(doc._id);
                  const keywords = Array.isArray(doc.keywords)
                    ? doc.keywords
                    : typeof doc.keywords === "string"
                      ? doc.keywords.split(",").map((s) => s.trim()).filter(Boolean)
                      : [];

                  return (
                    <article className="crai-result-card crai-result-card--internal" key={doc._id}>
                      <div className="crai-result-top">
                        <div className="crai-result-main">
                          <div className="crai-result-kicker">
                            {buildSummonQueryFromFilters(filters) ? (
                              <span className="crai-result-crest">Catálogo institucional</span>
                            ) : (
                              <span className="crai-result-crest">UCP · CRAI</span>
                            )}
                          </div>
                          <div className="crai-result-pills">
                            <span className="crai-doc-badge">{doc.type || "Documento"}</span>
                            <span className="crai-date-pill">{doc.year ?? "—"}</span>
                          </div>
                          <h3 className="crai-result-title">{cleanDisplayText(doc.title)}</h3>
                        </div>
                        <FavoriteStarButton
                          active={isFavorite}
                          onToggle={() => toggleFavorite(doc)}
                          titleActive="Quitar de favoritos"
                          titleInactive="Agregar a favoritos"
                        />
                      </div>

                      <div className="crai-result-meta crai-result-meta--author">
                        <span>
                          <strong>Autor:</strong> {doc.author || "-"}
                        </span>
                      </div>

                      <p className="crai-result-abstract">
                        {doc.abstract ? cleanDisplayText(doc.abstract) : "No hay resumen disponible."}
                      </p>

                      {keywords.length > 0 ? (
                        <div className="crai-keywords" aria-label="Keywords">
                          {keywords.slice(0, 6).map((k) => (
                            <span className="crai-keyword-chip" key={k}>
                              {cleanDisplayText(String(k))}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <div className="crai-empty">
                  {buildSummonQueryFromFilters(filters)
                    ? "Sin coincidencias en el catálogo institucional para esta búsqueda."
                    : "Aún no hay resultados. Prueba ajustando los filtros."}
                </div>
              )}
            </div>
          </section>
        </div>

        <FavoritesSection
          favorites={localFavorites}
          onRemoveFavorite={(id) => setLocalFavorites((prev) => prev.filter((item) => item.id !== id))}
          onClearFavorites={() => setLocalFavorites([])}
        />

        {(user.role === "admin" || user.role === "teacher") && (
          <section className="crai-admin">
            <div className="crai-admin-head">
              <h2 className="crai-admin-title">Publicar documento</h2>
              <p className="crai-admin-subtitle">
                Añade nuevas referencias para enriquecer la búsqueda institucional.
              </p>
            </div>

            <div className="crai-surface">
              <h3 className="crai-surface-title">Crear documento</h3>
              <form className="crai-admin-form" onSubmit={submitNewDocument}>
                <div className="crai-form-grid">
                  <input
                    name="title"
                    value={newDocument.title}
                    onChange={onNewDocumentChange}
                    placeholder="Título"
                    required
                    className="crai-input"
                  />
                  <input
                    name="author"
                    value={newDocument.author}
                    onChange={onNewDocumentChange}
                    placeholder="Autor(es)"
                    required
                    className="crai-input"
                  />
                  <input
                    name="keywords"
                    value={newDocument.keywords}
                    onChange={onNewDocumentChange}
                    placeholder="Keywords (separadas por coma)"
                    className="crai-input"
                  />
                  <input
                    name="type"
                    value={newDocument.type}
                    onChange={onNewDocumentChange}
                    placeholder="Tipo de documento"
                    required
                    className="crai-input"
                  />
                  <input
                    name="year"
                    value={newDocument.year}
                    onChange={onNewDocumentChange}
                    placeholder="Año"
                    type="number"
                    required
                    className="crai-input"
                  />
                </div>

                <textarea
                  name="abstract"
                  value={newDocument.abstract}
                  onChange={onNewDocumentChange}
                  placeholder="Resumen"
                  rows={4}
                  className="crai-textarea"
                />

                <div className="crai-admin-actions">
                  <button type="submit" className="crai-primary-btn">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

              </main>
            </>
          }
        />
        <Route
          path="/tutorias"
          element={
            <main className="crai-content crai-content--animate">
              <TutoriasSection />
            </main>
          }
        />
        <Route
          path="/perfil"
          element={
            <main className="crai-content crai-content--animate crai-content--profile">
              <Profile user={user} setAuth={setAuth} />
            </main>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <main className="crai-content crai-content--animate">
              <Analytics user={user} />
            </main>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
};

export default Dashboard;