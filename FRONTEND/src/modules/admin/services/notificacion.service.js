import api from '../../../core/api';

export const getNotificaciones = async () => {
    const response = await api.get('/admin/notificaciones');
    return response.data;
};

export const marcarComoLeida = async (id) => {
    const response = await api.put(`/admin/notificaciones/${id}/leida`);
    return response.data;
};

export const marcarTodasComoLeidas = async () => {
    const response = await api.put('/admin/notificaciones/todas-leidas');
    return response.data;
};

export const eliminarTodas = async () => {
    const response = await api.delete('/admin/notificaciones/todas');
    return response.data;
};
