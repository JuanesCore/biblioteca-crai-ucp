import React, { useEffect, useState } from "react";
import { buildSummonQueryFromFilters } from "../../services/summonApi";
import { clearRecentSearches, loadRecentSearches } from "../../utils/recentSearches";

const RecentSearches = ({ userEmail, onPickSearch, recentTick = 0 }) => {
  const [items, setItems] = useState(() => loadRecentSearches(userEmail));

  useEffect(() => {
    setItems(loadRecentSearches(userEmail));
  }, [userEmail, recentTick]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === `recent_searches_${userEmail}`) {
        setItems(loadRecentSearches(userEmail));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userEmail]);

  if (!userEmail || items.length === 0) return null;

  return (
    <div className="crai-recent" aria-label="Búsquedas recientes">
      <div className="crai-recent__head">
        <span className="crai-recent__title">Búsquedas recientes</span>
        <button
          type="button"
          className="crai-recent__clear"
          onClick={() => {
            clearRecentSearches(userEmail);
            setItems([]);
          }}
        >
          Borrar historial
        </button>
      </div>
      <div className="crai-recent__chips">
        {items.map((snap, idx) => {
          const label = buildSummonQueryFromFilters(snap) || "(vacía)";
          return (
            <button
              type="button"
              key={`${label}-${idx}`}
              className="crai-recent__chip"
              onClick={() => onPickSearch(snap)}
            >
              {label.length > 48 ? `${label.slice(0, 48)}…` : label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecentSearches;
