import { useForm } from 'react-hook-form';
import { registerRequest } from '../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ROLES } from '../../../core/constants/roles';
import './RegisterPage.css';

const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Array de imágenes del carrusel
    const carouselImages = [
        '/uploads/register/Ecuador-Lago.jpg',
        '/uploads/register/Edificio-Chino.jpg',
        '/uploads/register/Importancia-Cultura.jpg'
    ];

    // Efecto para cambiar las imágenes del carrusel cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [carouselImages.length]);

    // Observar el valor de password para validar confirmación
    const password = watch("password");

    const onSubmit = async (data) => {
        // Validar que las contraseñas coincidan
        if (data.password !== data.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        // Convertir id_rol a número
        data.id_rol = parseInt(data.id_rol);

        // Eliminar campos auxiliares
        delete data.confirmPassword;

        try {
            await registerRequest(data);
            alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al registrarse');
        }
    };

    return (
        <div className="register-container">
            {/* ========== LADO IZQUIERDO: CARRUSEL ========== */}
            <div className="register-carousel-section">
                <div className="carousel-wrapper">
                    {carouselImages.map((image, index) => (
                        <div
                            key={index}
                            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            {/* Intenta cargar la imagen, si falla usa un fondo de color */}
                            <img
                                src={image}
                                alt={`Slide ${index + 1}`}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.style.background = index === 0 ? 'linear-gradient(135deg, #1F7A8C, #022B3A)' :
                                        index === 1 ? 'linear-gradient(135deg, #022B3A, #1F7A8C)' :
                                            'linear-gradient(135deg, #16213e, #1a1a2e)';
                                }}
                            />
                        </div>
                    ))}
                    <div className="carousel-overlay"></div>
                </div>
            </div>

            {/* ========== LADO DERECHO: FORMULARIO ========== */}
            <div className="register-form-section">
                <div className="register-content-wrapper">

                    {/* TÍTULO */}
                    <div className="register-brand">
                        <h2 className="register-title">Crear Cuenta</h2>
                    </div>

                    {/* MENSAJE DE ERROR */}
                    {error && <div className="error-msg-box">{error}</div>}

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit(onSubmit)} className="register-form">

                        {/* FILA 1: PRIMER NOMBRE - SEGUNDO NOMBRE */}
                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label">Primer Nombre *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    {...register("primer_nombre", { required: true })}
                                    placeholder="Juan"
                                />
                                {errors.primer_nombre && <span className="error-text">Este campo es requerido</span>}
                            </div>
                            <div className="form-col">
                                <label className="form-label">Segundo Nombre</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    {...register("segundo_nombre")}
                                    placeholder="Carlos"
                                />
                            </div>
                        </div>

                        {/* FILA 2: APELLIDO PATERNO - APELLIDO MATERNO */}
                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label">Apellido Paterno *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    {...register("apellido_paterno", { required: true })}
                                    placeholder="Pérez"
                                />
                                {errors.apellido_paterno && <span className="error-text">Este campo es requerido</span>}
                            </div>
                            <div className="form-col">
                                <label className="form-label">Apellido Materno</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    {...register("apellido_materno")}
                                    placeholder="González"
                                />
                            </div>
                        </div>

                        {/* CÉDULA DE IDENTIDAD */}
                        <div className="form-group">
                            <label className="form-label">Cédula de Identidad *</label>
                            <input
                                type="text"
                                className="form-input"
                                {...register("cedula", {
                                    required: "La cédula es requerida",
                                    minLength: {
                                        value: 10,
                                        message: "Mínimo 10 caracteres"
                                    }
                                })}
                                placeholder="1712345678"
                            />
                            {errors.cedula && <span className="error-text">{errors.cedula.message}</span>}
                        </div>

                        {/* CORREO ELECTRÓNICO */}
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
                                placeholder="tu@email.com"
                            />
                            {errors.correo && <span className="error-text">{errors.correo.message}</span>}
                        </div>

                        {/* CÓDIGO DE PAÍS - NÚMERO CELULAR */}
                        <div className="phone-row">
                            <div className="country-code-col">
                                <label className="form-label">Código País</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    {...register("codigo_pais", { required: "Requerido" })}
                                    placeholder="+593"
                                    maxLength="4"
                                />
                                {errors.codigo_pais && <span className="error-text">{errors.codigo_pais.message}</span>}
                            </div>
                            <div className="phone-number-col">
                                <label className="form-label">Número Celular *</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    {...register("numero_celular", {
                                        required: "El celular es requerido",
                                        pattern: {
                                            value: /^[0-9]{7,10}$/,
                                            message: "Formato de celular inválido"
                                        }
                                    })}
                                    placeholder="987654321"
                                />
                                {errors.numero_celular && <span className="error-text">{errors.numero_celular.message}</span>}
                            </div>
                        </div>

                        {/* TIPO DE USUARIO */}
                        <div className="form-group">
                            <label className="form-label">¿Qué tipo de usuario eres? *</label>
                            <select
                                className="form-input"
                                {...register("id_rol", { required: "Debes seleccionar un tipo de usuario" })}
                                defaultValue={ROLES.TURISTA}
                            >
                                <option value={ROLES.TURISTA}>Turista</option>
                                <option value={ROLES.GUIA}>Guía Turístico</option>
                            </select>
                            {errors.id_rol && <span className="error-text">{errors.id_rol.message}</span>}
                        </div>

                        {/* FILA 4: CONTRASEÑA - CONFIRMAR CONTRASEÑA */}
                        <div className="form-row">
                            <div className="form-col">
                                <label className="form-label">Contraseña *</label>
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
                                                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                                                message: "Usa: 8+ caracteres, Mayúscula, Número y Especial"
                                            }
                                        })}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <span className="error-text">{errors.password.message}</span>}
                            </div>
                            <div className="form-col">
                                <label className="form-label">Confirmar Contraseña *</label>
                                <div className="password-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-input-password"
                                        {...register("confirmPassword", {
                                            required: "Confirma tu contraseña",
                                            validate: value =>
                                                value === password || "Las contraseñas no coinciden"
                                        })}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
                            </div>
                        </div>

                        {/* BOTÓN DE REGISTRO */}
                        <button type="submit" className="btn-primary">
                            Registrarse
                        </button>
                    </form>

                    {/* LINK DE LOGIN */}
                    <p className="login-redirect">
                        ¿Ya tienes cuenta? <Link to="/login" className="login-link">Inicia Sesión aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;