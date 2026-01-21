import { useForm } from 'react-hook-form';
import { registerRequest } from '../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// IMPORTAR CSS
import './RegisterPage.css';

const RegisterPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
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
                                {...register("primer_nombre", { required: true })} 
                            />
                            {errors.primer_nombre && <span className="error-text">Requerido</span>}
                        </div>
                        <div className="form-col">
                            <label className="form-label">Segundo Nombre</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                {...register("segundo_nombre")} 
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
                                {...register("apellido_paterno", { required: true })} 
                            />
                            {errors.apellido_paterno && <span className="error-text">Requerido</span>}
                        </div>
                        <div className="form-col">
                            <label className="form-label">Apellido Materno</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                {...register("apellido_materno")} 
                            />
                        </div>
                    </div>

                    {/* FILA 3: CONTACTO (Columna única) */}
                    <div className="form-group">
                        <label className="form-label">Correo Electrónico *</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            {...register("correo", { required: true })} 
                        />
                        {errors.correo && <span className="error-text">Requerido</span>}
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input 
                            type="tel" 
                            className="form-input" 
                            {...register("telefono")} 
                        />
                    </div>

                    {/* FILA 4: SEGURIDAD (CON OJITO) */}
                    <div className="form-group">
                        <label className="form-label">Contraseña (Mín. 8 caracteres) *</label>
                        <div className="password-wrapper">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-input-password"
                                {...register("password", { required: true, minLength: 8 })} 
                            />
                            <button
                                type="button"
                                className="eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <span className="error-text">Mínimo 8 caracteres</span>}
                    </div>

                    <button type="submit" className="btn-primary">
                        Registrarse
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