import api from '../core/api'; // Asegúrate de que esta ruta sea correcta según tu proyecto

// Obtener tours
export const getToursRequest = async () => {
    const response = await api.get('/tours');
    return response.data;
};

// Crear tour (CORREGIDO: Sin headers manuales)
export const createTourRequest = async (tourData) => {
    // Axios es inteligente: Si ve que 'tourData' es un FormData,
    // él solito pone el header correct 'multipart/form-data'.
    // NO lo fuerces a ser JSON.
    const response = await api.post('/tours', tourData);
    return response.data;
};

// Eliminar tour
export const deleteTourRequest = async (id) => {
    const response = await api.delete(`/tours/${id}`);
    return response.data;
};