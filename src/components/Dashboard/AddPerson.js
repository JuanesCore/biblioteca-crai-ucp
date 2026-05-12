import React, { useState } from 'react';
import Swal from 'sweetalert2';
// 🛑 IMPORTA TU IMAGEN DE FONDO PARA USUARIOS AQUÍ
import fondoPersonas from '../../components/imagen/hemeroteca-2.jpg'; // ASEGÚRATE DE LA RUTA Y EL NOMBRE

const AddPerson = ({ employees, setEmployees, setIsAdding }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!firstName || !lastName || !email || !password) {
            return Swal.fire({ icon: 'error', title: 'Error!', text: 'Todos los campos son obligatorios.' });
        }
        const id = employees.length + 1;
        const newPerson = {
            id,
            firstName,
            lastName,
            email,
            password, 
            salary: 'N/A', 
            date: new Date().toLocaleDateString('es-CO'),
        };
        setEmployees([...employees, newPerson]);
        setIsAdding(false);
        Swal.fire({ icon: 'success', title: '¡Registrado!', text: `${firstName} ${lastName} ha sido registrado exitosamente.`, showConfirmButton: false, timer: 1500 });
    };
    
    // 🛑 ESTILO DE FONDO CON IMAGEN PARA REGISTRO DE PERSONAS
    const containerStyle = {
        padding: '30px',
        maxWidth: '500px',
        margin: '50px auto',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo semi-transparente para que la imagen se vea
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        backgroundImage: `url(${fondoPersonas})`, // 🛑 USAMOS LA IMAGEN IMPORTADA
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative', // Para el overlay si lo necesitas
        overflow: 'hidden',
    };

    // Estilo para el contenido del formulario para que sea legible sobre la imagen
    const formContentStyle = {
        position: 'relative',
        zIndex: 1, // Para que esté por encima de un posible overlay
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Un fondo blanco semi-transparente para la legibilidad
        padding: '20px',
        borderRadius: '8px',
    };

    return (
        <div style={containerStyle}>
            <div style={formContentStyle}> {/* Envuelve el formulario para darle un fondo legible */}
                <form onSubmit={handleAdd}>
                    <h1 style={{ textAlign: 'center', color: '#8B0000' }}>Registro de Usuarios</h1>
                    
                    <label htmlFor="firstName">Nombre</label>
                    <input id="firstName" type="text" name="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                    
                    <label htmlFor="lastName">Apellido</label>
                    <input id="lastName" type="text" name="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />

                    <label htmlFor="email">Email (Usuario)</label>
                    <input id="email" type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} />
                    
                    <label htmlFor="password">Contraseña</label>
                    <input id="password" type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />

                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <button type="submit" style={{ backgroundColor: '#28a745', color: 'white' }}>Registrar Persona</button>
                        <button className="muted-button" type="button" onClick={() => setIsAdding(false)} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white' }}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPerson;