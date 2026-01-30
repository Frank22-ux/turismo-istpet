const pool = require('../../config/db');

const UserModel = {
    // Buscar usuario por correo (Login)
    async findByEmail(email) {
        const query = 'SELECT * FROM usuarios WHERE correo = $1';
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    },

    // Buscar usuario por ID (Para cargar el perfil en el Frontend)
    async findById(id) {
        const query = `
            SELECT id_usuario, primer_nombre, segundo_nombre,
                   apellido_paterno, apellido_materno, correo,
                   telefono, descripcion_perfil, foto_url,
                   pais, ciudad, idiomas, nivel_experiencia,
                   preferencias, viajes_completados, paises_visitados,
                   resenas, insignias
            FROM usuarios WHERE id_usuario = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    // Crear nuevo usuario (Registro)
    async create(user) {
        const {
            primer_nombre, segundo_nombre,
            apellido_paterno, apellido_materno,
            correo, password, telefono, id_rol
        } = user;

        const query = `
            INSERT INTO usuarios (
                primer_nombre, segundo_nombre,
                apellido_paterno, apellido_materno,
                correo, password, telefono, id_rol
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_usuario, primer_nombre, apellido_paterno, correo, id_rol;
        `;

        const values = [
            primer_nombre, segundo_nombre,
            apellido_paterno, apellido_materno,
            correo, password, telefono, id_rol
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    // ACTUALIZAR PERFIL (Soporta cambios parciales, foto, preferencias y password)
    async updateProfile(id, data) {
        const {
            primer_nombre, segundo_nombre, apellido_paterno,
            apellido_materno, telefono, descripcion_perfil,
            foto_url, preferencias, pais, ciudad, idiomas,
            nivel_experiencia, password
        } = data;

        const query = `
            UPDATE usuarios
            SET primer_nombre = $1,
                segundo_nombre = $2,
                apellido_paterno = $3,
                apellido_materno = $4,
                telefono = $5,
                descripcion_perfil = $6,
                foto_url = COALESCE($7, foto_url),
                preferencias = COALESCE($8::jsonb, preferencias),
                pais = COALESCE($9, pais),
                ciudad = COALESCE($10, ciudad),
                idiomas = COALESCE($11, idiomas),
                nivel_experiencia = COALESCE($12, nivel_experiencia),
                password = COALESCE($13, password)
            WHERE id_usuario = $14
            RETURNING id_usuario, primer_nombre, foto_url, pais, ciudad, idiomas, nivel_experiencia, preferencias, viajes_completados, paises_visitados, resenas, insignias;
        `;

        const values = [
            primer_nombre || null,
            segundo_nombre || null,
            apellido_paterno || null,
            apellido_materno || null,
            telefono || null,
            descripcion_perfil || null,
            foto_url || null,
            preferencias ? JSON.stringify(preferencias) : null,
            pais || null,
            ciudad || null,
            idiomas || null,
            nivel_experiencia || null,
            password || null,
            id
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }
};

module.exports = UserModel;