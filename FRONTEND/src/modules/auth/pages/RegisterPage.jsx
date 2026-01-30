import { useForm } from 'react-hook-form';
import { registerRequest } from '../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// IMPORTAR CSS
import './RegisterPage.css';

const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    
    // Estado para el carousel de imágenes
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Array de rutas de imágenes - AJUSTA LOS NOMBRES DE TUS ARCHIVOS AQUÍ
    const backgroundImages = [
        '../../../../uploads/registro/imagen1.jpg',
        '../../../../uploads/registro/imagen2.jpg',
        '../../../../uploads/registro/imagen3.jpg',
        '../../../../uploads/registro/imagen4.jpg',
        '../../../../uploads/registro/imagen5.jpg',
        '../../../../uploads/registro/imagen6.jpg',
        '../../../../uploads/registro/imagen7.jpg',
        '../../../../uploads/registro/imagen8.jpg',
        '../../../../uploads/registro/imagen9.jpg',
        '../../../../uploads/registro/imagen10.jpg'
    ];

    // Efecto para cambiar la imagen cada 5 segundos
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                (prevIndex + 1) % backgroundImages.length
            );
        }, 5000); // 5000ms = 5 segundos

        // Limpieza del intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, [backgroundImages.length]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        
        try {
            await registerRequest(data);
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al registrarse');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            {/* Carousel de imágenes de fondo */}
            <div className="background-carousel">
                {backgroundImages.map((image, index) => (
                    <div
                        key={index}
                        className={`background-image ${index === currentImageIndex ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ))}
            </div>

            {/* Indicadores de carousel (opcional - puedes comentar si no los quieres) */}
            <div className="carousel-indicators">
                {backgroundImages.map((_, index) => (
                    <div
                        key={index}
                        className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                    />
                ))}
            </div>

            <div className="register-card">
                <h2 className="register-title">Crear Cuenta</h2>
                
                {error && <div className="error-msg-box">{error}</div>}
                
                <form onSubmit={handleSubmit(onSubmit)}>
                    
                    {/* FILA 1: NOMBRES */}
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Primer Nombre *</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                {...register("primer_nombre", { 
                                    required: "El primer nombre es requerido",
                                    minLength: {
                                        value: 2,
                                        message: "Mínimo 2 caracteres"
                                    }
                                })}
                                disabled={isLoading}
                                placeholder="Juan"
                            />
                            {errors.primer_nombre && (
                                <span className="error-text">{errors.primer_nombre.message}</span>
                            )}
                        </div>
                        <div className="form-col">
                            <label className="form-label">Segundo Nombre</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                {...register("segundo_nombre")}
                                disabled={isLoading}
                                placeholder="Carlos"
                            />
                        </div>
                    </div>

                    {/* FILA 2: APELLIDOS */}
                    <div className="form-row">
                        <div className="form-col">
                            <label className="form-label">Apellido Paterno *</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                {...register("apellido_paterno", { 
                                    required: "El apellido paterno es requerido",
                                    minLength: {
                                        value: 2,
                                        message: "Mínimo 2 caracteres"
                                    }
                                })}
                                disabled={isLoading}
                                placeholder="Pérez"
                            />
                            {errors.apellido_paterno && (
                                <span className="error-text">{errors.apellido_paterno.message}</span>
                            )}
                        </div>
                        <div className="form-col">
                            <label className="form-label">Apellido Materno</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                {...register("apellido_materno")}
                                disabled={isLoading}
                                placeholder="García"
                            />
                        </div>
                    </div>

                    {/* FILA 3: CONTACTO (Columna única) */}
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico *</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            {...register("correo", { 
                                required: "El correo es requerido",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Correo electrónico inválido"
                                }
                            })}
                            disabled={isLoading}
                            placeholder="ejemplo@correo.com"
                        />
                        {errors.correo && (
                            <span className="error-text">{errors.correo.message}</span>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input 
                            type="tel" 
                            className="form-input" 
                            {...register("telefono", {
                                pattern: {
                                    value: /^[0-9]{9,15}$/,
                                    message: "Teléfono inválido (9-15 dígitos)"
                                }
                            })}
                            disabled={isLoading}
                            placeholder="987654321"
                        />
                        {errors.telefono && (
                            <span className="error-text">{errors.telefono.message}</span>
                        )}
                    </div>

                    {/* FILA 4: SEGURIDAD (CON OJITO) */}
                    <div className="form-group">
                        <label className="form-label">Contraseña (Mín. 8 caracteres) *</label>
                        <div className="password-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-input-password"
                                {...register("password", { 
                                    required: "La contraseña es requerida",
                                    minLength: {
                                        value: 8,
                                        message: "Mínimo 8 caracteres"
                                    },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: "Debe incluir mayúscula, minúscula y número"
                                    }
                                })}
                                disabled={isLoading}
                                placeholder="********"
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                disabled={isLoading}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="error-text">{errors.password.message}</span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className={`btn-primary ${isLoading ? 'loading' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p className="login-redirect">
                    ¿Ya tienes cuenta? <Link to="/login" className="login-link">Inicia Sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
