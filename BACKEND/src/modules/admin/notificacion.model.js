const pool = require('../../config/db');

const Notificacion = {
    // --- 1. CREAR NOTIFICACIÓN ---
    create: async (data) => {
        const query = `
            INSERT INTO notificaciones 
            (id_usuario_destino, titulo, mensaje, tipo, id_referencia) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const values = [
            data.id_usuario_destino,
            data.titulo,
            data.mensaje,
            data.tipo,
            data.id_referencia
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // --- 2. OBTENER NOTIFICACIONES POR USUARIO ---
    findByUsuario: async (id_usuario) => {
        const query = `
            SELECT * FROM notificaciones 
            WHERE id_usuario_destino = $1 
            ORDER BY fecha_creacion DESC 
            LIMIT 50
        `;
        const { rows } = await pool.query(query, [id_usuario]);
        return rows;
    },

    // --- 3. MARCAR COMO LEÍDA ---
    markAsRead: async (id) => {
        const query = 'UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = $1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // --- 4. MARCAR TODAS COMO LEÍDAS ---
    markAllAsRead: async (id_usuario) => {
        const query = 'UPDATE notificaciones SET leida = TRUE WHERE id_usuario_destino = $1 RETURNING *';
        const { rows } = await pool.query(query, [id_usuario]);
        return rows;
    },

    // --- 5. ELIMINAR TODAS ---
    deleteAll: async (id_usuario) => {
        const query = 'DELETE FROM notificaciones WHERE id_usuario_destino = $1 RETURNING *';
        const { rows } = await pool.query(query, [id_usuario]);
        return rows;
    }
};

module.exports = Notificacion;
