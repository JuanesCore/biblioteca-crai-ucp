// src/components/Dashboard/Table.js 

import React, { useState } from 'react';

// --- DATOS GLOBALES PARA LOS FILTROS RÁPIDOS (Se mantienen) ---
const quickAccessItems = [
    { name: 'Memoria Institucional', key: 'Memoria Institucional', icon: '📖' },
    { name: 'Trabajos de grado', key: 'Trabajos de grado', icon: '🎓' },
    { name: 'Tesis y disertaciones', key: 'Tesis y disertaciones', icon: '📝' },
    { name: 'Producción Editorial', key: 'Producción Editorial', icon: '⚙️' },
    { name: 'Investigación', key: 'Investigación', icon: '🔍' },
    { name: 'Informes de Prácticas', key: 'Informes de Prácticas', icon: '📄' },
    { name: 'Academia', key: 'Academia', icon: '📚' },
];

const Table = ({ employees, handleEdit, handleDelete, setIsAdding, setIsAuthenticated }) => {
    
    // --- ESTADOS ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    // --- LÓGICA DE FILTRADO ---
    const handleFilterClick = (category) => {
        const newFilter = activeFilter === category ? '' : category;
        setActiveFilter(newFilter);
    };

    let filteredEmployees = employees;
    if (activeFilter) {
        filteredEmployees = filteredEmployees.filter(item => item.email === activeFilter); 
    }
    if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredEmployees = filteredEmployees.filter(item =>
            item.firstName.toLowerCase().includes(lowerQuery) ||
            item.lastName.toLowerCase().includes(lowerQuery)
        );
    }
    
    // --- ESTILOS ---
    const iconContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '30px',
        flexWrap: 'wrap',
    };

    const iconButtonStyle = (isActive) => ({
        backgroundColor: isActive ? '#ffc107' : 'rgba(255, 255, 255, 0.9)',
        color: isActive ? 'black' : '#333', 
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '10px',
        width: '120px',
        textAlign: 'center',
        cursor: 'pointer',
        boxShadow: isActive ? '0 0 5px rgba(255, 193, 7, 0.8)' : '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease',
        fontWeight: 'bold',
    });

    // 🛑 ¡NUEVO ESTILO DE FONDO DEGRADADO!
    const headerStyle = {
        padding: '40px 20px',
        textAlign: 'center',
        // Degradado de colores (verde, blanco, rojo suave)
        background: 'linear-gradient(135deg, #28a745, #ffffff, #dc3545)', 
        color: 'black', // Cambiamos el color de texto a negro para contraste
        borderRadius: '8px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '250px',
        textShadow: '0 0 5px rgba(255,255,255,0.8)', // Sombra blanca para el texto
    };
    
    // --- JSX / RENDER ---
    return (
        <div className="container" style={{ backgroundColor: '#f5f5f5' }}>
            {/* --- 1. Diseño Header/Buscador CRAI --- */}
            <div style={headerStyle}>
                
                {/* 🛑 ELIMINAMOS EL LOGO CRAI. Si quieres texto, pon un h2 aquí. */}
                {/* Por ejemplo: <h2 style={{ position: 'absolute', top: '15px', left: '20px', color: 'black' }}>CRAI UCP</h2> */}

                <h1 style={{ fontSize: '2.5em', marginBottom: '20px', marginTop: '50px', color: 'black' }}>BUSCADOR CRAI UCP</h1>

                {/* Buscador central y filtros (Se mantienen sin cambios) */}
                <input
                    type="text"
                    placeholder="Buscar por Título o Autor del Documento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ 
                        padding: '15px 20px', 
                        width: '80%', 
                        maxWidth: '700px', 
                        borderRadius: '5px', 
                        border: '3px solid #ffc107', 
                        fontSize: '1.2em',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        color: '#333',
                    }}
                />

                {/* Íconos de Filtro Rápido (Se mantienen sin cambios) */}
                <div style={iconContainerStyle}> 
                    {quickAccessItems.map((item) => (
                        <div 
                            key={item.name} 
                            style={iconButtonStyle(activeFilter === item.key)} 
                            onClick={() => handleFilterClick(item.key)}
                        >
                            <span style={{ fontSize: '24px' }}>{item.icon}</span>
                            <br />
                            <small>{item.name}</small>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 2. Resultados de la Tabla (Se mantiene sin cambios) --- */}
            <div style={{ padding: '20px', minHeight: '50vh' }}>
                <h2 style={{ marginBottom: '20px', color: '#8B0000' }}>Resultados ({filteredEmployees.length})</h2>

                <table className="striped-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Categoría</th>
                            <th>Año</th>
                            <th>Fecha de Carga</th>
                            <th colSpan={2} className="text-center">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((documento, i) => (
                                <tr key={documento.id}>
                                    <td>{documento.id}</td>
                                    <td>{documento.firstName}</td>
                                    <td>{documento.lastName}</td>
                                    <td>{documento.email}</td>
                                    <td>{documento.salary}</td> 
                                    <td>{documento.date}</td>
                                    
                                    <td className="text-right">
                                        <button
                                            onClick={() => handleEdit(documento.id)}
                                            className="button muted-button"
                                            style={{ backgroundColor: '#ff9900', color: 'white' }}
                                        >
                                            Editar
                                        </button>
                                    </td>
                                    <td className="text-left">
                                        <button
                                            onClick={() => handleDelete(documento.id)}
                                            className="button muted-button"
                                            style={{ backgroundColor: '#dc3545', color: 'white' }}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8}>No se encontraron Documentos que coincidan con los filtros o la búsqueda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;