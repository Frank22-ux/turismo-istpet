// src/modules/tours/services/tour.service.js
import api from '../../../core/api';

/**
 * Obtiene la lista completa de tours desde el backend.
 */
export const getToursRequest = async () => {
    const response = await api.get('/tours');
    return response.data;
};

/**
 * Obtiene la información detallada de un solo tour mediante su ID.
 * Útil para cargar los datos en el formulario de edición.
 */
export const getTourRequest = async (id) => {
    const response = await api.get(`/tours/${id}`);
    return response.data;
};

/**
 * Crea un nuevo tour enviando un objeto FormData (incluye imágenes).
 */
export const createTourRequest = async (formData) => {
    const response = await api.post('/tours', formData);
    return response.data;
};

/**
 * Actualiza un tour existente.
 * @param {string|number} id - El ID del tour a editar.
 * @param {FormData} formData - Los datos actualizados, incluyendo posibles nuevas imágenes.
 */
export const updateTourRequest = async (id, formData) => {
    const response = await api.put(`/tours/${id}`, formData);
    return response.data;
};

/**
 * Elimina un tour de la base de datos de forma permanente.
 */
export const deleteTourRequest = async (id) => {
    const response = await api.delete(`/tours/${id}`);
    return response.data;
};