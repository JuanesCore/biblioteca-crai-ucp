import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { tutoriasData } from "../../data/tutoriasData";

const EMPTY = { faculty: "", program: "", subject: "", mode: "", shift: "" };

const TutoriasSection = () => {
  const [filters, setFilters] = useState(EMPTY);

  const programOptions = useMemo(() => {
    const base = filters.faculty ? tutoriasData.filter((t) => t.faculty === filters.faculty) : tutoriasData;
    return [...new Set(base.map((t) => t.program))].sort();
  }, [filters.faculty]);

  const subjectOptions = useMemo(() => {
    let base = tutoriasData;
    if (filters.faculty) base = base.filter((t) => t.faculty === filters.faculty);
    if (filters.program) base = base.filter((t) => t.program === filters.program);
    return [...new Set(base.map((t) => t.subject))].sort();
  }, [filters.faculty, filters.program]);

  const rows = useMemo(() => {
    return tutoriasData.filter(
      (t) =>
        (!filters.faculty || t.faculty === filters.faculty) &&
        (!filters.program || t.program === filters.program) &&
        (!filters.subject || t.subject === filters.subject) &&
        (!filters.mode || t.mode === filters.mode) &&
        (!filters.shift || t.shift === filters.shift)
    );
  }, [filters]);

  const set = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "faculty") {
        next.program = "";
        next.subject = "";
      }
      if (key === "program") {
        next.subject = "";
      }
      return next;
    });
  };

  const badgeClass = (mode) => {
    const m = String(mode || "").toLowerCase();
    if (m.includes("híbr") || m.includes("hibr")) return "tutoria-badge--hibrida";
    if (m.includes("virtual")) return "tutoria-badge--virtual";
    return "tutoria-badge--presencial";
  };

  return (
    <section className="crai-inline-section crai-tutorias-page">
      <div className="crai-tutorias-page__head">
        <div>
          <h2 className="section-header-title">Tutorías CRAI</h2>
          <p className="section-header-subtitle">
            Acompañamiento por facultad, programa y materia (oferta académica UCP).
          </p>
        </div>
        <Link to="/" className="crai-profile__back">
          Volver al buscador
        </Link>
      </div>

      <div className="tutoria-toolbar tutoria-toolbar--five">
        <select className="crai-input" value={filters.faculty} onChange={(e) => set("faculty", e.target.value)}>
          <option value="">Facultad</option>
          {[...new Set(tutoriasData.map((t) => t.faculty))].sort().map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select className="crai-input" value={filters.program} onChange={(e) => set("program", e.target.value)}>
          <option value="">Programa</option>
          {programOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select className="crai-input" value={filters.subject} onChange={(e) => set("subject", e.target.value)}>
          <option value="">Materia</option>
          {subjectOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select className="crai-input" value={filters.mode} onChange={(e) => set("mode", e.target.value)}>
          <option value="">Modalidad</option>
          {[...new Set(tutoriasData.map((t) => t.mode))].sort().map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select className="crai-input" value={filters.shift} onChange={(e) => set("shift", e.target.value)}>
          <option value="">Jornada</option>
          {[...new Set(tutoriasData.map((t) => t.shift))].sort().map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="tutoria-grid">
        {rows.map((item) => (
          <article key={item.id} className="tutoria-card">
            <h3>{item.subject}</h3>
            <p>
              <strong>Tutor:</strong> {item.tutor}
            </p>
            <p>
              <strong>Facultad:</strong> {item.faculty}
            </p>
            <p>
              <strong>Programa:</strong> {item.program}
            </p>
            <p>
              <strong>Jornada / horario:</strong> {item.shift} · {item.time}
            </p>
            <p>
              <strong>Cupos:</strong> {item.seats}
            </p>
            <span className={`tutoria-badge ${badgeClass(item.mode)}`}>{item.mode}</span>
            <div className="crai-favorites-actions">
              <button type="button" className="crai-apply-btn">
                Reservar
              </button>
              <button type="button" className="crai-clear-filters-btn">
                Ver detalle
              </button>
            </div>
          </article>
        ))}
      </div>
      {rows.length === 0 ? <div className="crai-empty">No hay tutorías con estos filtros.</div> : null}
    </section>
  );
};

export default TutoriasSection;
