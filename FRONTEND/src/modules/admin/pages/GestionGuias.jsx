import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaWhatsapp } from 'react-icons/fa';
import './GestionGuias.css';

const GestionGuias = () => {
  // DATOS MOCK
  const [guias, setGuias] = useState([
    { 
        id: 1, 
        nombre: 'Carlos Andrés', 
        apellido: 'Turista', 
        correo: 'carlos@turismo.com', 
        telefono: '0991234567',
        idiomas: ['Español', 'Inglés'], 
        estado: 'Activo' 
    },
    { 
        id: 2, 
        nombre: 'Maria Fernanda', 
        apellido: 'Gomez', 
        correo: 'maria@turismo.com', 
        telefono: '0987654321',
        idiomas: ['Español', 'Francés', 'Alemán'], 
        estado: 'Activo' 
    },
    { 
        id: 3, 
        nombre: 'Juan Pablo', 
        apellido: 'Velasco', 
        correo: 'juanp@turismo.com', 
        telefono: '0955555555',
        idiomas: ['Español'], 
        estado: 'Inactivo' 
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar por nombre o apellido
  const filteredGuias = guias.filter(guia => 
    guia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    guia.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if(window.confirm('¿Estás seguro de desvincular a este guía?')) {
        setGuias(guias.filter(g => g.id !== id));
    }
  };

  return (
    <div className="guias-container">
      
      {/* 1. CABECERA */}
      <div className="guias-header">
        <h1 className="guias-title">🧑‍🏫 Gestión de Guías</h1>
        <button className="btn-create">
          <FaPlus /> Registrar Nuevo Guía
        </button>
      </div>

      {/* 2. BUSCADOR */}
      <div className="search-bar">
        <FaSearch color="#666" />
        <input 
            type="text" 
            placeholder="Buscar guía por nombre..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. TABLA DE DATOS */}
      <div className="table-wrapper">
        <table className="guias-table">
            <thead>
                <tr>
                    <th>Perfil</th>
                    <th>Contacto</th>
                    <th>Idiomas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {filteredGuias.length > 0 ? (
                    filteredGuias.map((guia) => (
                        <tr key={guia.id}>
                            {/* Columna Perfil (Avatar + Nombre) */}
                            <td>
                                <div className="guide-profile">
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${guia.nombre}+${guia.apellido}&background=022b3a&color=fff`} 
                                        alt="Avatar" 
                                        className="guide-avatar"
                                    />
                                    <div>
                                        <span className="guide-name">{guia.nombre} {guia.apellido}</span>
                                        <span className="guide-email">{guia.correo}</span>
                                    </div>
                                </div>
                            </td>
                            
                            {/* Columna Contacto */}
                            <td>
                                <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                    <FaWhatsapp color="#25D366" /> 
                                    {guia.telefono}
                                </div>
                            </td>

                            {/* Columna Idiomas (Tags) */}
                            <td>
                                {guia.idiomas.map((idioma, index) => (
                                    <span key={index} className="lang-badge">
                                        {idioma}
                                    </span>
                                ))}
                            </td>

                            {/* Columna Estado */}
                            <td>
                                <span className={`status-badge ${guia.estado === 'Activo' ? 'status-active' : 'status-inactive'}`}>
                                    {guia.estado}
                                </span>
                            </td>

                            {/* Columna Acciones */}
                            <td className="actions-cell">
                                <button className="btn-action btn-edit" title="Editar Información">
                                    <FaEdit />
                                </button>
                                <button 
                                    className="btn-action btn-delete" 
                                    title="Desvincular"
                                    onClick={() => handleDelete(guia.id)}
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                            No se encontraron guías.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      <Link to="/admin" className="back-link">
        <FaArrowLeft style={{ marginRight: '5px' }}/> Volver al Panel
      </Link>
    </div>
  );
};

export default GestionGuias;