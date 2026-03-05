const pool = require('../../config/db');

const GuiaDetalle = {
    // 1. CREAR O ACTUALIZAR DETALLES
    upsert: async (id_usuario, data) => {
        const query = `
            INSERT INTO guias_detalles 
            (id_usuario, idiomas, experiencia_anios, especialidades, bio, disponibilidad, cv_pdf_url, id_hotel_asignado) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id_usuario) 
            DO UPDATE SET 
                idiomas = $2,
                experiencia_anios = $3,
                especialidades = $4,
                bio = $5,
                disponibilidad = $6,
                cv_pdf_url = COALESCE($7, guias_detalles.cv_pdf_url),
                id_hotel_asignado = $8
            RETURNING *
        `;

        const values = [
            id_usuario,
            data.idiomas,
            data.experiencia_anios || 0,
            data.especialidades,
            data.bio,
            data.disponibilidad,
            data.cv_pdf_url,
            data.id_hotel_asignado || null
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // 2. BUSCAR POR ID DE USUARIO
    findByUserId: async (id_usuario) => {
        const query = `
            SELECT gd.*, u.primer_nombre, u.apellido_paterno, u.correo
            FROM guias_detalles gd
            JOIN usuarios u ON gd.id_usuario = u.id_usuario
            WHERE gd.id_usuario = $1
        `;
        const { rows } = await pool.query(query, [id_usuario]);
        return rows[0];
    },

    // 3. LISTAR TODOS LOS GUIAS CON SUS DETALLES
    findAllWithNames: async () => {
        const query = `
            SELECT 
                u.id_usuario,
                u.primer_nombre,
                u.segundo_nombre,
                u.apellido_paterno,
                u.apellido_materno,
                u.correo,
                u.codigo_pais,
                u.numero_celular,
                u.foto_url,
                u.activo,
                u.fecha_registro,
                gd.idiomas,
                gd.especialidades,
                gd.bio,
                gd.disponibilidad,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM tours t 
                    WHERE t.id_guia_asignado = u.id_usuario
                ), 0) as tours
            FROM usuarios u
            LEFT JOIN guias_detalles gd ON u.id_usuario = gd.id_usuario
            WHERE u.id_rol = (SELECT id_rol FROM roles WHERE nombre_rol = 'Guía')
            ORDER BY u.id_usuario DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
};

module.exports = GuiaDetalle;
