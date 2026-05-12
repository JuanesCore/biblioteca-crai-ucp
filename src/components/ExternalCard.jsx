import React from "react";

const ExternalCard = ({ title, description, icon, href }) => {
  const openExternal = () => {
    window.open(href, "_blank");
  };

  return (
    <article className="external-card">
      <div className="external-card-icon" aria-hidden>
        {icon}
      </div>
      <h3 className="external-card-title">{title}</h3>
      <p className="external-card-description">{description}</p>
      <button type="button" className="external-card-action" onClick={openExternal}>
        Ir al servicio
      </button>
    </article>
  );
};

export default ExternalCard;

