import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import api from '../../../core/api';
import './LoginPage.css';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const carouselImages = [
        '/uploads/register/Ecuador-Lago.jpg',
        '/uploads/register/Edificio-Chino.jpg',
        '/uploads/register/Importancia-Cultura.jpg'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselImages.length]);

    // Validar que las contraseñas coincidan
    const password = watch('newPassword');

    const onSubmit = async (data) => {
        try {
            if (data.newPassword !== data.confirmPassword) {
                setError('Las contraseñas no coinciden');
                return;
            }

            setLoading(true);
            setError(null);

            const response = await api.post('/auth/reset-password', {
                token,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword
            });

            setSuccess('✅ ' + response.data.message);
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || 'Error al resetear la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* CARRUSEL */}
            <div className="login-carousel-section">
                <div className="carousel-wrapper">
                    {carouselImages.map((image, index) => (
                        <div 
                            key={index} 
                            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            <img 
                                src={image} 
                                alt={`Slide ${index + 1}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.style.background = 'linear-gradient(135deg, #1F7A8C, #022B3A)';
                                }}
                            />
                        </div>
                    ))}
                    <div className="carousel-overlay"></div>
                </div>
            </div>

            {/* FORMULARIO */}
            <div className="login-form-section">
                <div className="login-content-wrapper">
                    
                    {/* BOTÓN VOLVER */}
                    <Link to="/login" className="back-link">
                        <FaArrowLeft /> Volver a Login
                    </Link>

                    {/* LOGO Y BRANDING */}
                    <div className="login-brand">
                        <div className="login-logo-container">
                            <img src="/uploads/logo.png" alt="Logo" style={{ height: '100%' }} />
                        </div>
                        <h1 className="login-site-name">ECORUT Travels</h1>
                        <p className="login-site-description">
                            Recupera el acceso a tu cuenta
                        </p>
                    </div>

                    {/* TÍTULO DE SECCIÓN */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 className="login-page-title">🔑 Crear Nueva Contraseña</h2>
                        <p className="login-site-description" style={{ marginBottom: 0 }}>Crea una nueva contraseña para tu cuenta</p>
                    </div>

                    {/* MENSAJE DE ERROR */}
                    {error && (
                        <div className="error-msg-box">
                            ❌ {error}
                        </div>
                    )}

                    {/* MENSAJE DE ÉXITO */}
                    {success && (
                        <div className="success-msg-box">
                            {success}
                        </div>
                    )}

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                        
                        {/* NUEVA CONTRASEÑA */}
                        <div className="form-group">
                            <label className="form-label">Nueva Contraseña *</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="form-input" 
                                    {...register("newPassword", { required: true })}
                                    placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 especial"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.newPassword && <span className="error-text">Este campo es requerido</span>}
                        </div>

                        {/* CONFIRMAR CONTRASEÑA */}
                        <div className="form-group">
                            <label className="form-label">Confirmar Contraseña *</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    className="form-input" 
                                    {...register("confirmPassword", { required: true })}
                                    placeholder="Repite tu nueva contraseña"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="error-text">Este campo es requerido</span>}
                        </div>

                        {/* REQUISITOS DE CONTRASEÑA */}
                        <div className="password-requirements">
                            <p className="req-title">📋 Requisitos de la contraseña:</p>
                            <ul>
                                <li className={password?.length >= 8 ? 'valid' : ''}>✓ Mínimo 8 caracteres</li>
                                <li className={/[A-Z]/.test(password) ? 'valid' : ''}>✓ Al menos 1 mayúscula</li>
                                <li className={/\d/.test(password) ? 'valid' : ''}>✓ Al menos 1 número</li>
                                <li className={/[\W_]/.test(password) ? 'valid' : ''}>✓ Al menos 1 carácter especial (.#$)</li>
                            </ul>
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? '⏳ Procesando...' : '🔐 Actualizar Contraseña'}
                        </button>
                    </form>

                    {/* INFORMACIÓN ÚTIL */}
                    <div className="info-box">
                        <p>⚠️ <strong>Nota:</strong> Este enlace es válido por <strong>1 hora</strong>.</p>
                        <p>Si el enlace ha expirado, solicita uno nuevo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
