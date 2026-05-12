import React, { useState } from 'react';
import Swal from 'sweetalert2';
import fondoPersonas from '../../components/imagen/hemeroteca-2.jpg'; // ASEGÚRATE DE LA RUTA Y EL NOMBRE

// Opciones de Categoría (debe coincidir con las categorías de tu tabla)
const categories = [
    "Memoria Institucional", "Trabajos de grado", "Tesis y disertaciones",
    "Producción Editorial", "Investigación", "Informes de Prácticas", "Academia"
];

const AddNewDocument = ({ employees, setEmployees, setIsAdding }) => {
    // Definir los campos de tu tabla (firstName -> Título, lastName -> Autor, email -> Categoría, salary -> Año)
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [year, setYear] = useState(new Date().getFullYear().toString());

    const handleAdd = (e) => {
        e.preventDefault();
        
        // 1. Validación
        if (!title || !author || !category || !year) {
            return Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Todos los campos son obligatorios.',
                showConfirmButton: true,
            });
        }

        // 2. Lógica para crear el nuevo objeto documento
        const id = employees.length + 1;
        const newDocument = {
            id,
            firstName: title,    // Mapeado a Título
            lastName: author,    // Mapeado a Autor
            email: category,     // Mapeado a Categoría
            salary: parseInt(year), // Mapeado a Año (como número)
            date: new Date().toLocaleDateString('es-CO'), // Fecha de Carga
        };

        // 3. Agregar el nuevo registro
        setEmployees([...employees, newDocument]);
        setIsAdding(false); 

        Swal.fire({
            icon: 'success',
            title: '¡Registrado!',
            text: `Documento "${title}" añadido exitosamente.`,
            showConfirmButton: false,
            timer: 1500,
        });
    };

    // 🛑 ESTILO DE FONDO INSTITUCIONAL (Degradado UCP - Verde, Blanco, Rojo)
    const containerStyle = {
        padding: '30px',
        maxWidth: '500px',
        margin: '50px auto',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        background: 'linear-gradient(135deg, #f0f0f0 10%, #ffffff 50%, #28a74530 100%)', // Fondo suave institucional
    };
    
    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
    };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleAdd}>
                <h1 style={{ textAlign: 'center', color: '#28a745' }}>Registro de Nuevo Documento</h1>
                
                <label htmlFor="title">Título del Documento</label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    style={inputStyle}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                
                <label htmlFor="author">Autor/Entidad Responsable</label>
                <input
                    id="author"
                    type="text"
                    name="author"
                    style={inputStyle}
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                />
                
                <label htmlFor="category">Categoría</label>
                <select
                    id="category"
                    name="category"
                    style={inputStyle}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <label htmlFor="year">Año de Publicación</label>
                <input
                    id="year"
                    type="number"
                    name="year"
                    style={inputStyle}
                    value={year}
                    onChange={e => setYear(e.target.value)}
                />

                <div style={{ marginTop: '30px', textAlign: 'right' }}>
                    <button type="submit" style={{ backgroundColor: '#8B0000', color: 'white' }}>
                        Registrar Documento
                    </button>
                    <button
                        className="muted-button"
                        type="button"
                        onClick={() => setIsAdding(false)}
                        style={{ marginLeft: '10px', backgroundColor: '#6c757d', color: 'white' }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNewDocument;