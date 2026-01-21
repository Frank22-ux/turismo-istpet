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