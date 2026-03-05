import api from '../../../core/api';

export const loginRequest = async (credenciales) => {
    // POST /api/auth/login
    const response = await api.post('/auth/login', credenciales);
    return response.data;
};

export const registerRequest = async (datosUsuario) => {
    // POST /api/auth/register
    const response = await api.post('/auth/register', datosUsuario);
    return response.data;
};

export const forgotPasswordRequest = async (correo) => {
    // POST /api/auth/forgot-password
    const response = await api.post('/auth/forgot-password', { correo });
    return response.data;
};

export const resetPasswordRequest = async (token, newPassword, confirmPassword) => {
    // POST /api/auth/reset-password
    const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword
    });
    return response.data;
};

export const verifySessionRequest = async () => {
    // GET /api/auth/verify - Verifica que el token sea válido
    const response = await api.get('/auth/verify');
    return response.data;
};

export const logoutRequest = async () => {
    // POST /api/auth/logout - Cierra sesión en el servidor
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } finally {
        // Limpiar localStorage sin importar si la petición falla
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

