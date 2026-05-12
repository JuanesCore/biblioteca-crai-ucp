import React from "react";
import { LINKS } from "../../config/externalLinks";

const SocialLink = ({ href, label, icon }) => (
  <a className="crai-social-link" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
    <span className="crai-social-icon" aria-hidden>
      {icon}
    </span>
    <span className="crai-social-text">{label}</span>
  </a>
);

const Footer = () => {
  return (
    <footer className="crai-footer">
      <div className="crai-footer-inner">
        <div className="crai-footer-col">
          <h3 className="crai-footer-heading">Biblioteca CRAI · UCP</h3>
          <p className="crai-footer-text">
            Centro de Recursos para el Aprendizaje y la Investigación — Universidad Católica de Pereira.
          </p>
        </div>
        <div className="crai-footer-col">
          <h3 className="crai-footer-heading">Contacto</h3>
          <ul className="crai-footer-list">
            <li>
              <strong>Teléfono:</strong>{" "}
              <a href="tel:+576321234567">+57 (6) 321 234 567</a>
            </li>
            <li>
              <strong>Dirección:</strong> Carrera 23 No. 10-70, Pereira, Risaralda
            </li>
            <li>
              <strong>Correo biblioteca:</strong>{" "}
              <a href="mailto:biblioteca@ucp.edu.co">biblioteca@ucp.edu.co</a>
            </li>
          </ul>
        </div>
        <div className="crai-footer-col">
          <h3 className="crai-footer-heading">Institucional</h3>
          <ul className="crai-footer-list">
            <li>
              <a href="https://www.ucp.edu.co/" target="_blank" rel="noopener noreferrer">
                Universidad Católica de Pereira
              </a>
            </li>
            <li>
              <a href="https://biblioteca.ucp.edu.co/" target="_blank" rel="noopener noreferrer">
                Biblioteca UCP
              </a>
            </li>
            <li>
              <a href="https://repositorio.ucp.edu.co/" target="_blank" rel="noopener noreferrer">
                Repositorio institucional
              </a>
            </li>
          </ul>
        </div>
        <div className="crai-footer-col">
          <h3 className="crai-footer-heading">Redes sociales</h3>
          <ul className="crai-footer-list crai-footer-social">
            <li>
              <SocialLink
                href={LINKS.social.facebook}
                label="Facebook"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H16.7V4.8c-.3 0-1.4-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V11H6.7v3h2.5v8h4.3z" />
                  </svg>
                }
              />
            </li>
            <li>
              <SocialLink
                href={LINKS.social.instagram}
                label="Instagram"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.6-2.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
                  </svg>
                }
              />
            </li>
            <li>
              <SocialLink
                href={LINKS.social.youtube}
                label="YouTube"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.2 31.2 0 0 0 2 12a31.2 31.2 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 22 12a31.2 31.2 0 0 0-.4-4.8ZM10.4 15.5V8.5l6 3.5-6 3.5Z" />
                  </svg>
                }
              />
            </li>
          </ul>
        </div>
      </div>
      <div className="crai-footer-bottom">
        <span>© {new Date().getFullYear()} Universidad Católica de Pereira. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
};

export default Footer;
