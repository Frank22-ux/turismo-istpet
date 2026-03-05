import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../core/api';
import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaSave,
    FaTimes,
    FaIdCard,
    FaInfoCircle
} from 'react-icons/fa';
import AdminLayout from '../layouts/AdminLayout';
import './CrearCliente.css';

const CrearCliente = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        primer_nombre: '',
        segundo_nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        cedula: '',
        email: '',
        codigo_pais: '+593',
        numero_celular: '',
        ciudad: '',
        estado: 'Activo',
        notas: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                correo: formData.email, // Map email to correo
                password: 'Password123!', // Temporary password for manual registration
                id_rol: 3 // Turista
            };

            await api.post('/auth/register', payload);

            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/clientes');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el cliente. Por favor intente de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div className="crear-cliente-container">
            <header className="crear-cliente-header">
                <Link to="/admin/clientes" className="btn-volver">
                    <FaArrowLeft /> Volver a Clientes
                </Link>
                <h1 className="crear-cliente-title">
                    <span className="emoji">👤</span> Nuevo Cliente
                </h1>
                <p className="crear-cliente-subtitle">
                    Registra un nuevo cliente para gestionar sus reservas y experiencias.
                </p>
            </header>

            {success && (
                <div className="alert alert-success">
                    <FaInfoCircle /> ¡Cliente creado exitosamente! Redirigiendo...
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    <FaInfoCircle /> {error}
                </div>
            )}

            <form className="crear-cliente-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">
                        <FaUser /> Información Personal (Persona Natural)
                    </h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Primer Nombre *</label>
                            <div className="input-with-icon-admin">
                                <FaIdCard />
                                <input type="text" name="primer_nombre" value={formData.primer_nombre} onChange={handleChange} placeholder="Ej: Juan" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Segundo Nombre</label>
                            <div className="input-with-icon-admin">
                                <FaIdCard />
                                <input type="text" name="segundo_nombre" value={formData.segundo_nombre} onChange={handleChange} placeholder="Ej: Antonio" />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Apellido Paterno *</label>
                            <div className="input-with-icon-admin">
                                <FaIdCard />
                                <input type="text" name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} placeholder="Ej: Pérez" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Apellido Materno</label>
                            <div className="input-with-icon-admin">
                                <FaIdCard />
                                <input type="text" name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} placeholder="Ej: López" />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Cédula de Identidad *</label>
                            <div className="input-with-icon-admin">
                                <FaIdCard />
                                <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Ej: 1723456789" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Correo Electrónico *</label>
                            <div className="input-with-icon-admin">
                                <FaEnvelope />
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ejemplo@correo.com" required />
                            </div>
                        </div>
                    </div>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label>Código País *</label>
                            <input type="text" name="codigo_pais" value={formData.codigo_pais} onChange={handleChange} placeholder="+593" required />
                        </div>
                        <div className="form-group">
                            <label>Número Celular *</label>
                            <input type="tel" name="numero_celular" value={formData.numero_celular} onChange={handleChange} placeholder="987654321" required />
                        </div>
                        <div className="form-group">
                            <label>Ciudad de Residencia</label>
                            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Ej: Quito" required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="estado">Estado Inicial</label>
                            <select id="estado" name="estado" value={formData.estado} onChange={handleChange} style={{ maxWidth: '250px' }}>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">
                        <FaInfoCircle /> Información Adicional
                    </h3>
                    <div className="form-group">
                        <label htmlFor="notas">Notas / Observaciones</label>
                        <textarea
                            id="notas"
                            name="notas"
                            value={formData.notas}
                            onChange={handleChange}
                            placeholder="Detalles adicionales sobre el cliente..."
                            rows="4"
                        ></textarea>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/clientes')}>
                        <FaTimes /> Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <FaSave /> {loading ? 'Guardando...' : 'Crear Cliente'}
                    </button>
                </div>
            </form>
        </div>
    );

    return <AdminLayout>{content}</AdminLayout>;
};

export default CrearCliente;
