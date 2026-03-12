const pool = require('../../config/db');

const GuiaDetalle = {
    // 1. CREAR O ACTUALIZAR DETALLES
    upsert: async (id_usuario, data) => {
        const query = `
            INSERT INTO guias_detalles 
            (id_usuario, idiomas, experiencia_anios, especialidades, bio, disponibilidad, dias_activos, hora_inicio, hora_fin, cv_pdf_url, id_hotel_asignado) 
            VALUES ($1, $2::jsonb, $3, $4::jsonb, $5, $6, $7::jsonb, $8, $9, $10, $11)
            ON CONFLICT (id_usuario) 
            DO UPDATE SET 
                idiomas = $2::jsonb,
                experiencia_anios = $3,
                especialidades = $4::jsonb,
                bio = $5,
                disponibilidad = $6,
                dias_activos = $7::jsonb,
                hora_inicio = $8,
                hora_fin = $9,
                cv_pdf_url = COALESCE($10, guias_detalles.cv_pdf_url),
                id_hotel_asignado = $11
            RETURNING *
        `;

        const values = [
            id_usuario,
            data.idiomas,
            data.experiencia_anios || 0,
            data.especialidades,
            data.bio,
            data.disponibilidad,
            data.dias_activos,
            data.hora_inicio || null,
            data.hora_fin || null,
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
                gd.dias_activos,
                gd.hora_inicio,
                gd.hora_fin,
                COALESCE((
                    SELECT COUNT(*) 
                    FROM tours t 
                    WHERE t.id_guia_asignado = u.id_usuario
                ), 0) as tours,
                COALESCE((
                    SELECT AVG(calificacion) FROM resenas_guias rg WHERE rg.id_guia = u.id_usuario
                ), 0) as calificacion,
                COALESCE((
                    SELECT COUNT(*) FROM resenas_guias rg WHERE rg.id_guia = u.id_usuario
                ), 0) as resenas
            FROM usuarios u
            LEFT JOIN guias_detalles gd ON u.id_usuario = gd.id_usuario
            WHERE u.id_rol = (SELECT id_rol FROM roles WHERE nombre_rol = 'Guía')
            ORDER BY u.id_usuario DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    },

    // 4. OBTENER PERFIL COMPLETO (Usuario + Detalles + Stats)
    getFullProfile: async (id_usuario) => {
        const query = `
            SELECT 
                u.*,
                gd.idiomas,
                gd.experiencia_anios,
                gd.especialidades,
                gd.bio,
                gd.disponibilidad,
                gd.dias_activos,
                gd.hora_inicio,
                gd.hora_fin,
                gd.cv_pdf_url,
                COALESCE((SELECT AVG(calificacion) FROM resenas_guias WHERE id_guia = u.id_usuario), 0) as calificacion,
                COALESCE((SELECT COUNT(*) FROM resenas_guias WHERE id_guia = u.id_usuario), 0) as total_resenas
            FROM usuarios u
            LEFT JOIN guias_detalles gd ON u.id_usuario = gd.id_usuario
            WHERE u.id_usuario = $1
        `;
        const { rows } = await pool.query(query, [id_usuario]);
        return rows[0];
    }
};

module.exports = GuiaDetalle;
