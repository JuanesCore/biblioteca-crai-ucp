// src/components/Dashboard/Edit.js

import React, { useState } from 'react';
import Swal from 'sweetalert2';

// Lista de categorías para el selector
const quickAccessItems = [
    { name: 'Memoria Institucional', key: 'Memoria Institucional' },
    { name: 'Trabajos de grado', key: 'Trabajos de grado' },
    { name: 'Tesis y disertaciones', key: 'Tesis y disertaciones' },
    { name: 'Producción Editorial', key: 'Producción Editorial' },
    { name: 'Investigación', key: 'Investigación' },
    { name: 'Informes de Prácticas', key: 'Informes de Prácticas' },
];

const Edit = ({ employees, selectedEmployee, setEmployees, setIsEditing }) => {
    const id = selectedEmployee.id;

    // Mantenemos las variables originales, inicializadas con los datos del documento seleccionado
    const [firstName, setFirstName] = useState(selectedEmployee.firstName); // Título
    const [lastName, setLastName] = useState(selectedEmployee.lastName);   // Autor
    const [email, setEmail] = useState(selectedEmployee.email);           // Categoría
    const [salary, setSalary] = useState(selectedEmployee.salary);         // Año
    const [date, setDate] = useState(selectedEmployee.date);             // Fecha de Carga

    const handleUpdate = e => {
        e.preventDefault();

        // Validación con los nombres originales
        if (!firstName || !lastName || !email || !salary || !date) {
            return Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Todos los campos son obligatorios.',
                showConfirmButton: true,
            });
        }

        // Creamos el objeto con la estructura original, pero con datos de documento
        const employee = {
            id,
            firstName, // Título
            lastName,  // Autor
            email,     // Categoría
            salary,    // Año
            date,
        };

        // Lógica de actualización (se mantiene original)
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].id === id) {
                employees.splice(i, 1, employee);
                break;
            }
        }

        localStorage.setItem('employees_data', JSON.stringify(employees));
        setEmployees(employees);
        setIsEditing(false);

        Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: `El documento "${employee.firstName}" ha sido actualizado.`,
            showConfirmButton: false,
            timer: 1500,
        });
    };

    return (
        <div className="container">
            <form onSubmit={handleUpdate}>
                <h1>Editar Documento (CRUD)</h1>
                
                <label htmlFor="firstName">Título del Documento</label>
                <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
                
                <label htmlFor="lastName">Autor(es)</label>
                <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
                
                <label htmlFor="email">Categoría (Filtro Rápido)</label>
                <select id="email" value={email} onChange={e => setEmail(e.target.value)}>
                    <option value="">Seleccione una Categoría</option>
                    {quickAccessItems.map(item => (
                        <option key={item.key} value={item.key}>{item.name}</option>
                    ))}
                </select>
                
                <label htmlFor="salary">Año de Publicación</label>
                {/* Cambiamos el tipo a 'number' para el año */}
                <input id="salary" type="number" value={salary} onChange={e => setSalary(e.target.value)} /> 
                
                <label htmlFor="date">Fecha de Carga</label>
                <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />

                <div style={{ marginTop: '30px' }}>
                    <input type="submit" value="Actualizar Documento" />
                    <input
                        style={{ marginLeft: '12px' }}
                        className="muted-button"
                        type="button"
                        value="Cancel"
                        onClick={() => setIsEditing(false)}
                    />
                </div>
            </form>
        </div>
    );
};

export default Edit;