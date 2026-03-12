const Notificacion = require('./notificacion.model');

const NotificacionController = {
    // --- 1. OBTENER NOTIFICACIONES POR USUARIO ---
    getNotificaciones: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            const notificaciones = await Notificacion.findByUsuario(id_usuario);
            res.json(notificaciones);
        } catch (error) {
            console.error("❌ Error en getNotificaciones:", error);
            res.status(500).json({ message: 'Error al obtener notificaciones' });
        }
    },

    // --- 2. MARCAR COMO LEÍDA ---
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const updated = await Notificacion.markAsRead(id);
            res.json(updated);
        } catch (error) {
            console.error("❌ Error en markAsRead:", error);
            res.status(500).json({ message: 'Error al marcar como leída' });
        }
    },

    // --- 3. MARCAR TODAS COMO LEÍDAS ---
    markAllAsRead: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            await Notificacion.markAllAsRead(id_usuario);
            res.json({ message: 'Todas las notificaciones marcadas como leídas' });
        } catch (error) {
            console.error("❌ Error en markAllAsRead:", error);
            res.status(500).json({ message: 'Error al marcar todas como leídas' });
        }
    },

    // --- 4. ELIMINAR TODAS ---
    deleteAll: async (req, res) => {
        try {
            const id_usuario = req.user.id;
            await Notificacion.deleteAll(id_usuario);
            res.json({ message: 'Todas las notificaciones eliminadas' });
        } catch (error) {
            console.error("❌ Error en deleteAll:", error);
            res.status(500).json({ message: 'Error al eliminar notificaciones' });
        }
    }
};

module.exports = NotificacionController;
