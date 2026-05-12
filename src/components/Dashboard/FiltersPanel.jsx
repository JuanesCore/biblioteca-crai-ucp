import React, { useMemo } from "react";

const FIELD_META = [
  { key: "title", label: "Búsqueda", short: "Buscar" },
  { key: "type", label: "Tipo de documento", short: "Tipo" },
  { key: "year", label: "Año", short: "Año" },
  { key: "author", label: "Autor", short: "Autor" },
  { key: "keyword", label: "Palabras clave", short: "Keywords" }
];

const FiltersPanel = ({
  filters,
  onFilterChange,
  onApply,
  onClear,
  onRemoveField,
  loading,
  hemerotecaSlot
}) => {
  const activeFields = useMemo(() => {
    return FIELD_META.filter(({ key }) => {
      const v = filters[key];
      if (v === undefined || v === null) return false;
      return String(v).trim() !== "";
    });
  }, [filters]);

  const activeCount = activeFields.length;

  const handleSubmit = (event) => {
    event.preventDefault();
    onApply(event);
  };

  return (
    <>
      <div className="crai-surface crai-filters-panel">
        <div className="crai-filters-panel__head">
          <h3 className="crai-surface-title">Filtros</h3>
          {activeCount > 0 ? (
            <span className="crai-filter-count" aria-live="polite">
              {activeCount} activo{activeCount !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="crai-filter-count crai-filter-count--muted">Ninguno</span>
          )}
        </div>

        {activeCount > 0 ? (
          <div className="crai-filter-chips" aria-label="Filtros activos">
            {activeFields.map(({ key, label, short }) => (
              <span key={key} className="crai-filter-chip">
                <span className="crai-filter-chip__text">
                  <span className="crai-filter-chip__k">{short}</span>
                  <span className="crai-filter-chip__v">{String(filters[key]).trim()}</span>
                </span>
                <button
                  type="button"
                  className="crai-filter-chip__x"
                  aria-label={`Quitar filtro ${label}`}
                  onClick={() => onRemoveField(key)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <form className="crai-filters-form" onSubmit={handleSubmit}>
          <div className="crai-filter-row">
            <label className="crai-label" htmlFor="filter-type">
              Tipo de documento
            </label>
            <input
              id="filter-type"
              name="type"
              value={filters.type}
              onChange={onFilterChange}
              placeholder="Ej: libro, artículo, tesis…"
              className="crai-input crai-input--filter"
              autoComplete="off"
            />
          </div>

          <div className="crai-filter-row">
            <label className="crai-label" htmlFor="filter-year">
              Año
            </label>
            <input
              id="filter-year"
              name="year"
              value={filters.year}
              onChange={onFilterChange}
              placeholder="AAAA"
              type="number"
              min="1500"
              max="2100"
              className="crai-input crai-input--filter"
            />
          </div>

          <div className="crai-filters-actions">
            <button type="submit" className="crai-apply-btn crai-apply-btn--primary" disabled={loading}>
              {loading ? (
                <span className="crai-btn-loading">
                  <span className="crai-btn-spinner" aria-hidden />
                  Aplicando…
                </span>
              ) : (
                "Aplicar filtros"
              )}
            </button>
            <button
              type="button"
              className="crai-clear-filters-btn"
              onClick={onClear}
              disabled={activeCount === 0}
            >
              Limpiar filtros
            </button>
          </div>

          <details className="crai-advanced">
            <summary>Filtros avanzados</summary>

            <div className="crai-filter-row">
              <label className="crai-label" htmlFor="filter-author">
                Autor
              </label>
              <input
                id="filter-author"
                name="author"
                value={filters.author}
                onChange={onFilterChange}
                placeholder="Ej: García, Pérez…"
                className="crai-input crai-input--filter"
                autoComplete="off"
              />
            </div>

            <div className="crai-filter-row">
              <label className="crai-label" htmlFor="filter-keyword">
                Palabras clave
              </label>
              <input
                id="filter-keyword"
                name="keyword"
                value={filters.keyword}
                onChange={onFilterChange}
                placeholder="Ej: sostenibilidad, IA…"
                className="crai-input crai-input--filter"
                autoComplete="off"
              />
            </div>
          </details>
        </form>
      </div>

      {hemerotecaSlot}
    </>
  );
};

export default FiltersPanel;
