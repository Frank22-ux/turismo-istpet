import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import api from '../../../core/api';
import './LoginPage.css';

const ForgotPasswordPage = () => {
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
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

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await api.post('/auth/forgot-password', {
                correo: data.correo
            });

            setSuccess('📧 Se ha enviado un enlace de recuperación a tu correo (válido por 1 hora)');
            
            // En desarrollo, mostrar el token
            if (response.data.token) {
                console.log('🔐 Token de reset (desarrollo):', response.data.token);
            }

        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || 'Error al procesar la solicitud');
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
                        <h2 className="login-page-title">🔐 Recuperar Contraseña</h2>
                        <p className="login-site-description" style={{ marginBottom: 0 }}>Ingresa tu correo para recibir un enlace de recuperación</p>
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
                            ✅ {success}
                        </div>
                    )}

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                        <div className="form-group">
                            <label className="form-label">📧 Correo Electrónico *</label>
                            <input 
                                type="email" 
                                className="form-input" 
                                {...register("correo", { required: true })}
                                placeholder="tu@correo.com"
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? '⏳ Procesando...' : '📨 Enviar Enlace de Recuperación'}
                        </button>
                    </form>

                    {/* INFORMACIÓN ÚTIL */}
                    <div className="info-box">
                        <p>💡 <strong>Nota:</strong> El enlace de recuperación es válido por <strong>1 hora</strong>.</p>
                        <p>Si no recibes el correo en 5 minutos, revisa la carpeta de spam.</p>
                    </div>

                    {/* ENLACE PARA CREAR CUENTA */}
                    <div className="auth-link">
                        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
