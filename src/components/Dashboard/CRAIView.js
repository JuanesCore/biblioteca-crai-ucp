// src/components/Dashboard/CRAIView.js

import React, { useState, useEffect } from 'react';
import Table from './Table'; // Reusaremos tu componente Table
import Footer from './Footer';
import logoUcp from '../../imagen/logo-ucp.png';
import headerBackground from '../../imagen/general-3.jpg'; 

// Datos de acceso rápido y comunidades (usados para el diseño CRAI)
const quickAccessItems = [
    { name: 'Memoria Institucional', key: 'Memoria Institucional', color: '#66bb6a', icon: '📖' },
    { name: 'Trabajos de grado', key: 'Trabajos de grado', color: '#42a5f5', icon: '🎓' },
    { name: 'Tesis y disertaciones', key: 'Tesis y disertaciones', color: '#9575cd', icon: '📝' },
    { name: 'Producción Editorial', key: 'Producción Editorial', color: '#ab47bc', icon: '⚙️' },
    { name: 'Investigación', key: 'Investigación', color: '#ec407a', icon: '🔍' },
    { name: 'Informes de Prácticas', key: 'Informes de Prácticas', color: '#ef5350', icon: '📄' },
    // ... puedes añadir más
];

const communities = [
    'CRAI', 'Dirección de Investigadores', 'Eventos Institucionales', 
    'Facultad de Arquitectura', 'Facultad de Ciencias Básicas', 
    'Memoria Institucional', 
];

const CRAIView = ({ 
    documents, handleEdit, handleDelete, setIsAdding, 
    setIsAuthenticated, searchQuery, setSearchQuery, 
    activeFilter, setActiveFilter 
}) => {
    
    // --- LÓGICA DE BÚSQUEDA Y FILTRADO (Similar a lo que hicimos antes, pero integrado) ---
    const performSearch = (docs, currentQuery, currentFilter) => {
        let filtered = docs;

        // 1. Filtrar por Categoría (Filtros rápidos)
        if (currentFilter) {
            // Asumo que tu JSON de datos tendrá un campo 'category'
            filtered = filtered.filter(item => item.category === currentFilter); 
        }

        // 2. Filtrar por texto de búsqueda (Barra de búsqueda)
        if (currentQuery) {
            const lowerQuery = currentQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                item.author.toLowerCase().includes(lowerQuery) ||
                item.abstract.toLowerCase().includes(lowerQuery) // Asumo que estos campos existirán
            );
        }

        return filtered;
    };

    const filteredDocuments = performSearch(documents, searchQuery, activeFilter);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // El filtro ya está aplicado en filteredDocuments, solo forzamos la re-renderización
    };
    
    const handleFilterClick = (category) => {
        const newFilter = activeFilter === category ? '' : category;
        setActiveFilter(newFilter);
        // El estado cambiará y el componente se re-renderizará con los nuevos filteredDocuments
    };

    // --- ESTILOS (Mismo CSS en línea del ejercicio anterior) ---
    // (Define aquí los estilos headerStyle, searchBarStyle, iconButtonStyle, etc.)
    const headerStyle = { /* ... */ };
    const searchBarStyle = { /* ... */ };
    const searchInputStyle = { /* ... */ };
    const searchButtonStyle = { /* ... */ };
    const iconContainerStyle = { /* ... */ };
    // ...

    const iconButtonStyle = (color, isActive) => ({
        backgroundColor: isActive ? color : 'white', 
        color: isActive ? 'white' : 'black', 
        border: `3px solid ${color}`,
        borderRadius: '10px',
        padding: '15px 10px',
        width: '100px',
        height: '100px',
        textAlign: 'center',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    });

    return (
        <div style={{ backgroundColor: '#f5f5f5' }}>
            {/* 1. Header estilo CRAI */}
            <div style={headerStyle}>
                <div style={{ position: 'absolute', top: '15px', left: '20px' }}>
                    <img src={logoUcp} alt="Logo UCP" style={{ width: '100px' }} />
                </div>
                
                {/* Botón de Logout/Agregar Empleado */}
                <div style={{ position: 'absolute', top: '15px', right: '20px' }}>
                    <button 
                        onClick={() => setIsAdding(true)} 
                        className="button-craiview" 
                        style={{ backgroundColor: '#ff9900', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px' }}
                    >
                        + Añadir Documento
                    </button>
                    <button 
                        onClick={() => setIsAuthenticated(false)} 
                        className="button-craiview" 
                        style={{ marginLeft: '10px', backgroundColor: '#333', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px' }}
                    >
                        Logout
                    </button>
                </div>

                {/* Buscador central */}
                <form onSubmit={handleSearchSubmit} style={searchBarStyle}>
                    <input
                        type="text"
                        placeholder="Buscar en el repositorio..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={searchInputStyle}
                    />
                    <button type="submit" style={searchButtonStyle}>🔍</button>
                </form>

                {/* Íconos de Filtro Rápido */}
                <div style={iconContainerStyle}>
                    {quickAccessItems.map((item) => (
                        <div 
                            key={item.name} 
                            style={iconButtonStyle(item.color, activeFilter === item.key)} 
                            onClick={() => handleFilterClick(item.key)}
                        >
                            <span style={{ fontSize: '30px' }}>{item.icon}</span>
                            <br />
                            {item.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Sección de Resultados (Usando el componente Table) */}
            <div style={{ padding: '80px 20px 20px 20px', minHeight: '60vh' }}>
                <h2 style={{ marginBottom: '20px' }}>Resultados de Búsqueda ({filteredDocuments.length})</h2>
                
                <Table // Reusamos tu Table.js pero le pasamos los documentos filtrados
                    employees={filteredDocuments} // Renombramos a 'employees' para no modificar Table.js
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    // Ahora Table.js tiene la paginación y la búsqueda de nombre funcionando sobre filteredDocuments
                />
            </div>
            
            <Footer />
        </div>
    );
};

export default CRAIView;