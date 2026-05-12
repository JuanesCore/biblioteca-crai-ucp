// src/components/Dashboard/Header.js

import React from 'react';
import Logout from '../Logout';
// 🛑 RUTA REVISADA: Dos puntos para subir dos niveles (Header.js -> Dashboard -> components -> src/imagen)
import logoUcp from '../../components/imagen/logo-universidad-crai-full-color.png'; 

const Header = ({ onAddDocumentClick, onAddPersonClick, setIsAuthenticated }) => {
  return (
    <header className="header">
      <div className="title" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Usamos la variable importada */}
        <img 
            src={logoUcp} 
            alt="Logo UCP" 
            style={{ height: '400px', width: '400px', objectFit: 'contain' }} 
        />
        
        <h1>Buscador web de la Biblioteca</h1>
      </div>
      <div className="actions">
          
          <button onClick={onAddPersonClick} style={{ backgroundColor: '#ffc107', color: 'black' }}>
             Registrar Persona
          </button>
          
        <button onClick={onAddDocumentClick}>
            + Nuevo Documento
          </button> 
        
          <Logout setIsAuthenticated={setIsAuthenticated} />
      </div>
    </header>
  );
};

export default Header;