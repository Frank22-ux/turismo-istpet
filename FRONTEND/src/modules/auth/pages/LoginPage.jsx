import { useForm } from "react-hook-form";
import { loginRequest } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

// Importar constantes de roles
import { ROLES } from "../../../core/constants/roles";

const LoginPage = () => {
  console.log('✓ LoginPage se está renderizando');
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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

  const onSubmit = async (data) => {
    try {
      const res = await loginRequest(data);

      // Guardar sesión
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // Debugging completo
      console.log("=== DEBUGGING LOGIN ===");
      console.log("Respuesta completa:", res);
      console.log("Usuario:", res.user);
      console.log("Rol del usuario (rol):", res.user.rol);
      console.log("Rol del usuario (id_rol):", res.user.id_rol);
      console.log("ROLES constantes:", ROLES);
      console.log("======================");

      // Leer el rol del usuario (intentar ambos campos)
      const userRol = res.user.rol || res.user.id_rol;

      console.log("Rol detectado:", userRol); // Para depuración en consola

      switch (userRol) {
        case ROLES.ADMIN:
          navigate("/admin");
          break;
        case ROLES.GUIA:
          navigate("/guia");
          break;
        case ROLES.TURISTA:
          navigate("/home");
          break;
        default:
          console.warn("Rol desconocido, redirigiendo a home.");
          navigate("/home");
      }

    } catch (err) {
      console.error("Error en login:", err);
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="login-container">
      {/* ========== LADO IZQUIERDO: CARRUSEL ========== */}
      <div className="login-carousel-section">
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
      <div className="login-form-section">
        <div className="login-content-wrapper">

          {/* LOGO Y BRANDING */}
          <div className="login-brand">
            <div className="login-logo-container">
              <img src="/uploads/logo.png" alt="Logo" style={{ height: '100%' }} />
            </div>
            <h1 className="login-site-name">ECORUT Travels</h1>
            <p className="login-site-description">
              Descubre experiencias únicas y conecta con guías locales expertos en destinos increíbles
            </p>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && <div className="error-msg">{error}</div>}

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">

            {/* CORREO ELECTRÓNICO */}
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                {...register("correo", { required: true })}
                placeholder="tu@email.com"
              />
            </div>

            {/* CONTRASEÑA */}
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input-password"
                  {...register("password", { required: true })}
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
              <Link to="/forgot-password" className="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* BOTÓN DE INICIO DE SESIÓN */}
            <button type="submit" className="btn-primary">
              Iniciar Sesión
            </button>
          </form>

          {/* MENSAJE DE REGISTRO */}
          <p className="register-text">
            ¿No tienes cuenta aún? <Link to="/register" className="register-link">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;