const pool = require('../../config/db');
const crypto = require('crypto');

const PasswordResetModel = {
    // Crear token de reset
    createResetToken: async (id_usuario) => {
        const token = crypto.randomBytes(32).toString('hex');
        const fecha_expiracion = new Date();
        fecha_expiracion.setHours(fecha_expiracion.getHours() + 1); // Token válido por 1 hora

        const query = `
            INSERT INTO password_reset_tokens (id_usuario, token, fecha_expiracion)
            VALUES ($1, $2, $3)
            RETURNING token, fecha_expiracion
        `;

        const { rows } = await pool.query(query, [id_usuario, token, fecha_expiracion]);
        return rows[0];
    },

    // Validar token
    validateToken: async (token) => {
        const query = `
            SELECT * FROM password_reset_tokens
            WHERE token = $1 
            AND usado = FALSE 
            AND fecha_expiracion > NOW()
        `;

        const { rows } = await pool.query(query, [token]);
        return rows[0];
    },

    // Marcar token como usado
    markTokenAsUsed: async (token) => {
        const query = `
            UPDATE password_reset_tokens
            SET usado = TRUE
            WHERE token = $1
            RETURNING *
        `;

        const { rows } = await pool.query(query, [token]);
        return rows[0];
    },

    // Obtener usuario por token
    getUserByResetToken: async (token) => {
        const query = `
            SELECT u.* FROM usuarios u
            INNER JOIN password_reset_tokens prt ON u.id_usuario = prt.id_usuario
            WHERE prt.token = $1 
            AND prt.usado = FALSE 
            AND prt.fecha_expiracion > NOW()
        `;

        const { rows } = await pool.query(query, [token]);
        return rows[0];
    }
};

module.exports = PasswordResetModel;
