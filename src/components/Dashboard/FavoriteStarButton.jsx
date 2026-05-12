import React from "react";

const FavoriteStarButton = ({ active, onToggle, titleActive, titleInactive, className = "" }) => {
  return (
    <button
      type="button"
      className={`crai-fav-star ${active ? "crai-fav-star--on" : ""} ${className}`.trim()}
      aria-pressed={active}
      title={active ? titleActive : titleInactive}
      onClick={onToggle}
    >
      <span className="crai-fav-star__glyph" aria-hidden>
        {active ? "★" : "☆"}
      </span>
      <span className="sr-only">{active ? titleActive : titleInactive}</span>
    </button>
  );
};

export default FavoriteStarButton;
