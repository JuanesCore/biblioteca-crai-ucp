import React, { useMemo, useState } from "react";

const FavoritesSection = ({ favorites, onRemoveFavorite, onClearFavorites }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = useMemo(() => (showAll ? favorites : favorites.slice(0, 4)), [favorites, showAll]);

  return (
    <section className="crai-inline-section" id="favoritos">
      <div className="crai-favorites-head">
        <div>
          <h2 className="section-header-title">⭐ Mis Favoritos ({favorites.length})</h2>
          <p className="section-header-subtitle">Recursos guardados para consulta rápida.</p>
        </div>
        <div className="crai-favorites-actions">
          <button type="button" className="crai-clear-filters-btn" onClick={() => setShowAll((v) => !v)} disabled={favorites.length <= 4}>
            {showAll ? "Ver menos" : "Ver todos"}
          </button>
          <button type="button" className="crai-clear-filters-btn" onClick={onClearFavorites} disabled={favorites.length === 0}>
            Limpiar favoritos
          </button>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="crai-empty">No has guardado recursos aún</div>
      ) : (
        <div className="crai-favorites-grid">
          {visible.map((item) => (
            <article key={item.id} className="crai-favorite-card">
              <h3>{item.title}</h3>
              <p><strong>Autor:</strong> {item.author || "-"}</p>
              <p><strong>Fecha:</strong> {item.year || "-"}</p>
              <p><strong>Tipo:</strong> {item.type || "-"}</p>
              <div className="crai-favorites-actions">
                {item.link ? (
                  <a className="crai-result-link" href={item.link} target="_blank" rel="noopener noreferrer">Abrir recurso</a>
                ) : null}
                <button type="button" className="crai-clear-filters-btn" onClick={() => onRemoveFavorite(item.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default FavoritesSection;
