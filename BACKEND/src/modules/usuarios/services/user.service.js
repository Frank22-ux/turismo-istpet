// src/modules/usuarios/services/user.service.js
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/usuarios';

export const updateProfileRequest = async (formData) => {
    // Es vital pasar el token de seguridad si tu ruta está protegida
    const token = localStorage.getItem('token');
    return await axios.put(`${API_URL}/perfil`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};