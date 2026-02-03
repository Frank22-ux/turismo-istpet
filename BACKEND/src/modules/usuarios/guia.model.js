const pool = require('../../config/db');

const Guia = {
    obtenerTodos: async () => {
        // Esta consulta une usuarios con guías y hoteles
        const query = `
            SELECT 
                u.id_usuario, 
                g.id_guia, 
                u.primer_nombre, 
                u.apellido_paterno, 
                u.correo, 
                u.foto_url, 
                u.activo, 
                g.especialidad, 
                u.idiomas, 
                h.nombre as nombre_hotel
            FROM usuarios u
            INNER JOIN guias g ON u.id_usuario = g.id_usuario
            LEFT JOIN hoteles h ON g.id_hotel_asignado = h.id_hotel
            WHERE u.id_rol = 2
            ORDER BY u.id_usuario DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};

module.exports = Guia;