import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../../core/api';
import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaSave,
    FaTimes,
    FaIdCard,
    FaInfoCircle,
    FaEdit,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaKey
} from 'react-icons/fa';
import AdminLayout from '../layouts/AdminLayout';
import './CrearCliente.css';

const CrearCliente = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // ID presente = modo edición
    const isEditing = !!id && id !== 'nuevo';

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [formData, setFormData] = useState({
        primer_nombre: '',
        segundo_nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        cedula: '',
        correo: '',
        codigo_pais: '+593',
        numero_celular: '',
        ciudad: '',
        activo: true,
        notas: ''
    });

    // Cargar datos si es modo edición
    useEffect(() => {
        if (!isEditing) return;
        const fetchCliente = async () => {
            try {
                setFetching(true);
                const { data } = await api.get(`/admin/clientes/${id}`);
                if (data) {
                    setFormData({
                        primer_nombre: data.primer_nombre || '',
                        segundo_nombre: data.segundo_nombre || '',
                        apellido_paterno: data.apellido_paterno || '',
                        apellido_materno: data.apellido_materno || '',
                        cedula: data.cedula || '',
                        correo: data.correo || '',
                        codigo_pais: data.codigo_pais || '+593',
                        numero_celular: data.numero_celular || '',
                        ciudad: data.ciudad || '',
                        activo: data.activo !== undefined ? data.activo : true,
                        notas: data.notas || ''
                    });
                }
            } catch (err) {
                setError('No se pudo cargar la información del cliente.');
                console.error(err);
            } finally {
                setFetching(false);
            }
        };
        fetchCliente();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!isEditing) {
                // Validar contraseñas solo en creación
                if (!password || password.length < 6) {
                    setError('La contraseña temporal debe tener al menos 6 caracteres.');
                    setLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError('Las contraseñas no coinciden.');
                    setLoading(false);
                    return;
                }
            }

            if (isEditing) {
                await api.put(`/admin/clientes/${id}`, formData);
            } else {
                const payload = {
                    ...formData,
                    email: formData.correo,
                    password,
                    id_rol: 3
                };
                await api.post('/auth/register', payload);
            }

            setSuccess(true);
            setTimeout(() => navigate('/admin/clientes'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el cliente.`);
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
                    <span className="emoji">{isEditing ? '✏️' : '👤'}</span>
                    {isEditing ? ' Editar Cliente' : ' Nuevo Cliente'}
                </h1>
                <p className="crear-cliente-subtitle">
                    {isEditing
                        ? 'Modifica los datos del cliente seleccionado.'
                        : 'Registra un nuevo cliente para gestionar sus reservas y experiencias.'}
                </p>
            </header>

            {fetching && <div className="alert alert-info"><FaInfoCircle /> Cargando datos del cliente...</div>}
            {success && <div className="alert alert-success"><FaInfoCircle /> ¡{isEditing ? 'Cambios guardados' : 'Cliente creado'} exitosamente! Redirigiendo...</div>}
            {error && <div className="alert alert-error"><FaInfoCircle /> {error}</div>}

            <form className="crear-cliente-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">
                        <FaUser /> Información Personal
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
                                <input
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    placeholder="ejemplo@correo.com"
                                    required
                                    readOnly={isEditing}
                                    style={isEditing ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}}
                                />
                            </div>
                            {isEditing && <small style={{ color: '#64748b' }}>El correo no puede modificarse.</small>}
                        </div>
                    </div>

                    <div className="form-row-3">
                        <div className="form-group">
                            <label>Código País *</label>
                            <input type="text" name="codigo_pais" value={formData.codigo_pais} onChange={handleChange} placeholder="+593" required />
                        </div>
                        <div className="form-group">
                            <label>Número Celular *</label>
                            <div className="input-with-icon-admin">
                                <FaPhone />
                                <input type="tel" name="numero_celular" value={formData.numero_celular} onChange={handleChange} placeholder="987654321" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Ciudad</label>
                            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Ej: Quito" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estado</label>
                            <select name="activo" value={formData.activo ? 'true' : 'false'} onChange={(e) => setFormData(p => ({ ...p, activo: e.target.value === 'true' }))} style={{ maxWidth: '240px' }}>
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sección de Contraseña - solo en modo creación */}
                {!isEditing && (
                    <div className="form-section password-section">
                        <h3 className="section-title">
                            <FaKey /> Contraseña Temporal
                        </h3>
                        <div className="password-note">
                            <FaInfoCircle />
                            <span>Esta contraseña es temporal. El turista podrá cambiarla desde su perfil una vez que inicie sesión en la plataforma.</span>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contraseña *</label>
                                <div className="input-with-icon-admin password-input-wrapper">
                                    <FaLock />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        required={!isEditing}
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowPassword(p => !p)}
                                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirmar Contraseña *</label>
                                <div className="input-with-icon-admin password-input-wrapper">
                                    <FaLock />
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite la contraseña"
                                        required={!isEditing}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password-btn"
                                        onClick={() => setShowConfirm(p => !p)}
                                        title={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    >
                                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <small className="field-error">⚠️ Las contraseñas no coinciden</small>
                                )}
                                {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                                    <small className="field-ok">✅ Las contraseñas coinciden</small>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="form-section">
                    <h3 className="section-title">
                        <FaInfoCircle /> Notas Adicionales

                    </h3>
                    <div className="form-group">
                        <label>Observaciones</label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleChange}
                            placeholder="Detalles adicionales sobre el cliente..."
                            rows="4"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/clientes')}>
                        <FaTimes /> Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading || fetching}>
                        {isEditing ? <FaEdit /> : <FaSave />}
                        {loading ? 'Guardando...' : (isEditing ? ' Guardar Cambios' : ' Crear Cliente')}
                    </button>
                </div>
            </form>
        </div>
    );

    return <AdminLayout>{content}</AdminLayout>;
};

export default CrearCliente;
