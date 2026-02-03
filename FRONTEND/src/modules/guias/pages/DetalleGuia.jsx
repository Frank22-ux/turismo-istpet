import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaGlobe, FaIdCard, FaPhone, FaCheckCircle, FaAward, FaHotel } from 'react-icons/fa';
import './DetalleGuia.css';

const DetalleGuia = () => {
    const { id } = useParams();
    const [guia, setGuia] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGuiaReal = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:4000/api/usuarios/guia/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'No se pudo obtener la información');
                }

                const data = await response.json();
                
                const formattedData = {
                    ...data,
                    idiomas: data.idiomas 
                        ? (typeof data.idiomas === 'string' ? data.idiomas.split(',') : data.idiomas)
                        : []
                };

                setGuia(formattedData);
            } catch (err) {
                setError(err.message);
            }
        };

        if (id) fetchGuiaReal();
    }, [id]);

    if (error) return (
        <div className="error-container">
            <p className="error-msg">⚠️ Error: {error}</p>
            <Link to="/admin/guias" className="btn-back-main">Volver a la lista</Link>
        </div>
    );

    if (!guia) return <div className="loading">Cargando información del guía...</div>;

    // Función para construir el nombre completo sin espacios extra si faltan campos
    const nombreCompleto = [
        guia.primer_nombre, 
        guia.segundo_nombre, 
        guia.apellido_paterno, 
        guia.apellido_materno
    ].filter(Boolean).join(' ');

    const getLevelClass = (nivel) => {
        if (!nivel) return 'lvl-beginner';
        const n = nivel.toLowerCase();
        if (n === 'experto') return 'lvl-expert';
        if (n === 'intermedio' || n === 'medio') return 'lvl-medium';
        return 'lvl-beginner';
    };

    return (
        <div className="detalle-wrapper">
            <div className="detalle-container">
                <Link to="/admin/guias" className="btn-back-main">
                    <FaArrowLeft /> Volver a la Lista
                </Link>

                <div className="profile-card">
                    <div className="profile-sidebar">
                        <img 
                            src={guia.foto_url 
                                ? `http://localhost:4000${guia.foto_url}` 
                                : `https://ui-avatars.com/api/?name=${guia.primer_nombre}+${guia.apellido_paterno}&background=022b3a&color=fff&size=200`} 
                            alt={nombreCompleto} 
                            className="profile-img"
                        />
                        <div className={`status-pill ${guia.activo ? 'activo' : 'inactivo'}`}>
                            <FaCheckCircle /> {guia.activo ? 'Activo' : 'Inactivo'}
                        </div>
                        
                        <div className={`level-badge ${getLevelClass(guia.nivel_experiencia)}`}>
                            <FaAward /> {guia.nivel_experiencia || 'Principiante'}
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-header">
                            {/* AQUÍ SE MUESTRAN LOS 4 CAMPOS DE NOMBRE */}
                            <h1>{nombreCompleto}</h1>
                            <span className="specialty-tag">{guia.especialidad || 'Especialidad no definida'}</span>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <FaEnvelope className="icon" />
                                <div>
                                    <label>Email</label>
                                    <p>{guia.correo}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaPhone className="icon" />
                                <div>
                                    <label>Teléfono</label>
                                    <p>{guia.telefono || 'Sin teléfono'}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaHotel className="icon" />
                                <div>
                                    <label>Hotel Asignado</label>
                                    <p>{guia.nombre_hotel || 'Sin hotel sede'}</p>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaGlobe className="icon" />
                                <div>
                                    <label>Idiomas</label>
                                    <div className="langs">
                                        {guia.idiomas.length > 0 ? (
                                            guia.idiomas.map((lang, index) => (
                                                <span key={index} className="lang-tag">{lang.trim()}</span>
                                            ))
                                        ) : (
                                            <p>No especificados</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="info-item full-width">
                                <FaIdCard className="icon" />
                                <div>
                                    <label>Biografía Profesional</label>
                                    <p className="bio-text">{guia.bio || 'El guía aún no ha redactado su biografía profesional.'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="profile-footer">
                            <Link to={`/admin/editar-guia/${id}`} className="btn-edit-profile">
                                Editar Información
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetalleGuia;