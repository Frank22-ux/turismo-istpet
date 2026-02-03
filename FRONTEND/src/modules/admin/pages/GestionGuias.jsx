import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaArrowLeft, FaEye } from 'react-icons/fa';
import './GestionGuias.css';

const GestionGuias = () => {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Cargar guías desde el Backend
  useEffect(() => {
    const fetchGuias = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:4000/api/usuarios/guias-lista', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        // Formatear idiomas si vienen como string desde la BD
        const formattedData = data.map(g => ({
          ...g,
          idiomas: typeof g.idiomas === 'string' ? g.idiomas.split(',') : (g.idiomas || [])
        }));

        setGuias(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar guías:", error);
        setLoading(false);
      }
    };

    fetchGuias();
  }, []);

  // 2. Filtrado corregido
  const filteredGuias = guias.filter(guia => 
    `${guia.primer_nombre} ${guia.apellido_paterno}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Función de eliminación corregida
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desvincular a este guía?')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:4000/api/usuarios/guia/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Si el servidor confirma el borrado, actualizamos el estado local
          setGuias(prevGuias => prevGuias.filter(g => g.id_guia !== id));
          alert("Guía eliminado exitosamente.");
        } else {
          // Si hay un error (ej. restricción de llave foránea), mostramos el mensaje
          const errorData = await response.json();
          alert(`Error al eliminar: ${errorData.message || "No se pudo completar la acción"}`);
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Ocurrió un error al intentar conectar con el servidor.");
      }
    }
  };

  if (loading) return <div className="loading">Cargando lista de guías...</div>;

  return (
    <div className="guias-container">
      <div className="guias-header">
        <h1 className="guias-title">🧑‍🏫 Gestión de Guías</h1>
        <Link to="/admin/crear-guia" className="btn-create">
          <FaPlus /> Registrar Nuevo Guía
        </Link>
      </div>

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

      <div className="table-wrapper">
        <table className="guias-table">
            <thead>
                <tr>
                    <th>Perfil</th>
                    <th>Especialidad</th>
                    <th>Idiomas</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {filteredGuias.length > 0 ? (
                    filteredGuias.map((guia) => (
                        <tr key={guia.id_guia}>
                            <td>
                                <div className="guide-profile">
                                    <img 
                                        src={guia.foto_url 
                                            ? `http://localhost:4000${guia.foto_url}` 
                                            : `https://ui-avatars.com/api/?name=${guia.primer_nombre}+${guia.apellido_paterno}&background=022b3a&color=fff`} 
                                        alt="Avatar" 
                                        className="guide-avatar"
                                    />
                                    <div>
                                        <span className="guide-name">{guia.primer_nombre} {guia.apellido_paterno}</span>
                                        <span className="guide-email">{guia.correo}</span>
                                    </div>
                                </div>
                            </td>
                            
                            <td><span className="specialty-text">{guia.especialidad || 'No asignada'}</span></td>

                            <td>
                                {guia.idiomas && guia.idiomas.map((idioma, index) => (
                                    <span key={index} className="lang-badge">{idioma.trim()}</span>
                                ))}
                            </td>

                            <td>
                                <span className={`status-badge ${guia.activo ? 'status-active' : 'status-inactive'}`}>
                                    {guia.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>

                            <td className="actions-cell">
                                <Link 
                                    to={`/admin/detalle-guia/${guia.id_guia}`} 
                                    className="btn-action btn-view" 
                                    title="Ver Detalles"
                                >
                                    <FaEye />
                                </Link>

                                <Link 
                                    to={`/admin/editar-guia/${guia.id_guia}`} 
                                    className="btn-action btn-edit" 
                                    title="Editar Información"
                                >
                                    <FaEdit />
                                </Link>
                                
                                <button 
                                    className="btn-action btn-delete" 
                                    title="Eliminar Guía"
                                    onClick={() => handleDelete(guia.id_guia)}
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