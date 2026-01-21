import { useForm } from "react-hook-form";
import { loginRequest } from "../services/auth.service";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

// 1. IMPORTAR CONSTANTES DE ROLES
import { ROLES } from "../../../core/constants/roles";

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await loginRequest(data);

      // Guardar sesión
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // ---------------------------------------------------------
      // CORRECCIÓN TÉCNICA AQUÍ:
      // Leemos 'rol' O 'id_rol' para asegurar que funcione siempre.
      // ---------------------------------------------------------
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
      console.error(err);
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Correo:</label>
            <input
              type="email"
              className="form-input"
              {...register("correo", { required: true })}
              placeholder="ejemplo@correo.com"
            />
          </div>
          
          {/* Contraseña */}
          <div className="form-group">
            <label className="form-label">Contraseña:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="form-input-password"
                {...register("password", { required: true })}
                placeholder="********"
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
          </div>

          <button type="submit" className="btn-primary">
            Ingresar
          </button>
        </form>

        <p className="register-text">
            ¿No tienes cuenta? <Link to="/register" className="register-link">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;