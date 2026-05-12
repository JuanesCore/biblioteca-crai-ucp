import React from "react";
import heroImg from "../imagen/general-3.jpg";
import SearchBar from "./SearchBar";
import RecentSearches from "./RecentSearches";

const HeroSection = ({
  filters,
  onFilterChange,
  onSearch,
  loading,
  summonLang,
  onSummonLangChange,
  userEmail,
  onPickRecentSearch,
  recentTick
}) => {
  return (
    <section className="crai-hero" style={{ backgroundImage: `url(${heroImg})` }}>
      <div className="crai-hero-overlay" />
      <div className="crai-hero-inner">
        <div className="crai-hero-copy">
          <h1 className="crai-hero-title">¿Qué deseas aprender hoy?</h1>
          <p className="crai-hero-subtitle">Explora documentos académicos y organiza tus favoritos.</p>
        </div>

        <div className="crai-hero-search">
          <SearchBar
            value={filters.title}
            onChange={onFilterChange}
            onSearch={onSearch}
            loading={loading}
            placeholder="Buscar por título, autor o palabras clave..."
          />
          <RecentSearches
            userEmail={userEmail}
            recentTick={recentTick}
            onPickSearch={onPickRecentSearch}
          />
          <div className="crai-hero-lang">
            <label className="crai-hero-lang-label" htmlFor="summon-lang">
              Idioma Summon
            </label>
            <select
              id="summon-lang"
              className="crai-input crai-hero-lang-select"
              value={summonLang}
              onChange={onSummonLangChange}
              aria-label="Idioma de resultados Summon"
            >
              <option value="es-ES">Español (es-ES)</option>
              <option value="en-US">English (en-US)</option>
              <option value="general">General (sin filtro de idioma)</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

