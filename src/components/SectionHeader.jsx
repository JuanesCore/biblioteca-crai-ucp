import React from "react";

const SectionHeader = ({ title, subtitle }) => {
  return (
    <header className="section-header">
      <h2 className="section-header-title">{title}</h2>
      {subtitle ? <p className="section-header-subtitle">{subtitle}</p> : null}
    </header>
  );
};

export default SectionHeader;

