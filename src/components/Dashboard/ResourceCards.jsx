import React from "react";

const options = [
  { label: "Catálogo en línea", icon: "📚" },
  { label: "Bases de datos", icon: "🗄️" },
  { label: "Plataformas digitales", icon: "💻" },
  { label: "Repositorio institucional", icon: "🏛️" }
];

const ResourceCards = ({ onSelect }) => {
  return (
    <section className="crai-options-row" aria-label="Opciones del portal">
      <div className="crai-options-inner crai-options-inner--four">
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            className="crai-option-card"
            onClick={() => onSelect(opt.label)}
            aria-label={opt.label}
          >
            <span className="crai-option-icon" aria-hidden>
              {opt.icon}
            </span>
            <span className="crai-option-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ResourceCards;
